export interface Organization {
  id: string;
  name: string;
  slug: string; // URL-friendly unique identifier (e.g., "acme-corp")
  ownerId: string;
  members: OrganizationMember[];
  inviteCode: string; // Random code for inviting members
  ssoConfig?: SSOConfig;
  mongodbConfig?: MongoDBConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoDBConfig {
  connectionString: string;
  databaseName: string;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrganizationMember {
  userId: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface SSOConfig {
  provider: 'google' | 'github' | 'microsoft' | 'okta' | 'auth0' | 'custom';
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  domain?: string; // For Auth0, Okta
  issuer?: string; // For custom OIDC
  authorizationUrl?: string;
  tokenUrl?: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  ownerId: string;
  ownerEmail: string;
}

export interface InviteLink {
  code: string;
  organizationId: string;
  organizationName: string;
  expiresAt?: Date;
  maxUses?: number;
  usedCount: number;
  createdBy: string;
  createdAt: Date;
}
