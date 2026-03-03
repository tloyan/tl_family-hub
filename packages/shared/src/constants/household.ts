export const MEMBER_COLORS = [
  '#FF6B6B', // rouge corail
  '#4ECDC4', // turquoise
  '#45B7D1', // bleu ciel
  '#96CEB4', // vert sauge
  '#FFEAA7', // jaune doux
  '#DDA0DD', // mauve
  '#98D8C8', // menthe
  '#F7DC6F', // or doux
] as const;

export function getNextColor(existingMembersCount: number): string {
  const index = existingMembersCount % MEMBER_COLORS.length;
  // MEMBER_COLORS has 8 entries and modulo guarantees 0 <= index < 8
  return MEMBER_COLORS[index] as string;
}

export const MAX_MEMBERS_PER_HOUSEHOLD = 20;
