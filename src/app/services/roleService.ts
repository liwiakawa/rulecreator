import { rolesRepository } from '@/app/repositories/rolesRepository';
import { UserRole } from '@/app/auth/types';

export const roleService = {
  async getRole(userId: string): Promise<UserRole | null> {
    return rolesRepository.getRole(userId);
  },
};
