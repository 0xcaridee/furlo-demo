import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { DEMO_MODE, DEMO_PET_PROFILE } from '@/lib/demo';

type PetProfile = Database['public']['Tables']['pet_profiles']['Row'];
type PetProfileInsert = Database['public']['Tables']['pet_profiles']['Insert'];
type PetProfileUpdate = Database['public']['Tables']['pet_profiles']['Update'];

export class PetProfileService {
  static async createPetProfile(profile: Omit<PetProfileInsert, 'user_id'>): Promise<PetProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('pet_profiles')
        .insert({
          ...profile,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating pet profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating pet profile:', error);
      return null;
    }
  }

  static async getPetProfile(): Promise<PetProfile | null> {
    if (DEMO_MODE) return DEMO_PET_PROFILE as any;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't have a pet profile yet
          return null;
        }
        console.error('Error fetching pet profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching pet profile:', error);
      return null;
    }
  }

  static async updatePetProfile(updates: PetProfileUpdate): Promise<PetProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('pet_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating pet profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating pet profile:', error);
      return null;
    }
  }

  static async deletePetProfile(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('pet_profiles')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting pet profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting pet profile:', error);
      return false;
    }
  }

  static async uploadPetPhoto(uri: string, petId: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Convert URI to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${petId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading pet photo:', error);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading pet photo:', error);
      return null;
    }
  }
}