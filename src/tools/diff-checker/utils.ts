export function formatJsonIfValid(input: string): string {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return input;
  }
}

export function formatInput(input: string, isJson: boolean): string {
  if (!input.trim()) return '';
  if (isJson) {
    return formatJsonIfValid(input);
  }
  return input;
}
