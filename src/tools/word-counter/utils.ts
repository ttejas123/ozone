export function countCharacters(str: string): number {
  return str.length;
}

export function countWords(str: string): number {
  const words = str.trim().split(/\s+/);
  return str.trim() === '' ? 0 : words.length;
}

export function countSentences(str: string): number {
  const sentences = str.match(/[^.!?]+[.!?]+/g);
  return sentences ? sentences.length : (str.trim() ? 1 : 0);
}

export function countParagraphs(str: string): number {
  const blocks = str.split(/\n+/).filter(p => p.trim() !== '');
  return blocks.length;
}
