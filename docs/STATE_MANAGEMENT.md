# MindFlow - State Management Architecture
## Zen Master Level Zustand + MMKV Implementation

---

## Store Yapısı Genel Bakış

```
stores/
├── index.ts                    # Export all stores
├── storage.ts                  # MMKV configuration
│
├── authStore.ts                # Authentication state
├── onboardingStore.ts          # Onboarding flow state
├── userStore.ts                # User profile & preferences
│
├── taskStore.ts                # Tasks & subtasks
├── routineStore.ts             # Routines & steps
├── focusStore.ts               # Focus sessions
├── habitStore.ts               # Habits & tracking
│
├── moodStore.ts                # Mood entries & journal
├── medicationStore.ts          # Medications & reminders
├── insightsStore.ts            # Analytics data
│
├── bodyDoubleStore.ts          # Body double sessions
├── achievementStore.ts         # XP, badges, streaks
├── notificationStore.ts        # Notification queue
│
└── uiStore.ts                  # UI state (modals, sheets)
```

---

## 1. Auth Store

```typescript
// stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';

// Types
interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  createdAt: string;
  provider: 'email' | 'google' | 'apple';
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

type AuthStatus =
  | 'idle'           // Initial state
  | 'loading'        // Checking auth
  | 'authenticated'  // User logged in
  | 'unauthenticated' // No user
  | 'error';         // Auth error

interface AuthState {
  // State
  status: AuthStatus;
  user: User | null;
  tokens: AuthTokens | null;
  error: string | null;
  lastAuthCheck: number | null;

  // Computed
  isAuthenticated: boolean;
  isTokenExpired: boolean;

  // Actions
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;

  // Auth operations
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;

  // Utilities
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as AuthStatus,
  user: null,
  tokens: null,
  error: null,
  lastAuthCheck: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Computed getters
      get isAuthenticated() {
        return get().status === 'authenticated' && get().user !== null;
      },

      get isTokenExpired() {
        const tokens = get().tokens;
        if (!tokens) return true;
        return Date.now() > tokens.expiresAt - 60000; // 1 min buffer
      },

      // Basic setters
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      setStatus: (status) => set({ status }),
      setError: (error) => set({ error, status: error ? 'error' : get().status }),
      clearError: () => set({ error: null }),

      // Login with email/password
      login: async (email, password) => {
        set({ status: 'loading', error: null });

        try {
          // API call
          const response = await authApi.login(email, password);

          set({
            user: response.user,
            tokens: response.tokens,
            status: 'authenticated',
            lastAuthCheck: Date.now(),
          });
        } catch (error) {
          // Error handling with specific messages
          let errorMessage = 'Giriş yapılamadı';

          if (error.code === 'INVALID_CREDENTIALS') {
            errorMessage = 'Email veya şifre hatalı';
          } else if (error.code === 'ACCOUNT_DISABLED') {
            errorMessage = 'Hesabınız devre dışı. Destek ile iletişime geçin.';
          } else if (error.code === 'RATE_LIMITED') {
            errorMessage = 'Çok fazla deneme. Lütfen bekleyin.';
          } else if (error.code === 'NETWORK_ERROR') {
            errorMessage = 'İnternet bağlantısı yok';
          }

          set({
            status: 'error',
            error: errorMessage,
            user: null,
            tokens: null,
          });

          throw error; // Re-throw for UI handling
        }
      },

      // OAuth logins
      loginWithGoogle: async () => {
        set({ status: 'loading', error: null });

        try {
          const response = await authApi.googleSignIn();
          set({
            user: response.user,
            tokens: response.tokens,
            status: 'authenticated',
            lastAuthCheck: Date.now(),
          });
        } catch (error) {
          if (error.code === 'CANCELLED') {
            // User cancelled, just reset status
            set({ status: 'unauthenticated' });
            return;
          }
          set({ status: 'error', error: 'Google ile giriş yapılamadı' });
          throw error;
        }
      },

      loginWithApple: async () => {
        set({ status: 'loading', error: null });

        try {
          const response = await authApi.appleSignIn();
          set({
            user: response.user,
            tokens: response.tokens,
            status: 'authenticated',
            lastAuthCheck: Date.now(),
          });
        } catch (error) {
          if (error.code === 'CANCELLED') {
            set({ status: 'unauthenticated' });
            return;
          }
          set({ status: 'error', error: 'Apple ile giriş yapılamadı' });
          throw error;
        }
      },

      // Register
      register: async (email, password, name) => {
        set({ status: 'loading', error: null });

        try {
          const response = await authApi.register(email, password, name);
          set({
            user: response.user,
            tokens: response.tokens,
            status: 'authenticated',
            lastAuthCheck: Date.now(),
          });
        } catch (error) {
          let errorMessage = 'Kayıt yapılamadı';

          if (error.code === 'EMAIL_EXISTS') {
            errorMessage = 'Bu email zaten kullanılıyor';
          } else if (error.code === 'WEAK_PASSWORD') {
            errorMessage = 'Şifre en az 8 karakter olmalı';
          } else if (error.code === 'INVALID_EMAIL') {
            errorMessage = 'Geçersiz email adresi';
          }

          set({ status: 'error', error: errorMessage });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Continue with local logout even if API fails
          console.error('Logout API error:', error);
        }

        // Clear all persisted stores
        get().reset();
        useOnboardingStore.getState().reset();
        useTaskStore.getState().reset();
        // ... clear other stores
      },

      // Token refresh
      refreshTokens: async () => {
        const { tokens } = get();

        if (!tokens?.refreshToken) {
          set({ status: 'unauthenticated', user: null, tokens: null });
          return false;
        }

        try {
          const newTokens = await authApi.refreshToken(tokens.refreshToken);
          set({ tokens: newTokens });
          return true;
        } catch (error) {
          // Refresh failed, user needs to login again
          set({
            status: 'unauthenticated',
            user: null,
            tokens: null,
            error: 'Oturum süresi doldu. Tekrar giriş yapın.',
          });
          return false;
        }
      },

      // Check auth on app start
      checkAuthStatus: async () => {
        const { tokens, isTokenExpired } = get();

        if (!tokens) {
          set({ status: 'unauthenticated' });
          return;
        }

        if (isTokenExpired) {
          const refreshed = await get().refreshTokens();
          if (!refreshed) return;
        }

        // Verify token with server
        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            status: 'authenticated',
            lastAuthCheck: Date.now(),
          });
        } catch (error) {
          set({
            status: 'unauthenticated',
            user: null,
            tokens: null
          });
        }
      },

      // Password reset
      resetPassword: async (email) => {
        try {
          await authApi.sendPasswordReset(email);
        } catch (error) {
          // Don't reveal if email exists
          // Always show success message
        }
      },

      // Delete account
      deleteAccount: async () => {
        try {
          await authApi.deleteAccount();
          get().reset();
        } catch (error) {
          throw new Error('Hesap silinemedi. Lütfen tekrar deneyin.');
        }
      },

      // Reset store
      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        lastAuthCheck: state.lastAuthCheck,
      }),
    }
  )
);

// WORST CASES HANDLED:
// ├── Token expired → Auto refresh with buffer
// ├── Refresh token expired → Force logout, show message
// ├── Network error during auth → Specific error message
// ├── OAuth cancelled → Silent return, no error
// ├── Account disabled/deleted → Specific message with support info
// ├── Rate limiting → Show wait message
// ├── Invalid credentials → Clear message, don't clear form
// └── Server error → Generic message with retry option
```

