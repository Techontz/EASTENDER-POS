export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  cost: number;
  unit: string;
}

export interface Branch {
  id: number;
  country_id: number;
  name: string;
  location: string;
  country_name: string;
}

export interface User {
  id: number;
  branch_id: number;
  role_id: number;
  username: string;
  full_name: string;
  email: string;
}

export interface ProcurementRequest {
  id: number;
  branch_id: number;
  user_id: number;
  title: string;
  description: string;
  estimated_cost: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  requester_name: string;
  branch_name: string;
  created_at: string;
}

export interface AttendanceLog {
  id: number;
  user_id: number;
  type: 'IN' | 'OUT';
  timestamp: string;
  full_name: string;
  branch_name: string;
}
