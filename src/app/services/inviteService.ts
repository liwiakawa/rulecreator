import { invitesRepository } from '@/app/repositories/invitesRepository';
import { InviteRecord, UserRole } from '@/app/auth/types';

export const inviteService = {
  async createAdminInvite(email: string): Promise<InviteRecord> {
    return invitesRepository.createInvite(email, 'admin');
  },
  async validateInvite(token: string, email: string): Promise<boolean> {
    return invitesRepository.validateInvite(token, email);
  },
  async acceptInvite(token: string): Promise<UserRole> {
    return invitesRepository.acceptInvite(token);
  },
  async sendInviteEmail(email: string, token: string, role: UserRole): Promise<boolean> {
    return invitesRepository.sendInviteEmail(email, token, role);
  },
};
