export type UserRole = 'admin' | 'super_admin' | 'invites';

export interface InviteRecord {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  invited_by: string | null;
  created_at: string;
  used_at: string | null;
  revoked_at: string | null;
}
