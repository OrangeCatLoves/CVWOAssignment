export interface Message {
    id: number;
    text_field: string;
    username: string;
    created_at: string;
    images?: string[];
    thread_id: number;
  }