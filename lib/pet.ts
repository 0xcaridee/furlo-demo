// Teakha's photos and profile helpers.
import { AVATAR_URI, SNACK_URI, BALL_URI } from './petPhotoData';

export const PET_PHOTOS = {
  avatar: { uri: AVATAR_URI },
  moments: [
    { source: { uri: SNACK_URI }, caption: 'Fruit snack time' },
    { source: { uri: BALL_URI }, caption: 'Favourite yellow ball' },
  ],
};

export function petAge(birthdate?: string | null): string | null {
  if (!birthdate) return null;
  const born = new Date(birthdate);
  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  let months = now.getMonth() - born.getMonth();
  if (now.getDate() < born.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years} yr${years === 1 ? '' : 's'} ${months} mo`;
}

export function profileSummary(p: any): string | null {
  if (!p) return null;
  const parts: string[] = [];
  if (p.breed) parts.push(p.breed);
  if (p.weight) parts.push(`${p.weight} kg`);
  const age = petAge(p.birthdate);
  if (age) parts.push(age);
  return parts.length ? parts.join(' · ') : null;
}
