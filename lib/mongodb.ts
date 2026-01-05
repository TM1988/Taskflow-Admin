import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'taskflow-admin';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in your .env file');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 5,
  });

  const db = client.db(MONGODB_DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

// Schema discovery and inference
export async function discoverCollections() {
  const db = await getDatabase();
  const collections = await db.listCollections().toArray();
  
  const collectionSchemas = await Promise.all(
    collections.map(async (collection) => {
      const collectionName = collection.name;
      
      // Sample documents to infer schema
      const samples = await db.collection(collectionName).find().limit(100).toArray();
      
      const schema = inferSchema(samples);
      
      // Get collection stats using collStats command
      const statsResult = await db.command({ collStats: collectionName });
      
      return {
        name: collectionName,
        schema,
        count: statsResult.count || 0,
        size: statsResult.size || 0,
        avgObjSize: statsResult.avgObjSize || 0,
      };
    })
  );
  
  return collectionSchemas;
}

// Infer schema from sample documents
function inferSchema(documents: any[]) {
  if (documents.length === 0) return {};
  
  const schemaMap: Record<string, any> = {};
  
  documents.forEach(doc => {
    Object.keys(doc).forEach(key => {
      const value = doc[key];
      const type = getType(value);
      
      if (!schemaMap[key]) {
        schemaMap[key] = {
          type: new Set([type]),
          nullable: false,
          examples: [],
        };
      } else {
        schemaMap[key].type.add(type);
      }
      
      if (value === null || value === undefined) {
        schemaMap[key].nullable = true;
      }
      
      // Store a few examples
      if (schemaMap[key].examples.length < 3 && value !== null && value !== undefined) {
        schemaMap[key].examples.push(value);
      }
    });
  });
  
  // Convert Sets to Arrays for JSON serialization
  const schema: Record<string, any> = {};
  Object.keys(schemaMap).forEach(key => {
    schema[key] = {
      types: Array.from(schemaMap[key].type),
      nullable: schemaMap[key].nullable,
      examples: schemaMap[key].examples,
    };
  });
  
  return schema;
}

function getType(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (typeof value === 'object' && value._bsontype === 'ObjectId') return 'ObjectId';
  if (typeof value === 'object') return 'object';
  return typeof value;
}

// Get collection data with pagination
export async function getCollectionData(
  collectionName: string,
  options: {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    filter?: Record<string, any>;
  } = {}
) {
  const db = await getDatabase();
  const collection = db.collection(collectionName);
  
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    collection
      .find(options.filter || {})
      .sort(options.sort || { _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(options.filter || {}),
  ]);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// CRUD operations
export async function insertDocument(collectionName: string, document: any) {
  const db = await getDatabase();
  const result = await db.collection(collectionName).insertOne(document);
  return result;
}

export async function updateDocument(
  collectionName: string,
  filter: any,
  update: any
) {
  const db = await getDatabase();
  const result = await db.collection(collectionName).updateOne(filter, { $set: update });
  return result;
}

export async function deleteDocument(collectionName: string, filter: any) {
  const db = await getDatabase();
  const result = await db.collection(collectionName).deleteOne(filter);
  return result;
}

// Bulk operations
export async function bulkUpdateDocuments(
  collectionName: string,
  filter: any,
  update: any
) {
  const db = await getDatabase();
  const result = await db.collection(collectionName).updateMany(filter, { $set: update });
  return result;
}

export async function bulkDeleteDocuments(
  collectionName: string,
  filter: any
) {
  const db = await getDatabase();
  const result = await db.collection(collectionName).deleteMany(filter);
  return result;
}

// Aggregation for KPIs
export async function aggregateData(
  collectionName: string,
  pipeline: any[]
) {
  const db = await getDatabase();
  const result = await db.collection(collectionName).aggregate(pipeline).toArray();
  return result;
}
