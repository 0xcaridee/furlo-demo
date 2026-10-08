/*
  # Create Pet Profiles Schema

  1. New Tables
    - `pet_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, pet's name)
      - `breed` (text, pet's breed)
      - `weight` (decimal, pet's weight in kg)
      - `birthdate` (date, pet's birth date)
      - `district` (text, Hong Kong district)
      - `instagram` (text, optional Instagram handle)
      - `photo_url` (text, optional photo URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `pet_profiles` table
    - Add policy for authenticated users to manage their own pet profiles
    - Add policy for authenticated users to read their own pet profiles

  3. Storage
    - Create storage bucket for pet photos
    - Add RLS policies for pet photo storage
*/

-- Create pet_profiles table
CREATE TABLE IF NOT EXISTS pet_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  breed text NOT NULL,
  weight decimal(5,2) NOT NULL,
  birthdate date NOT NULL,
  district text NOT NULL,
  instagram text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pet_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own pet profiles"
  ON pet_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pet profiles"
  ON pet_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pet profiles"
  ON pet_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pet profiles"
  ON pet_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload pet photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view pet photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'pet-photos');

CREATE POLICY "Users can update own pet photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own pet photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pet_profiles_updated_at
  BEFORE UPDATE ON pet_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();