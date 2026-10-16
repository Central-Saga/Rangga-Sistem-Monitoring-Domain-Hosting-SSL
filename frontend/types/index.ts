export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "client";
  role_label: string;
  client_id: number | null;
  client?: Client | null;
}

export interface Client {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  projects_count?: number;
  projects?: Project[];
  created_at?: string;
}

export interface Project {
  id: number;
  client_id: number;
  name: string;
  description: string | null;
  status: "active" | "on_hold" | "completed";
  status_label: string;
  start_date: string | null;
  end_date: string | null;
  client?: Client | null;
  assets_count?: number;
  assets?: Asset[];
}

export type AssetType = "domain" | "hosting" | "ssl" | "vps";
export type AssetStatus = "active" | "expired" | "suspended";

export interface Asset {
  id: number;
  project_id: number;
  type: AssetType;
  type_label: string;
  name: string;
  provider: string | null;
  renewal_cost: string;
  billing_cycle: "monthly" | "yearly";
  billing_cycle_label: string;
  start_date: string | null;
  expired_date: string;
  days_until_expiry: number;
  auto_renew: boolean;
  status: AssetStatus;
  status_label: string;
  metadata: Record<string, unknown> | null;
  notes: string | null;
  project?: Project | null;
  renewals?: Renewal[];
}

export interface Renewal {
  id: number;
  asset_id: number;
  renewed_by: number | null;
  renewed_by_name: string | null;
  renewal_date: string;
  previous_expired_date: string;
  new_expired_date: string;
  cost: string;
  invoice_number: string | null;
  payment_method: string | null;
  status: "paid" | "pending";
  status_label: string;
  notes: string | null;
  asset?: Asset | null;
}

export interface AppNotification {
  id: string;
  type: string;
  data: {
    level: "h30" | "h7" | "expired";
    asset_id: number;
    asset_name: string;
    asset_type: string;
    project_name: string;
    expired_date: string;
    days_until_expiry: number;
    message: string;
  };
  read_at: string | null;
  created_at: string;
}

export interface DashboardSummary {
  clients: number | null;
  projects: number;
  assets_total: number;
  assets_by_type: Record<string, number>;
  expiring_in_30_days: number;
  expiring_in_7_days: number;
  expired: number;
  unread_notifications: number;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}
