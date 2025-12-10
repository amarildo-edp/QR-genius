export enum TaskPriority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

export enum TaskStatus {
  PENDING = 'Pendente',
  DISPATCHED = 'Enviado',
  COMPLETED = 'Concluído'
}

export const DEFAULT_ACTIVITY_TYPES = [
  'Fiscalização',
  'Levantamento',
  'Instalação',
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Inspeção',
  'Ligação Nova',
  'Corte',
  'Religação',
  'Outros'
];

export interface Technician {
  id: string;
  name: string;
  phone: string; // WhatsApp number (Country + Area + Number)
  specialty: string;
  available: boolean;
}

export interface Task {
  id: string;
  orderNumber: string; // Unique Order ID (e.g., OS-20240520-1234)
  title: string;
  activity: string; 
  description: string;
  location: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string; // Technician ID
  formattedMessage?: string; 
  createdAt: number;
  conclusion?: string; // Details of what was done
  completedAt?: number; // Timestamp of completion
}