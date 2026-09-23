export interface HistoryItem {
  id: string;
  timestamp: number;
  rmbAmount: number;
  usdtRate: number;
  rmbUsdtRate: number;
  conversionFee: number;
  resultUsdt: number;
  totalVnd: number;
  rate1RmbBase: number;
  rate1RmbEffective: number;
  note?: string;
}

const HISTORY_KEY = "rmb_exchange_history_v1";
const SETTINGS_KEY = "rmb_exchange_settings_v1";

export interface AppSettings {
  defaultUsdtRate: number;
  defaultRmbRate: number;
  defaultFee: number;
}

export const defaultSettings: AppSettings = {
  defaultUsdtRate: 25450,
  defaultRmbRate: 7.25,
  defaultFee: 0,
};

export function getStoredHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "timestamp">): HistoryItem {
  const current = getStoredHistory();
  const newItem: HistoryItem = {
    ...item,
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  // Keep latest 25 items
  const updated = [newItem, ...current.slice(0, 24)];
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history", e);
  }
  return newItem;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error("Failed to clear history", e);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
}