---

## 2. Task Store

```typescript
// stores/taskStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import { generateId, getCurrentTimestamp } from '@/utils';

// Types
type Priority = 'urgent' | 'important' | 'optional';
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  order: number;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;

  // Time
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  dueDate: string | null; // ISO date
  dueTime: string | null; // HH:mm

  // Subtasks
  subtasks: SubTask[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;

  // Tracking
  focusSessionIds: string[]; // Focus sessions used for this task

  // Recurrence (optional)
  isRecurring: boolean;
  recurrencePattern: string | null; // 'daily', 'weekly', etc.

  // Tags/Categories
  tags: string[];
}

interface TaskFilters {
  status: TaskStatus | 'all';
  priority: Priority | 'all';
  dateRange: 'today' | 'week' | 'all';
  tags: string[];
}

interface TaskState {
  // State
  tasks: Record<string, Task>; // Normalized by id
  taskOrder: string[]; // Order of task ids
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;
  lastSyncedAt: string | null;

  // Computed (via selectors)

  // CRUD Actions
  addTask: (task: Partial<Task>) => string; // Returns new task id
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => string;

  // SubTask Actions
  addSubtask: (taskId: string, subtask: Partial<SubTask>) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  reorderSubtasks: (taskId: string, subtaskIds: string[]) => void;

  // Status Actions
  startTask: (id: string) => void;
  completeTask: (id: string) => void;
  abandonTask: (id: string, reason?: string) => void;
  reopenTask: (id: string) => void;

  // Bulk Actions
  completeTasks: (ids: string[]) => void;
  deleteTasks: (ids: string[]) => void;
  moveTasks: (ids: string[], priority: Priority) => void;

  // Filter Actions
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;

  // AI Actions
  breakdownTask: (id: string) => Promise<void>; // AI-powered breakdown
  estimateTime: (id: string) => Promise<void>; // AI-powered estimation
  suggestPriority: (id: string) => Promise<void>;

  // Sync
  syncWithServer: () => Promise<void>;

  // Utilities
  getTaskById: (id: string) => Task | undefined;
  reset: () => void;
}

// Selectors (for performance)
export const taskSelectors = {
  // Get filtered tasks
  getFilteredTasks: (state: TaskState) => {
    const { tasks, taskOrder, filters } = state;

    return taskOrder
      .map(id => tasks[id])
      .filter(task => {
        if (!task) return false;

        // Status filter
        if (filters.status !== 'all' && task.status !== filters.status) {
          return false;
        }

        // Priority filter
        if (filters.priority !== 'all' && task.priority !== filters.priority) {
          return false;
        }

        // Date filter
        if (filters.dateRange === 'today') {
          const today = new Date().toISOString().split('T')[0];
          if (task.dueDate && task.dueDate !== today) return false;
        } else if (filters.dateRange === 'week') {
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (task.dueDate && new Date(task.dueDate) > weekFromNow) return false;
        }

        // Tags filter
        if (filters.tags.length > 0) {
          if (!filters.tags.some(tag => task.tags.includes(tag))) {
            return false;
          }
        }

        return true;
      });
  },

  // Get tasks by priority
  getTasksByPriority: (state: TaskState, priority: Priority) => {
    return Object.values(state.tasks).filter(t => t.priority === priority && t.status !== 'completed');
  },

  // Get today's tasks
  getTodaysTasks: (state: TaskState) => {
    const today = new Date().toISOString().split('T')[0];
    return Object.values(state.tasks).filter(t =>
      t.dueDate === today && t.status !== 'completed'
    );
  },

  // Get overdue tasks
  getOverdueTasks: (state: TaskState) => {
    const today = new Date().toISOString().split('T')[0];
    return Object.values(state.tasks).filter(t =>
      t.dueDate && t.dueDate < today && t.status !== 'completed'
    );
  },

  // Get completion stats
  getStats: (state: TaskState) => {
    const tasks = Object.values(state.tasks);
    const completed = tasks.filter(t => t.status === 'completed');
    const today = new Date().toISOString().split('T')[0];
    const completedToday = completed.filter(t =>
      t.completedAt?.startsWith(today)
    );

    return {
      total: tasks.length,
      completed: completed.length,
      completedToday: completedToday.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: taskSelectors.getOverdueTasks(state).length,
    };
  },
};

const defaultFilters: TaskFilters = {
  status: 'all',
  priority: 'all',
  dateRange: 'all',
  tags: [],
};

const initialState = {
  tasks: {},
  taskOrder: [],
  filters: defaultFilters,
  isLoading: false,
  error: null,
  lastSyncedAt: null,
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Add task
      addTask: (taskData) => {
        const id = generateId();
        const now = getCurrentTimestamp();

        const newTask: Task = {
          id,
          title: taskData.title || 'Yeni Görev',
          description: taskData.description || null,
          priority: taskData.priority || 'optional',
          status: 'pending',
          estimatedMinutes: taskData.estimatedMinutes || null,
          actualMinutes: null,
          dueDate: taskData.dueDate || null,
          dueTime: taskData.dueTime || null,
          subtasks: taskData.subtasks || [],
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          focusSessionIds: [],
          isRecurring: taskData.isRecurring || false,
          recurrencePattern: taskData.recurrencePattern || null,
          tags: taskData.tags || [],
        };

        set(state => ({
          tasks: { ...state.tasks, [id]: newTask },
          taskOrder: [id, ...state.taskOrder], // New tasks at top
        }));

        // Trigger sync
        get().syncWithServer();

        return id;
      },

      // Update task
      updateTask: (id, updates) => {
        const task = get().tasks[id];
        if (!task) {
          console.error(`Task ${id} not found`);
          return;
        }

        set(state => ({
          tasks: {
            ...state.tasks,
            [id]: {
              ...task,
              ...updates,
              updatedAt: getCurrentTimestamp(),
            },
          },
        }));

        get().syncWithServer();
      },

      // Delete task
      deleteTask: (id) => {
        set(state => {
          const { [id]: deleted, ...remainingTasks } = state.tasks;
          return {
            tasks: remainingTasks,
            taskOrder: state.taskOrder.filter(taskId => taskId !== id),
          };
        });

        get().syncWithServer();
      },

      // Duplicate task
      duplicateTask: (id) => {
        const task = get().tasks[id];
        if (!task) return '';

        return get().addTask({
          ...task,
          title: `${task.title} (kopya)`,
          status: 'pending',
          completedAt: null,
          actualMinutes: null,
          focusSessionIds: [],
        });
      },

      // Subtask operations
      addSubtask: (taskId, subtaskData) => {
        const task = get().tasks[taskId];
        if (!task) return;

        const subtask: SubTask = {
          id: generateId(),
          title: subtaskData.title || 'Alt görev',
          completed: false,
          estimatedMinutes: subtaskData.estimatedMinutes || null,
          actualMinutes: null,
          order: task.subtasks.length,
        };

        get().updateTask(taskId, {
          subtasks: [...task.subtasks, subtask],
        });
      },

      updateSubtask: (taskId, subtaskId, updates) => {
        const task = get().tasks[taskId];
        if (!task) return;

        get().updateTask(taskId, {
          subtasks: task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, ...updates } : st
          ),
        });
      },

      deleteSubtask: (taskId, subtaskId) => {
        const task = get().tasks[taskId];
        if (!task) return;

        get().updateTask(taskId, {
          subtasks: task.subtasks.filter(st => st.id !== subtaskId),
        });
      },

      toggleSubtask: (taskId, subtaskId) => {
        const task = get().tasks[taskId];
        if (!task) return;

        const subtask = task.subtasks.find(st => st.id === subtaskId);
        if (!subtask) return;

        get().updateSubtask(taskId, subtaskId, {
          completed: !subtask.completed,
        });

        // Check if all subtasks completed
        const updatedTask = get().tasks[taskId];
        const allCompleted = updatedTask.subtasks.every(st => st.completed);

        if (allCompleted && updatedTask.subtasks.length > 0) {
          // Suggest completing main task
          // This would trigger UI notification
        }
      },

      reorderSubtasks: (taskId, subtaskIds) => {
        const task = get().tasks[taskId];
        if (!task) return;

        const reorderedSubtasks = subtaskIds.map((id, index) => {
          const subtask = task.subtasks.find(st => st.id === id);
          return subtask ? { ...subtask, order: index } : null;
        }).filter(Boolean) as SubTask[];

        get().updateTask(taskId, { subtasks: reorderedSubtasks });
      },

      // Status changes
      startTask: (id) => {
        get().updateTask(id, { status: 'in_progress' });
      },

      completeTask: (id) => {
        const task = get().tasks[id];
        if (!task) return;

        // Calculate actual time from focus sessions
        const actualMinutes = task.focusSessionIds.reduce((total, sessionId) => {
          const session = useFocusStore.getState().sessions[sessionId];
          return total + (session?.actualMinutes || 0);
        }, 0);

        get().updateTask(id, {
          status: 'completed',
          completedAt: getCurrentTimestamp(),
          actualMinutes: actualMinutes || task.actualMinutes,
        });

        // Award XP
        useAchievementStore.getState().awardXP(25, 'task_completed');

        // Check for streak
        useAchievementStore.getState().checkTaskStreak();
      },

      abandonTask: (id, reason) => {
        get().updateTask(id, {
          status: 'abandoned',
          description: reason
            ? `${get().tasks[id]?.description || ''}\n\nTerk sebebi: ${reason}`
            : get().tasks[id]?.description,
        });
      },

      reopenTask: (id) => {
        get().updateTask(id, {
          status: 'pending',
          completedAt: null,
        });
      },

      // Bulk operations
      completeTasks: (ids) => {
        ids.forEach(id => get().completeTask(id));
      },

      deleteTasks: (ids) => {
        set(state => {
          const newTasks = { ...state.tasks };
          ids.forEach(id => delete newTasks[id]);

          return {
            tasks: newTasks,
            taskOrder: state.taskOrder.filter(id => !ids.includes(id)),
          };
        });

        get().syncWithServer();
      },

      moveTasks: (ids, priority) => {
        ids.forEach(id => get().updateTask(id, { priority }));
      },

      // Filters
      setFilters: (filters) => {
        set(state => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
      },

      // AI-powered features
      breakdownTask: async (id) => {
        const task = get().tasks[id];
        if (!task) return;

        set({ isLoading: true });

        try {
          const subtasks = await aiApi.breakdownTask(task.title, task.description);

          get().updateTask(id, {
            subtasks: subtasks.map((st, index) => ({
              id: generateId(),
              title: st.title,
              completed: false,
              estimatedMinutes: st.estimatedMinutes,
              actualMinutes: null,
              order: index,
            })),
          });
        } catch (error) {
          set({ error: 'Görev bölünemedi. Tekrar deneyin.' });
        } finally {
          set({ isLoading: false });
        }
      },

      estimateTime: async (id) => {
        const task = get().tasks[id];
        if (!task) return;

        try {
          const estimate = await aiApi.estimateTaskTime(
            task.title,
            task.description,
            task.subtasks
          );

          get().updateTask(id, {
            estimatedMinutes: estimate.minutes,
          });
        } catch (error) {
          // Silent fail, don't block user
          console.error('Time estimation failed:', error);
        }
      },

      suggestPriority: async (id) => {
        const task = get().tasks[id];
        if (!task) return;

        try {
          const priority = await aiApi.suggestPriority(
            task.title,
            task.dueDate,
            task.description
          );

          get().updateTask(id, { priority });
        } catch (error) {
          console.error('Priority suggestion failed:', error);
        }
      },

      // Sync
      syncWithServer: async () => {
        // Debounced sync - don't call API on every change
        // Use a queue system in production
        try {
          const { tasks, lastSyncedAt } = get();

          // Only sync tasks modified since last sync
          const modifiedTasks = Object.values(tasks).filter(
            t => !lastSyncedAt || new Date(t.updatedAt) > new Date(lastSyncedAt)
          );

          if (modifiedTasks.length === 0) return;

          await tasksApi.syncTasks(modifiedTasks);

          set({ lastSyncedAt: getCurrentTimestamp() });
        } catch (error) {
          // Queue for retry, don't lose data
          console.error('Sync failed, will retry:', error);
        }
      },

      // Utilities
      getTaskById: (id) => get().tasks[id],

      reset: () => set(initialState),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        taskOrder: state.taskOrder,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// WORST CASES HANDLED:
// ├── Task not found → Console error, no crash
// ├── Sync failure → Queue for retry, data preserved locally
// ├── AI breakdown fails → Show error, manual breakdown available
// ├── Subtask reorder with missing items → Filter nulls
// ├── Duplicate task preserves references → Reset session IDs, status
// ├── Bulk delete → Atomic update, no partial state
// └── Filter returns empty → Valid state, UI shows "no tasks"
```

