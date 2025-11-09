export const cleanString = (str: string, delimiter?: string) =>
  str
    .trim()
    .split('\n')
    .map((item) => item.trim())
    .join(delimiter ?? '\n');

export type ReadingStats = {
  wordCount: number;
  estimatedMinutes: number;
  estimatedSeconds: number;
};

export const getReadingStats = (text: string): ReadingStats => {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const wordCount = words.length;
  const wordsPerMinute = 150;
  const totalMinutes = wordCount / wordsPerMinute;
  const estimatedMinutes = Math.floor(totalMinutes);
  const estimatedSeconds = Math.round((totalMinutes - estimatedMinutes) * 60);
  return {
    wordCount,
    estimatedMinutes,
    estimatedSeconds,
  };
};
