import apiClient from '@/lib/apiClient';

export interface TaskAssignment {
  id: number;
  task: {
    id: number;
    title: string;
    description: string;
    due_date: string | null;
    priority: string;
    created_at: string;
  };
  status: string;
  assigned_at: string;
}

export const TasksService = {
  listMyTasks: async (): Promise<TaskAssignment[]> => {
    try {
      const { data } = await apiClient.get<TaskAssignment[]>('/api/tasks/my/');
      return data;
    } catch (e) {
      return [];
    }
  },

  listTeamTasks: async (): Promise<any[]> => {
    try {
      const { data } = await apiClient.get<any[]>('/api/tasks/team/');
      return data;
    } catch (e) {
      return [];
    }
  },

  createTask: async (taskData: any): Promise<any> => {
    const { data } = await apiClient.post('/api/tasks/', taskData);
    return data;
  },
  
  updateStatus: async (assignmentId: number, status: string): Promise<any> => {
    const { data } = await apiClient.patch(`/api/tasks/assignment/${assignmentId}/`, { status });
    return data;
  }
};