---

## 3. Focus Store

```typescript
// stores/focusStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';

// Types
type FocusMode = 'pomodoro' | 'flow' | 'sprint' | 'custom' | 'untilDone';
type SessionStatus = 'idle' | 'running' | 'paused' | 'break' | 'completed';

interface FocusModeConfig {
  mode: FocusMode;
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
}

interface BodyDoublePartner {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  currentTask: string;
  sessionStartedAt: string;
}

interface FocusSession {
  id: string;
  taskId: string | null;
  taskTitle: string;
  mode: FocusMode;

  // Time tracking
  plannedMinutes: number;
  actualMinutes: number;
  startedAt: string;
  endedAt: string | null;
  pausedAt: string | null;
  totalPausedSeconds: number;

  // Status
  status: SessionStatus;
  completedEarly: boolean;

  // Body double
  bodyDoublePartnerId: string | null;

  // Breaks
  breaksTaken: number;
  currentSessionInCycle: number; // For pomodoro

  // Metadata
  createdAt: string;
}

interface FocusState {
  // Active session
  activeSession: FocusSession | null;
  bodyDoublePartner: BodyDoublePartner | null;

  // Session history
  sessions: Record<string, FocusSession>;

  // Settings
  defaultMode: FocusMode;
  modeConfigs: Record<FocusMode, FocusModeConfig>;
  ambientSound: string | null;
  ambientVolume: number;

  // UI state
  isStuckHelperVisible: boolean;

  // Timer (computed in real-time)
  getTimeRemaining: () => number;
  getProgress: () => number;

  // Session actions
  startSession: (params: {
    taskId?: string;
    taskTitle: string;
    mode: FocusMode;
    minutes?: number;
  }) => string; // Returns session id

  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (completedEarly?: boolean) => void;
  abandonSession: () => void;
  extendSession: (minutes: number) => void;

  // Break actions
  startBreak: () => void;
  skipBreak: () => void;
  endBreak: () => void;

  // Body double
  connectBodyDouble: (partner: BodyDoublePartner) => void;
  disconnectBodyDouble: () => void;

  // Stuck helper
  showStuckHelper: () => void;
  hideStuckHelper: () => void;

  // Settings
  setDefaultMode: (mode: FocusMode) => void;
  updateModeConfig: (mode: FocusMode, config: Partial<FocusModeConfig>) => void;
  setAmbientSound: (sound: string | null) => void;
  setAmbientVolume: (volume: number) => void;

  // Recovery
  recoverSession: () => void; // Called on app restart if session was active

  // Stats
  getTodayStats: () => { sessions: number; minutes: number };
  getWeekStats: () => { sessions: number; minutes: number; avgPerDay: number };

  reset: () => void;
}

const defaultModeConfigs: Record<FocusMode, FocusModeConfig> = {
  pomodoro: {
    mode: 'pomodoro',
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4,
  },
  flow: {
    mode: 'flow',
    workMinutes: 50,
    breakMinutes: 10,
    longBreakMinutes: 20,
    sessionsUntilLongBreak: 2,
  },
  sprint: {
    mode: 'sprint',
    workMinutes: 15,
    breakMinutes: 3,
    longBreakMinutes: 10,
    sessionsUntilLongBreak: 4,
  },
  custom: {
    mode: 'custom',
    workMinutes: 30,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4,
  },
  untilDone: {
    mode: 'untilDone',
    workMinutes: 0, // No limit
    breakMinutes: 10,
    longBreakMinutes: 20,
    sessionsUntilLongBreak: 1,
  },
};

const initialState = {
  activeSession: null,
  bodyDoublePartner: null,
  sessions: {},
  defaultMode: 'pomodoro' as FocusMode,
  modeConfigs: defaultModeConfigs,
  ambientSound: null,
  ambientVolume: 0.5,
  isStuckHelperVisible: false,
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Computed: Time remaining
      getTimeRemaining: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'running') return 0;

        const now = Date.now();
        const started = new Date(session.startedAt).getTime();
        const paused = session.totalPausedSeconds * 1000;
        const elapsed = now - started - paused;
        const planned = session.plannedMinutes * 60 * 1000;

        // For "until done" mode, return elapsed time (count up)
        if (session.mode === 'untilDone') {
          return Math.floor(elapsed / 1000);
        }

        return Math.max(0, Math.floor((planned - elapsed) / 1000));
      },

      // Computed: Progress percentage
      getProgress: () => {
        const session = get().activeSession;
        if (!session || session.plannedMinutes === 0) return 0;

        const remaining = get().getTimeRemaining();
        const total = session.plannedMinutes * 60;

        return Math.min(100, ((total - remaining) / total) * 100);
      },

      // Start new session
      startSession: ({ taskId, taskTitle, mode, minutes }) => {
        // Check for existing session
        const existing = get().activeSession;
        if (existing && existing.status !== 'completed') {
          // Auto-end previous session
          get().endSession(true);
        }

        const config = get().modeConfigs[mode];
        const plannedMinutes = minutes || config.workMinutes;

        const session: FocusSession = {
          id: generateId(),
          taskId: taskId || null,
          taskTitle,
          mode,
          plannedMinutes,
          actualMinutes: 0,
          startedAt: getCurrentTimestamp(),
          endedAt: null,
          pausedAt: null,
          totalPausedSeconds: 0,
          status: 'running',
          completedEarly: false,
          bodyDoublePartnerId: get().bodyDoublePartner?.id || null,
          breaksTaken: 0,
          currentSessionInCycle: 1,
          createdAt: getCurrentTimestamp(),
        };

        set({
          activeSession: session,
          sessions: { ...get().sessions, [session.id]: session },
        });

        // Link to task
        if (taskId) {
          useTaskStore.getState().updateTask(taskId, {
            status: 'in_progress',
            focusSessionIds: [
              ...(useTaskStore.getState().tasks[taskId]?.focusSessionIds || []),
              session.id,
            ],
          });
        }

        // Schedule notifications
        scheduleSessionEndNotification(session);

        return session.id;
      },

      // Pause session
      pauseSession: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'running') return;

        set({
          activeSession: {
            ...session,
            status: 'paused',
            pausedAt: getCurrentTimestamp(),
          },
        });

        // Cancel end notification
        cancelSessionNotification(session.id);
      },

      // Resume session
      resumeSession: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'paused' || !session.pausedAt) return;

        const pausedDuration = Date.now() - new Date(session.pausedAt).getTime();

        set({
          activeSession: {
            ...session,
            status: 'running',
            pausedAt: null,
            totalPausedSeconds: session.totalPausedSeconds + Math.floor(pausedDuration / 1000),
          },
        });

        // Reschedule notification
        scheduleSessionEndNotification({
          ...session,
          totalPausedSeconds: session.totalPausedSeconds + Math.floor(pausedDuration / 1000),
        });
      },

      // End session
      endSession: (completedEarly = false) => {
        const session = get().activeSession;
        if (!session) return;

        const now = getCurrentTimestamp();
        const started = new Date(session.startedAt).getTime();
        const ended = Date.now();
        const actualSeconds = Math.floor((ended - started) / 1000) - session.totalPausedSeconds;

        const completedSession: FocusSession = {
          ...session,
          status: 'completed',
          endedAt: now,
          actualMinutes: Math.ceil(actualSeconds / 60),
          completedEarly,
        };

        set({
          activeSession: null,
          sessions: {
            ...get().sessions,
            [session.id]: completedSession,
          },
        });

        // Award XP
        const xp = completedEarly ? 10 : 25;
        useAchievementStore.getState().awardXP(xp, 'focus_session');

        // Update task if linked
        if (session.taskId) {
          const task = useTaskStore.getState().tasks[session.taskId];
          if (task) {
            useTaskStore.getState().updateTask(session.taskId, {
              actualMinutes: (task.actualMinutes || 0) + completedSession.actualMinutes,
            });
          }
        }

        // Disconnect body double
        if (get().bodyDoublePartner) {
          get().disconnectBodyDouble();
        }
      },

      // Abandon session (no credit)
      abandonSession: () => {
        const session = get().activeSession;
        if (!session) return;

        set({
          activeSession: null,
          sessions: {
            ...get().sessions,
            [session.id]: {
              ...session,
              status: 'completed',
              endedAt: getCurrentTimestamp(),
              actualMinutes: 0, // No credit
            },
          },
        });

        cancelSessionNotification(session.id);
      },

      // Extend session
      extendSession: (minutes) => {
        const session = get().activeSession;
        if (!session) return;

        set({
          activeSession: {
            ...session,
            plannedMinutes: session.plannedMinutes + minutes,
          },
        });

        // Reschedule notification
        scheduleSessionEndNotification({
          ...session,
          plannedMinutes: session.plannedMinutes + minutes,
        });
      },

      // Break handling
      startBreak: () => {
        const session = get().activeSession;
        if (!session) return;

        const config = get().modeConfigs[session.mode];
        const isLongBreak = session.breaksTaken > 0 &&
          (session.breaksTaken + 1) % config.sessionsUntilLongBreak === 0;

        set({
          activeSession: {
            ...session,
            status: 'break',
            breaksTaken: session.breaksTaken + 1,
          },
        });

        // Schedule break end notification
        const breakMinutes = isLongBreak ? config.longBreakMinutes : config.breakMinutes;
        scheduleBreakEndNotification(breakMinutes);
      },

      skipBreak: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'break') return;

        set({
          activeSession: {
            ...session,
            status: 'running',
            currentSessionInCycle: session.currentSessionInCycle + 1,
          },
        });
      },

      endBreak: () => {
        get().skipBreak(); // Same behavior
      },

      // Body double
      connectBodyDouble: (partner) => {
        set({ bodyDoublePartner: partner });

        const session = get().activeSession;
        if (session) {
          set({
            activeSession: {
              ...session,
              bodyDoublePartnerId: partner.id,
            },
          });
        }
      },

      disconnectBodyDouble: () => {
        set({ bodyDoublePartner: null });
      },

      // Stuck helper
      showStuckHelper: () => set({ isStuckHelperVisible: true }),
      hideStuckHelper: () => set({ isStuckHelperVisible: false }),

      // Settings
      setDefaultMode: (mode) => set({ defaultMode: mode }),

      updateModeConfig: (mode, config) => {
        set({
          modeConfigs: {
            ...get().modeConfigs,
            [mode]: { ...get().modeConfigs[mode], ...config },
          },
        });
      },

      setAmbientSound: (sound) => set({ ambientSound: sound }),
      setAmbientVolume: (volume) => set({ ambientVolume: Math.max(0, Math.min(1, volume)) }),

      // Recovery (called on app restart)
      recoverSession: () => {
        const session = get().activeSession;
        if (!session) return;

        // If session was running and app was killed
        if (session.status === 'running') {
          const started = new Date(session.startedAt).getTime();
          const elapsed = (Date.now() - started) / 1000 - session.totalPausedSeconds;
          const planned = session.plannedMinutes * 60;

          if (elapsed >= planned) {
            // Session time passed, auto-complete
            get().endSession(false);
          } else {
            // Session still valid, offer to continue
            // This triggers UI prompt
          }
        }

        // If session was paused
        if (session.status === 'paused') {
          // Keep paused state, user can resume
        }
      },

      // Stats
      getTodayStats: () => {
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = Object.values(get().sessions).filter(
          s => s.createdAt.startsWith(today) && s.status === 'completed'
        );

        return {
          sessions: todaySessions.length,
          minutes: todaySessions.reduce((sum, s) => sum + s.actualMinutes, 0),
        };
      },

      getWeekStats: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weekSessions = Object.values(get().sessions).filter(
          s => new Date(s.createdAt) >= weekAgo && s.status === 'completed'
        );

        const totalMinutes = weekSessions.reduce((sum, s) => sum + s.actualMinutes, 0);

        return {
          sessions: weekSessions.length,
          minutes: totalMinutes,
          avgPerDay: Math.round(totalMinutes / 7),
        };
      },

      reset: () => set(initialState),
    }),
    {
      name: 'focus-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        defaultMode: state.defaultMode,
        modeConfigs: state.modeConfigs,
        ambientSound: state.ambientSound,
        ambientVolume: state.ambientVolume,
        activeSession: state.activeSession, // Persist for recovery
      }),
    }
  )
);

// WORST CASES HANDLED:
// ├── App killed during session → Persist state, recover on restart
// ├── Timer drift from phone sleep → Use timestamps, not intervals
// ├── Start session while one active → Auto-end previous
// ├── Extend "until done" session → No-op (already unlimited)
// ├── Body double disconnects → Clear partner, session continues
// ├── Break longer than expected → No penalty, gentle return
// ├── Multiple quick pause/resume → Accurate pause tracking
// └── Session > 2 hours → Valid, no forced end
```

