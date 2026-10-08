// Demo mode: skips Supabase login and uses a local sample pet profile,
// so the prototype runs anywhere without a backend.
// Set to false to restore the original Supabase login and data.
export const DEMO_MODE = true;

export const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@furlo.pet',
};

// Sample profile for the demo. Swap in Teakha's real details here.
export const DEMO_PET_PROFILE = {
  id: 'demo-pet',
  user_id: DEMO_USER.id,
  name: 'Teakha',
  breed: 'Goldendoodle',
  weight: 33,
  birthdate: '2022-02-24',
  district: 'Wan Chai',
  instagram: null,
  photo_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};
