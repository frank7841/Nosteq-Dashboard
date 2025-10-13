export interface User {
    id: number;
    email: string;
    fullName: string;
    role: 'admin' | 'agent';
    isActive: boolean;
  }
  
  export interface Customer {
    id: number;
    phoneNumber: string;
    name: string;
    profilePicUrl?: string;
    lastMessageAt: string;
  }
  
  export interface Conversation {
    id: number;
    customerId: number;
    assignedUserId?: number;
    status: 'open' | 'closed' | 'pending';
    lastMessageAt: string;
    customer: Customer;
    assignedUser?: User;
    messages?: Message[];
  }
  
  export interface Message {
    id: number;
    conversationId: number;
    customerId: number;
    userId?: number;
    messageType: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template';
    direction: 'inbound' | 'outbound';
    content: string;
    mediaUrl?: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    createdAt: string;
    user?: User;
    customer: Customer;
  }
  
  export interface AuthResponse {
    access_token: string;
    user: User;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }

  export interface RegisterDto {
    email: string;
    password: string;
    fullName: string;
  }

  export interface UpdateRoleDto {
    role: 'admin' | 'agent';
  }