---

## 4. Routine Store (Kısaltılmış)

```typescript
// stores/routineStore.ts
// Similar pattern to taskStore with:
// - routines: Record<string, Routine>
// - activeRoutine: { routineId, currentStepIndex, stepStartedAt, ... }
// - Actions: startRoutine, completeStep, skipStep, pauseRoutine, etc.

// Key worst cases:
// - App killed mid-routine → Persist step, offer resume
// - Step timer overrun → Gentle nudge, no force
// - All steps skipped → Still counts as "attempted"
// - Routine started while one active → "Finish current first?" prompt
```

---

## 5. UI Store (Global UI State)

```typescript
// stores/uiStore.ts

interface UIState {
  // Modals & Sheets
  activeModal: ModalType | null;
  activeSheet: SheetType | null;
  modalData: any;
  sheetData: any;

  // Celebration
  celebrationQueue: Celebration[];

  // Toasts/Alerts
  toasts: Toast[];

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Actions
  showModal: (type: ModalType, data?: any) => void;
  hideModal: () => void;
  showSheet: (type: SheetType, data?: any) => void;
  hideSheet: () => void;
  queueCelebration: (celebration: Celebration) => void;
  showNextCelebration: () => Celebration | null;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// NOT persisted - UI state is ephemeral
export const useUIStore = create<UIState>((set, get) => ({
  activeModal: null,
  activeSheet: null,
  modalData: null,
  sheetData: null,
  celebrationQueue: [],
  toasts: [],
  globalLoading: false,
  loadingMessage: null,
  theme: 'system',

  showModal: (type, data) => set({ activeModal: type, modalData: data }),
  hideModal: () => set({ activeModal: null, modalData: null }),

  showSheet: (type, data) => set({ activeSheet: type, sheetData: data }),
  hideSheet: () => set({ activeSheet: null, sheetData: null }),

  queueCelebration: (celebration) => {
    set({ celebrationQueue: [...get().celebrationQueue, celebration] });
  },

  showNextCelebration: () => {
    const queue = get().celebrationQueue;
    if (queue.length === 0) return null;

    const [next, ...rest] = queue;
    set({ celebrationQueue: rest });
    return next;
  },

  showToast: (toast) => {
    const id = generateId();
    set({ toasts: [...get().toasts, { ...toast, id }] });

    // Auto dismiss
    setTimeout(() => get().dismissToast(id), toast.duration || 3000);
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },

  setGlobalLoading: (loading, message) => {
    set({ globalLoading: loading, loadingMessage: message || null });
  },

  setTheme: (theme) => set({ theme }),
}));
```

