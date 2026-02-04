import { authRepository } from '@/app/repositories/authRepository';

export const authService = {
  getSession: authRepository.getSession,
  onAuthStateChange: authRepository.onAuthStateChange,
  async sendLoginCode(email: string): Promise<void> {
    const error = await authRepository.signInWithOtp(email, false);
    if (error) throw error;
  },
  async sendRegistrationCode(email: string): Promise<void> {
    const error = await authRepository.signInWithOtp(email, true);
    if (error) throw error;
  },
  async verifyCode(email: string, code: string): Promise<void> {
    const error = await authRepository.verifyOtp(email, code, 'email');
    if (error) throw error;
  },
  async signOut(): Promise<void> {
    const error = await authRepository.signOut();
    if (error) throw error;
  },
};
