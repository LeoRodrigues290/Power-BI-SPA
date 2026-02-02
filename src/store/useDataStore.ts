
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, getDocs, deleteDoc, doc, Timestamp, query, orderBy, limit, getAggregateFromServer, sum, count, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type SheetData } from '@/lib/excel';
import { useAuthStore } from './useAuthStore';

export interface Project {
  id: string;
  name: string;
  createdAt: Timestamp;
  totalFailures: number;
  sheets: SheetData[];
}

interface DataState {
  projects: Project[];
  lastProjectsFetch: number;

  // Stats for Dashboard (separate from loaded projects list)
  stats: {
    totalProjects: number;
    totalFailures: number;
    usersCount: number;
  };
  lastStatsFetch: number;

  loading: boolean;

  fetchProjects: (force?: boolean) => Promise<void>;
  fetchStats: (force?: boolean) => Promise<void>;
  deleteProject: (id: string, failures: number) => Promise<void>;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      projects: [],
      lastProjectsFetch: 0,
      stats: { totalProjects: 0, totalFailures: 0, usersCount: 0 },
      lastStatsFetch: 0,
      loading: false,

      fetchProjects: async (force = false) => {
        const { lastProjectsFetch, projects } = get();
        const now = Date.now();
        const CACHE_DURATION = 1000 * 60 * 5;

        if (!force && projects.length > 0 && (now - lastProjectsFetch < CACHE_DURATION)) {
          return;
        }

        set({ loading: true });
        try {
          // Dynamically build query based on permissions
          const { user } = useAuthStore.getState();
          let q;

          if (!user) {
            set({ projects: [] }); // No user, no data
            return;
          }

          if (user.role === 'admin' || user.accessAll) {
            // Admin sees all (limit 20)
            q = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(20));
          } else if (user.allowedProjects && user.allowedProjects.length > 0) {
            // Restricted user: must filter by IDs to pass security rules
            // Firestore 'in' limitation: max 10. Taking first 10 for safety in this demo.
            const safeProjectIds = user.allowedProjects.slice(0, 10);
            q = query(collection(db, "projects"), where(documentId(), 'in', safeProjectIds));
          } else {
            // User exists but has no access
            set({ projects: [] });
            return;
          }

          const snapshot = await getDocs(q);

          const fetchedProjects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];

          set({ projects: fetchedProjects, lastProjectsFetch: now });
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          set({ loading: false });
        }
      },

      fetchStats: async (force = false) => {
        const { lastStatsFetch, stats } = get();
        const now = Date.now();
        const CACHE_DURATION = 1000 * 60 * 15; // 15 min cache for stats

        if (!force && stats.totalProjects > 0 && (now - lastStatsFetch < CACHE_DURATION)) {
          return;
        }

        // Don't set global loading here to avoid flickering list if just updating stats
        try {
          const projectsColl = collection(db, "projects");

          // Aggregation Queries: Very cheap (1 read per 1000 docs)
          const snapshot = await getAggregateFromServer(projectsColl, {
            count: count(),
            tFailures: sum('totalFailures')
          });

          // Mock user count or fetch if needed
          // const userCountSnap = await getCountFromServer(collection(db, 'users')); 
          // set userCount = userCountSnap.data().count

          set({
            stats: {
              totalProjects: snapshot.data().count,
              totalFailures: snapshot.data().tFailures,
              usersCount: 5 // Mock for now or restricted
            },
            lastStatsFetch: now
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
          // Fallback to local calculation if aggregation fails (e.g., requires index creation)
          // or just keep old stats
        }
      },

      deleteProject: async (id: string, failures: number) => {
        try {
          await deleteDoc(doc(db, "projects", id));
          set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            stats: {
              ...state.stats,
              totalProjects: Math.max(0, state.stats.totalProjects - 1),
              totalFailures: Math.max(0, state.stats.totalFailures - failures)
            }
          }));
        } catch (error) {
          console.error("Error deleting project:", error);
          throw error;
        }
      },
    }),
    {
      name: 'inkybi-data-storage',
      partialize: (state) => ({
        projects: state.projects,
        lastProjectsFetch: state.lastProjectsFetch,
        stats: state.stats,
        lastStatsFetch: state.lastStatsFetch
      }),
    }
  )
);

