export const cleanString = (str: string, delimiter?: string) =>
  str
    .trim()
    .split('\n')
    .map((item) => item.trim())
    .join(delimiter ?? '\n');
