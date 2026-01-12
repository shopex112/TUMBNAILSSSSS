
import { supabase } from './supabaseClient';

export class AuthService {
  async register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
  }
  
  onAuthStateChange(callback: (event: string, session: any) => void) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
      return subscription;
  }

  async resendConfirmation(email: string) {
    // This sends a confirmation email for an existing but unconfirmed user.
    const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
    });
    if (error) throw error;
    return data;
  }
}

export const authService = new AuthService();