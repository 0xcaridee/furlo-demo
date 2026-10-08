export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pet_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          breed: string
          weight: number
          birthdate: string
          district: string
          instagram: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          breed: string
          weight: number
          birthdate: string
          district: string
          instagram?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          breed?: string
          weight?: number
          birthdate?: string
          district?: string
          instagram?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}