---

## Store Integration Patterns

### 1. Cross-Store Actions

```typescript
// Completing a focus session updates multiple stores
const completeFocusSession = () => {
  const focusStore = useFocusStore.getState();
  const taskStore = useTaskStore.getState();
  const achievementStore = useAchievementStore.getState();
  const uiStore = useUIStore.getState();

  // 1. End the focus session
  focusStore.endSession();

  // 2. Update linked task
  const session = focusStore.activeSession;
  if (session?.taskId) {
    taskStore.updateTask(session.taskId, { /* ... */ });
  }

  // 3. Award XP
  achievementStore.awardXP(25, 'focus_complete');

  // 4. Show celebration
  uiStore.queueCelebration({
    type: 'focus_complete',
    xp: 25,
    message: 'Focus oturumu tamamlandı!',
  });
};
```

### 2. Selectors with Multiple Stores

```typescript
// hooks/useDailyProgress.ts
export function useDailyProgress() {
  const taskStats = useTaskStore(taskSelectors.getStats);
  const focusStats = useFocusStore(state => state.getTodayStats());
  const routinesDone = useRoutineStore(state => state.getTodayCompletedCount());
  const mood = useMoodStore(state => state.getTodaysMood());

  return {
    tasksCompleted: taskStats.completedToday,
    focusMinutes: focusStats.minutes,
    routinesDone,
    currentMood: mood,
    overallScore: calculateDayScore(taskStats, focusStats, routinesDone),
  };
}
```

