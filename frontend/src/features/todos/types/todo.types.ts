export interface Todo {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  categoryId: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface UpdateTodoRequest {
  categoryId?: string;
  title?: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface ToggleCompleteRequest {
  isCompleted: boolean;
}

export interface TodoListFilters {
  categoryId?: string;
  isCompleted?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}
