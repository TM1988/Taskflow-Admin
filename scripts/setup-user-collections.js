/**
 * MongoDB User Collections Setup Script
 * 
 * This script organizes MongoDB collections by user.
 * For now, collections are organized by userId.
 * Later we'll add organization support.
 * 
 * Collection naming pattern: {userId}_{collectionName}
 * Example: user123_tasks, user123_projects
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'taskflow-admin';

async function setupUserCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Get all existing collections
    const collections = await db.listCollections().toArray();
    console.log(`\nFound ${collections.length} existing collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Create user metadata collection if it doesn't exist
    const userMetaExists = collections.some(col => col.name === 'userCollectionsMeta');
    if (!userMetaExists) {
      await db.createCollection('userCollectionsMeta');
      console.log('\nCreated userCollectionsMeta collection');
      
      // Create index on userId for fast lookups
      await db.collection('userCollectionsMeta').createIndex({ userId: 1 });
      console.log('Created index on userId');
    }
    
    // Example: Create sample user collections structure
    console.log('\n=== User Collections Structure ===');
    console.log('Collections will be organized by userId');
    console.log('Pattern: {userId}_{collectionName}');
    console.log('\nTo create a collection for a user:');
    console.log('  await db.createCollection("userId123_tasks")');
    console.log('\nTo query user collections:');
    console.log('  await db.collection("userCollectionsMeta").findOne({ userId: "userId123" })');
    
    // Store metadata about user collections
    const sampleMeta = {
      userId: 'example_user_id',
      collections: ['tasks', 'projects', 'notes'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('\n=== Sample Metadata Structure ===');
    console.log(JSON.stringify(sampleMeta, null, 2));
    
    console.log('\n✅ Setup complete!');
    console.log('\nNext steps:');
    console.log('1. When a user creates a collection via the admin panel, use pattern: {userId}_{collectionName}');
    console.log('2. Store metadata in userCollectionsMeta collection');
    console.log('3. Filter collections by userId when displaying in dashboard');
    
  } catch (error) {
    console.error('Error setting up user collections:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Helper function to get user collections
async function getUserCollections(userId) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Get all collections
    const allCollections = await db.listCollections().toArray();
    
    // Filter by user prefix
    const userPrefix = `${userId}_`;
    const userCollections = allCollections
      .filter(col => col.name.startsWith(userPrefix))
      .map(col => ({
        fullName: col.name,
        name: col.name.replace(userPrefix, ''),
        userId: userId
      }));
    
    return userCollections;
  } finally {
    await client.close();
  }
}

// Helper function to create a user collection
async function createUserCollection(userId, collectionName) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const fullCollectionName = `${userId}_${collectionName}`;
    await db.createCollection(fullCollectionName);
    
    // Update metadata
    await db.collection('userCollectionsMeta').updateOne(
      { userId },
      {
        $addToSet: { collections: collectionName },
        $set: { updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    
    console.log(`Created collection: ${fullCollectionName}`);
    return fullCollectionName;
  } finally {
    await client.close();
  }
}

// Run setup
if (require.main === module) {
  setupUserCollections()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  setupUserCollections,
  getUserCollections,
  createUserCollection
};