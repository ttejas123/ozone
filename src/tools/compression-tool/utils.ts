function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const compressData = async (input: string): Promise<string> => {
  const pako = await import('pako');
  const textEncoder = new TextEncoder();
  const inputBuffer = textEncoder.encode(input);
  const compressed = pako.deflate(inputBuffer);
  return bytesToBase64(compressed);
};

export const decompressData = async (input: string): Promise<string> => {
  const pako = await import('pako');
  const bytes = base64ToBytes(input);
  const decompressed = pako.inflate(bytes);
  const textDecoder = new TextDecoder();
  return textDecoder.decode(decompressed);
};

export const getByteSize = (str: string): number => {
  if (!str) return 0;
  return new Blob([str]).size;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
