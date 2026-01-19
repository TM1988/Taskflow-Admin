import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization, OrganizationMember, CreateOrganizationInput, SSOConfig } from '@/types/organization';

class OrganizationService {
  private static instance: OrganizationService;
  private readonly COLLECTION = 'organizations';
  private readonly USERS_COLLECTION = 'users';

  static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  /**
   * Generate a random invite code
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Check if a slug is available
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const q = query(
      collection(db, this.COLLECTION),
      where('slug', '==', slug)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  }

  /**
   * Create a new organization
   */
  async createOrganization(input: CreateOrganizationInput): Promise<string> {
    try {
      // Check slug availability
      const available = await this.isSlugAvailable(input.slug);
      if (!available) {
        throw new Error('This organization URL is already taken');
      }

      const orgId = doc(collection(db, this.COLLECTION)).id;
      const orgRef = doc(db, this.COLLECTION, orgId);

      const organization: any = {
        id: orgId,
        name: input.name,
        slug: input.slug,
        ownerId: input.ownerId,
        members: [
          {
            userId: input.ownerId,
            email: input.ownerEmail,
            role: 'owner',
            joinedAt: new Date()
          }
        ],
        inviteCode: this.generateInviteCode(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Use batch to create org and update user
      const batch = writeBatch(db);
      batch.set(orgRef, organization);

      const userRef = doc(db, this.USERS_COLLECTION, input.ownerId);
      batch.set(userRef, {
        organizationId: orgId,
        role: 'owner',
        updatedAt: serverTimestamp()
      }, { merge: true });

      await batch.commit();

      return orgId;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganization(orgId: string): Promise<Organization | null> {
    try {
      const orgRef = doc(db, this.COLLECTION, orgId);
      const orgSnap = await getDoc(orgRef);

      if (!orgSnap.exists()) {
        return null;
      }

      const data = orgSnap.data();
      return {
        ...data,
        members: data.members?.map((m: any) => ({
          ...m,
          joinedAt: m.joinedAt?.toDate()
        })),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Organization;
    } catch (error) {
      console.error('Error getting organization:', error);
      throw new Error('Failed to get organization');
    }
  }

  /**
   * Get organization by slug
   */
  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('slug', '==', slug)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs[0].data();
      return {
        ...data,
        members: data.members?.map((m: any) => ({
          ...m,
          joinedAt: m.joinedAt?.toDate()
        })),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Organization;
    } catch (error) {
      console.error('Error getting organization by slug:', error);
      throw new Error('Failed to get organization');
    }
  }

  /**
   * Get organization by invite code
   */
  async getOrganizationByInviteCode(inviteCode: string): Promise<Organization | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('inviteCode', '==', inviteCode)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs[0].data();
      return {
        ...data,
        members: data.members?.map((m: any) => ({
          ...m,
          joinedAt: m.joinedAt?.toDate()
        })),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Organization;
    } catch (error) {
      console.error('Error getting organization by invite code:', error);
      throw new Error('Failed to get organization');
    }
  }

  /**
   * Update organization slug
   */
  async updateSlug(orgId: string, newSlug: string): Promise<void> {
    try {
      const available = await this.isSlugAvailable(newSlug);
      if (!available) {
        throw new Error('This organization URL is already taken');
      }

      const orgRef = doc(db, this.COLLECTION, orgId);
      await updateDoc(orgRef, {
        slug: newSlug,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating slug:', error);
      throw error;
    }
  }

  /**
   * Update organization name
   */
  async updateName(orgId: string, name: string): Promise<void> {
    try {
      const orgRef = doc(db, this.COLLECTION, orgId);
      await updateDoc(orgRef, {
        name,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating name:', error);
      throw new Error('Failed to update organization name');
    }
  }

  /**
   * Add member to organization
   */
  async addMember(orgId: string, userId: string, email: string): Promise<void> {
    try {
      // Check if user is already in another org
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists() && userSnap.data()?.organizationId) {
        throw new Error('User is already in an organization');
      }

      const orgRef = doc(db, this.COLLECTION, orgId);
      const newMember: OrganizationMember = {
        userId,
        email,
        role: 'member',
        joinedAt: new Date()
      };

      // Use batch to update org and user
      const batch = writeBatch(db);
      
      batch.update(orgRef, {
        members: [...(await this.getOrganization(orgId))!.members, newMember] as any,
        updatedAt: serverTimestamp()
      });

      batch.set(userRef, {
        organizationId: orgId,
        role: 'member',
        updatedAt: serverTimestamp()
      }, { merge: true });

      await batch.commit();
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  /**
   * Remove member from organization
   */
  async removeMember(orgId: string, userId: string): Promise<void> {
    try {
      const org = await this.getOrganization(orgId);
      if (!org) {
        throw new Error('Organization not found');
      }

      // Prevent removing owner
      if (org.ownerId === userId) {
        throw new Error('Cannot remove organization owner');
      }

      const batch = writeBatch(db);

      const orgRef = doc(db, this.COLLECTION, orgId);
      const updatedMembers = org.members.filter(m => m.userId !== userId);
      
      batch.update(orgRef, {
        members: updatedMembers as any,
        updatedAt: serverTimestamp()
      });

      const userRef = doc(db, this.USERS_COLLECTION, userId);
      batch.update(userRef, {
        organizationId: null,
        role: null,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Regenerate invite code
   */
  async regenerateInviteCode(orgId: string): Promise<string> {
    try {
      const newCode = this.generateInviteCode();
      const orgRef = doc(db, this.COLLECTION, orgId);
      
      await updateDoc(orgRef, {
        inviteCode: newCode,
        updatedAt: serverTimestamp()
      });

      return newCode;
    } catch (error) {
      console.error('Error regenerating invite code:', error);
      throw new Error('Failed to regenerate invite code');
    }
  }

  /**
   * Update SSO configuration
   */
  async updateSSOConfig(orgId: string, ssoConfig: SSOConfig): Promise<void> {
    try {
      const orgRef = doc(db, this.COLLECTION, orgId);
      await updateDoc(orgRef, {
        ssoConfig,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating SSO config:', error);
      throw new Error('Failed to update SSO configuration');
    }
  }

  /**
   * Delete organization
   */
  async deleteOrganization(orgId: string): Promise<void> {
    try {
      const org = await this.getOrganization(orgId);
      if (!org) {
        throw new Error('Organization not found');
      }

      const batch = writeBatch(db);

      // Delete org
      const orgRef = doc(db, this.COLLECTION, orgId);
      batch.delete(orgRef);

      // Remove org from all members
      for (const member of org.members) {
        const userRef = doc(db, this.USERS_COLLECTION, member.userId);
        batch.update(userRef, {
          organizationId: null,
          role: null,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw new Error('Failed to delete organization');
    }
  }

  /**
   * Get user's organization
   */
  async getUserOrganization(userId: string): Promise<Organization | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data()?.organizationId) {
        return null;
      }

      return this.getOrganization(userSnap.data().organizationId);
    } catch (error) {
      console.error('Error getting user organization:', error);
      return null;
    }
  }
}

export const organizationService = OrganizationService.getInstance();
