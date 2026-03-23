export interface ShortLink {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: number;
}

export const generateShortLink = (originalUrl: string): ShortLink => {
  const hash = Math.random().toString(36).substring(2, 8);
  const baseUrl = window.location.origin;
  const shortUrl = `${baseUrl}/t/${hash}`;
  
  return {
    id: hash,
    originalUrl,
    shortUrl,
    createdAt: Date.now(),
  };
};

export const saveLinkToHistory = (link: ShortLink) => {
  const historyStr = localStorage.getItem('tinyurl_history');
  let history: ShortLink[] = historyStr ? JSON.parse(historyStr) : [];
  history = [link, ...history];
  localStorage.setItem('tinyurl_history', JSON.stringify(history));
};

export const getHistory = (): ShortLink[] => {
  const historyStr = localStorage.getItem('tinyurl_history');
  return historyStr ? JSON.parse(historyStr) : [];
};

export const clearHistory = () => {
  localStorage.removeItem('tinyurl_history');
};
