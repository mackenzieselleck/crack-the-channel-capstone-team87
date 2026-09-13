
export const MOOD = {
  neutral: 0,
  happy: 1,
  sneaky: 2,
  annoyed: 3,
  sad: 4,
} as const;

export type MoodName = keyof typeof MOOD;
export type MoodValue = (typeof MOOD)[MoodName];