import { supabase } from '@/lib/supabase';
import { StorageService } from '@/utils/storage';
import { DEMO_MODE, DEMO_USER } from '@/lib/demo';

export class AuthService {
  static async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Error signing up:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return { success: false, error: error.message };
      }

      // Clear local storage on sign out
      await StorageService.clearAll();
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  static async getCurrentUser() {
    if (DEMO_MODE) return DEMO_USER as any;
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static onAuthStateChange(callback: (user: any) => void) {
    if (DEMO_MODE) {
      return { data: { subscription: { unsubscribe() {} } } } as any;
    }
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}