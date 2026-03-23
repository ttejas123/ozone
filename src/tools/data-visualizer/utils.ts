export function flattenObject(obj: any, prefix = ''): Record<string, any> {
  return Object.keys(obj).reduce((acc: Record<string, any>, k: string) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

export async function parseData(input: string): Promise<{ data: any[], columns: string[], error?: string }> {
  input = input.trim();
  if (!input) {
    return { data: [], columns: [], error: 'Empty input.' };
  }

  // Detect if JSON or CSV
  if (input.startsWith('[') || input.startsWith('{')) {
    try {
      let parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) {
        parsed = [parsed]; // Force array
      }
      const flattenedData = parsed.map((item: any) => flattenObject(item));
      const columnsSet = new Set<string>();
      flattenedData.forEach((row: any) => {
        Object.keys(row).forEach(key => columnsSet.add(key));
      });
      return { data: flattenedData, columns: Array.from(columnsSet) };
    } catch (e) {
      return { data: [], columns: [], error: 'Invalid JSON format.' };
    }
  } else {
    // Treat as CSV
    try {
      const Papa = await import('papaparse');
      return new Promise((resolve) => {
        Papa.parse(input, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            if (results.errors.length && results.data.length === 0) {
               resolve({ data: [], columns: [], error: 'Failed to parse CSV.' });
            } else {
               const columns = results.meta.fields || [];
               resolve({ data: results.data, columns });
            }
          },
          error: (error: any) => {
            resolve({ data: [], columns: [], error: error.message });
          }
        });
      });
    } catch (e) {
      return { data: [], columns: [], error: 'Failed to load CSV parser.' };
    }
  }
}