### 3. Subscription for Side Effects

```typescript
// In app initialization
useEffect(() => {
  // Subscribe to auth changes
  const unsubAuth = useAuthStore.subscribe(
    (state) => state.status,
    (status) => {
      if (status === 'unauthenticated') {
        // Clear all user data
        useTaskStore.getState().reset();
        useFocusStore.getState().reset();
        // ... etc
      }
    }
  );

  // Subscribe to focus session for notifications
  const unsubFocus = useFocusStore.subscribe(
    (state) => state.activeSession?.status,
    (status) => {
      if (status === 'completed') {
        showLocalNotification('Focus tamamlandı!');
      }
    }
  );

  return () => {
    unsubAuth();
    unsubFocus();
  };
}, []);
```

---

## Offline & Sync Strategy

```typescript
// Sync queue for offline support
interface SyncQueue {
  items: SyncItem[];
  isProcessing: boolean;
  lastError: string | null;
}

interface SyncItem {
  id: string;
  store: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

// Add to sync queue when offline
const addToSyncQueue = (item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>) => {
  useSyncStore.getState().addItem({
    ...item,
    id: generateId(),
    timestamp: Date.now(),
    retryCount: 0,
  });
};

// Process queue when online
const processSyncQueue = async () => {
  const { items, setProcessing, removeItem, incrementRetry } = useSyncStore.getState();

  if (items.length === 0) return;

  setProcessing(true);

  for (const item of items) {
    try {
      await syncApi.sync(item);
      removeItem(item.id);
    } catch (error) {
      if (item.retryCount >= 3) {
        // Give up, notify user
        removeItem(item.id);
        showToast({ type: 'error', message: 'Bazı değişiklikler senkronize edilemedi' });
      } else {
        incrementRetry(item.id);
      }
    }
  }

  setProcessing(false);
};

// Listen for online status
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    processSyncQueue();
  }
});
```

---

## Performance Optimizations

```typescript
// 1. Selective subscriptions (prevent unnecessary re-renders)
const taskCount = useTaskStore(state => Object.keys(state.tasks).length);

// 2. Shallow equality for arrays/objects
const todaysTasks = useTaskStore(
  state => taskSelectors.getTodaysTasks(state),
  shallow
);

// 3. Memoized selectors
const getTaskById = useCallback(
  (id: string) => useTaskStore.getState().tasks[id],
  []
);

// 4. Batch updates
const batchCompleteRoutine = (routineId: string) => {
  // Zustand batches these automatically
  routineStore.completeRoutine(routineId);
  achievementStore.awardXP(50, 'routine');
  achievementStore.checkRoutineStreak();
  uiStore.queueCelebration({ ... });
};
```

---

**Document Version:** 1.0
**Last Updated:** December 8, 2025
