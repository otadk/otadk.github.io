export interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

export interface PlanItem {
  date: number;
  tasks: TodoItem;
}
