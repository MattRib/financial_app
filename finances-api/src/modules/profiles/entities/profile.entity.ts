export interface Profile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  currency?: string | null;
  locale?: string | null;
  date_format?: string | null;
  email_notifications?: boolean | null;
  push_notifications?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}
