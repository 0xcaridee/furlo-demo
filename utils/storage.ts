import AsyncStorage from '@react-native-async-storage/async-storage';
import { PetProfileService } from '@/services/petProfileService';
import { AuthService } from '@/services/authService';
import { DEMO_MODE } from '@/lib/demo';

const STORAGE_KEYS = {
  HAS_COMPLETED_ONBOARDING: 'hasCompletedOnboarding',
  IS_AUTHENTICATED: 'isAuthenticated',
} as const;

export interface PetProfile {
  name: string;
  breed: string;
  weight: string;
  birthdate: string;
  district: string;
  instagram?: string;
  photoUri?: string;
}

export const StorageService = {
  // Onboarding status
  async getHasCompletedOnboarding(): Promise<boolean> {
    if (DEMO_MODE) return true;
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
      return value === 'true';
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  },

  async setHasCompletedOnboarding(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, completed.toString());
    } catch (error) {
      console.error('Error setting onboarding status:', error);
    }
  },

  // Authentication status
  async getIsAuthenticated(): Promise<boolean> {
    try {
      const user = await AuthService.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('Error getting authentication status:', error);
      return false;
    }
  },

  // Pet profile methods (now using Supabase)
  async getHasPetProfile(): Promise<boolean> {
    try {
      const profile = await PetProfileService.getPetProfile();
      return !!profile;
    } catch (error) {
      console.error('Error getting pet profile status:', error);
      return false;
    }
  },

  async getPetProfile(): Promise<any> {
    try {
      return await PetProfileService.getPetProfile();
    } catch (error) {
      console.error('Error getting pet profile:', error);
      return null;
    }
  },

  async setPetProfile(profile: Omit<PetProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const result = await PetProfileService.createPetProfile({
        name: profile.name,
        breed: profile.breed,
        weight: parseFloat(profile.weight),
        birthdate: profile.birthdate,
        district: profile.district,
        instagram: profile.instagram || null,
        photo_url: profile.photoUri || null,
      });
      return !!result;
    } catch (error) {
      console.error('Error setting pet profile:', error);
      return false;
    }
  },

  // Clear all data (for testing/reset)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
        STORAGE_KEYS.IS_AUTHENTICATED,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};