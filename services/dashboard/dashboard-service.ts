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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Layout } from 'react-grid-layout';

export interface BlockConfig {
  i: string;
  type: "table" | "kpi" | "chart" | "form";
  collection: string;
  title?: string;
  field?: string;
  aggregation?: string;
  chartType?: string;
}

export interface Dashboard {
  id: string;
  userId: string;
  name: string;
  description?: string;
  layouts: { [key: string]: Layout[] };
  blocks: BlockConfig[];
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class DashboardService {
  private static instance: DashboardService;
  private readonly COLLECTION = 'dashboards';

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Save dashboard to Firestore
   */
  async saveDashboard(
    userId: string,
    dashboardData: {
      id?: string;
      name: string;
      description?: string;
      layouts: { [key: string]: Layout[] };
      blocks: BlockConfig[];
      isDefault?: boolean;
    }
  ): Promise<string> {
    try {
      const dashboardId = dashboardData.id || doc(collection(db, this.COLLECTION)).id;
      const dashboardRef = doc(db, this.COLLECTION, dashboardId);

      // Clean blocks to remove undefined fields
      const cleanedBlocks = dashboardData.blocks.map(block => {
        const cleanBlock: any = {
          i: block.i,
          type: block.type,
          collection: block.collection
        };
        
        if (block.title !== undefined && block.title !== '') {
          cleanBlock.title = block.title;
        }
        if (block.field !== undefined && block.field !== '') {
          cleanBlock.field = block.field;
        }
        if (block.aggregation !== undefined) {
          cleanBlock.aggregation = block.aggregation;
        }
        if (block.chartType !== undefined) {
          cleanBlock.chartType = block.chartType;
        }
        
        return cleanBlock;
      });

      const dashboard: any = {
        id: dashboardId,
        userId,
        name: dashboardData.name,
        layouts: dashboardData.layouts,
        blocks: cleanedBlocks,
        isDefault: dashboardData.isDefault || false,
        createdAt: dashboardData.id ? (await getDoc(dashboardRef)).data()?.createdAt || serverTimestamp() : serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Only add description if it's not undefined
      if (dashboardData.description !== undefined && dashboardData.description !== '') {
        dashboard.description = dashboardData.description;
      }

      await setDoc(dashboardRef, dashboard, { merge: true });
      return dashboardId;
    } catch (error) {
      console.error('Error saving dashboard:', error);
      throw new Error('Failed to save dashboard');
    }
  }

  /**
   * Load dashboard by ID
   */
  async loadDashboard(dashboardId: string): Promise<Dashboard | null> {
    try {
      const dashboardRef = doc(db, this.COLLECTION, dashboardId);
      const dashboardSnap = await getDoc(dashboardRef);

      if (!dashboardSnap.exists()) {
        return null;
      }

      const data = dashboardSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Dashboard;
    } catch (error) {
      console.error('Error loading dashboard:', error);
      throw new Error('Failed to load dashboard');
    }
  }

  /**
   * Get all dashboards for a user
   */
  async getUserDashboards(userId: string): Promise<Dashboard[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const dashboards: Dashboard[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        dashboards.push({
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Dashboard);
      });

      return dashboards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Error getting user dashboards:', error);
      throw new Error('Failed to get dashboards');
    }
  }

  /**
   * Get default dashboard for a user
   */
  async getDefaultDashboard(userId: string): Promise<Dashboard | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('isDefault', '==', true)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const data = querySnapshot.docs[0].data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Dashboard;
    } catch (error) {
      console.error('Error getting default dashboard:', error);
      return null;
    }
  }

  /**
   * Set dashboard as default
   */
  async setDefaultDashboard(userId: string, dashboardId: string): Promise<void> {
    try {
      // Remove default from all user dashboards
      const userDashboards = await this.getUserDashboards(userId);
      
      for (const dashboard of userDashboards) {
        if (dashboard.isDefault) {
          const dashboardRef = doc(db, this.COLLECTION, dashboard.id);
          await updateDoc(dashboardRef, { isDefault: false });
        }
      }

      // Set new default
      const dashboardRef = doc(db, this.COLLECTION, dashboardId);
      await updateDoc(dashboardRef, { 
        isDefault: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error setting default dashboard:', error);
      throw new Error('Failed to set default dashboard');
    }
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(dashboardId: string): Promise<void> {
    try {
      const dashboardRef = doc(db, this.COLLECTION, dashboardId);
      await deleteDoc(dashboardRef);
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw new Error('Failed to delete dashboard');
    }
  }

  /**
   * Update dashboard name/description
   */
  async updateDashboardInfo(
    dashboardId: string,
    updates: { name?: string; description?: string }
  ): Promise<void> {
    try {
      const dashboardRef = doc(db, this.COLLECTION, dashboardId);
      
      // Filter out undefined values
      const cleanUpdates: any = {
        updatedAt: serverTimestamp()
      };
      
      if (updates.name !== undefined) {
        cleanUpdates.name = updates.name;
      }
      
      if (updates.description !== undefined) {
        cleanUpdates.description = updates.description;
      }
      
      await updateDoc(dashboardRef, cleanUpdates);
    } catch (error) {
      console.error('Error updating dashboard info:', error);
      throw new Error('Failed to update dashboard');
    }
  }
}

export const dashboardService = DashboardService.getInstance();
