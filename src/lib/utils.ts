import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: "VND" | "CNY" | "USD" | "USDT"): string {
  if (isNaN(amount) || !isFinite(amount)) return "0";
  
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  }

  if (currency === "CNY") {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // USD / USDT
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace("$", "") + " USDT";
}

export function formatNumber(value: number, maxDecimals = 2): string {
  if (isNaN(value) || !isFinite(value)) return "0";
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: Number.isInteger(value) ? 0 : Math.min(2, maxDecimals),
  }).format(value);
}

export function triggerHaptic(type: "light" | "medium" | "success" = "light") {
  if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
    try {
      if (type === "light") {
        navigator.vibrate(12);
      } else if (type === "medium") {
        navigator.vibrate(25);
      } else if (type === "success") {
        navigator.vibrate([15, 40, 25]);
      }
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      triggerHaptic("success");
      return true;
    }
    // Fallback for older webviews
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (successful) triggerHaptic("success");
    return successful;
  } catch (err) {
    console.error("Failed to copy", err);
    return false;
  }
}
