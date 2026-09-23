export interface OKXRates {
  usdtVnd: number;
  cnyUsdt: number;
  lastUpdated: string;
  source: "okx_live" | "okx_cache" | "fallback";
}

const OKX_CACHE_KEY = "rmb_app_okx_cache";

// Default realistic baseline rates if completely offline
const DEFAULT_RATES: OKXRates = {
  usdtVnd: 25450,
  cnyUsdt: 7.25,
  lastUpdated: new Date().toLocaleTimeString("vi-VN"),
  source: "fallback",
};

/**
 * Fetch with multiple fallbacks: direct -> corsproxy -> allorigins
 */
async function fetchWithFallback(targetUrl: string): Promise<any> {
  // Try 1: Direct fetch
  try {
    const res = await fetch(targetUrl, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Expected to fail in standard browser due to CORS, but works in native Capacitor or proxy
  }

  // Try 2: AllOrigins proxy
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Next fallback
  }

  // Try 3: Corsproxy
  try {
    const proxyUrl2 = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl2, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Failed all proxies
  }

  throw new Error("Unable to reach OKX endpoint");
}

export async function fetchOKXRates(): Promise<OKXRates> {
  let usdtVnd = DEFAULT_RATES.usdtVnd;
  let cnyUsdt = DEFAULT_RATES.cnyUsdt;
  let successCount = 0;

  // 1. Fetch VND P2P Buy Book from OKX
  try {
    const vndData = await fetchWithFallback(
      "https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=VND&baseCurrency=USDT&side=buy&paymentMethod=all"
    );
    if (vndData?.data?.buy && Array.isArray(vndData.data.buy) && vndData.data.buy.length > 0) {
      // Get the best/top price or average of top 3
      const topPrice = parseFloat(vndData.data.buy[0].price);
      if (!isNaN(topPrice) && topPrice > 20000 && topPrice < 35000) {
        usdtVnd = Math.round(topPrice);
        successCount++;
      }
    }
  } catch (err) {
    console.warn("Could not fetch OKX VND book:", err);
  }

  // 2. Fetch CNY P2P Buy Book from OKX
  try {
    const cnyData = await fetchWithFallback(
      "https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=buy&paymentMethod=all"
    );
    if (cnyData?.data?.buy && Array.isArray(cnyData.data.buy) && cnyData.data.buy.length > 0) {
      const topCny = parseFloat(cnyData.data.buy[0].price);
      if (!isNaN(topCny) && topCny > 5.0 && topCny < 10.0) {
        cnyUsdt = parseFloat(topCny.toFixed(3));
        successCount++;
      }
    }
  } catch (err) {
    console.warn("Could not fetch OKX CNY book:", err);
  }

  // If CNY P2P wasn't reached, try OKX Official Exchange Rate endpoint
  if (successCount < 2) {
    try {
      const officialRate = await fetchWithFallback("https://www.okx.com/api/v5/market/exchange-rate");
      if (officialRate?.data?.[0]?.usdCny) {
        const rate = parseFloat(officialRate.data[0].usdCny);
        if (!isNaN(rate) && rate > 5.0 && rate < 10.0) {
          cnyUsdt = parseFloat(rate.toFixed(3));
          successCount++;
        }
      }
    } catch (e) {
      console.warn("Could not fetch OKX official exchange-rate:", e);
    }
  }

  const result: OKXRates = {
    usdtVnd,
    cnyUsdt,
    lastUpdated: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    source: successCount > 0 ? "okx_live" : "fallback",
  };

  // Cache to localStorage
  try {
    localStorage.setItem(OKX_CACHE_KEY, JSON.stringify(result));
  } catch {
    // Ignore storage errors
  }

  return result;
}

export function getCachedOKXRates(): OKXRates {
  try {
    const cached = localStorage.getItem(OKX_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...parsed, source: "okx_cache" };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_RATES;
}
