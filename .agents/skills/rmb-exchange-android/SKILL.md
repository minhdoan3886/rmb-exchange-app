---
name: rmb-exchange-android
description: >-
  Instructs agents on how to build, maintain, and deploy an Android currency exchange app (RMB <-> USDT <-> VND) with real-time OKX market rates, mobile-optimized PWA capabilities, Capacitor native packaging, and automated GitHub Actions APK builds.
---

# RMB Exchange Android App - Agent Engineering Skill

This skill provides step-by-step instructions for creating, configuring, testing, and deploying an Android and Web mobile application that calculates currency exchange between Chinese Yuan (RMB/¥), Tether (USDT/$), and Vietnamese Dong (VNĐ/₫) using live market rates from OKX, with automated APK generation via GitHub Actions.

---

## 1. Mathematical Formulas & Business Logic

When performing conversions, always implement these exact formulas:

### A. Forward Conversion (RMB ➔ USDT ➔ VNĐ)
1. **USDT Needed**:
   $$\text{USDT cần} = \left(\frac{\text{Số RMB cần}}{\text{Tỷ giá Tệ/USDT}}\right) + \text{Phí quy đổi (USDT)}$$
2. **Total VNĐ to Pay**:
   $$\text{Tổng VNĐ} = \text{USDT cần} \times \text{Tỷ giá USDT/VNĐ}$$
3. **1 RMB to VNĐ Base Rate (Chưa phí)**:
   $$\text{Tỷ giá 1 Tệ gốc} = \left(\frac{1}{\text{Tỷ giá Tệ/USDT}}\right) \times \text{Tỷ giá USDT/VNĐ}$$
   *(Ví dụ: $(1 / 7.25) \times 25,450 = 3,510.34\text{ ₫/Tệ}$)*
4. **1 RMB to VNĐ Effective Rate (Sau phí)**:
   $$\text{Tỷ giá 1 Tệ thực tế} = \frac{\text{Tổng VNĐ}}{\text{Số RMB}}$$
   *(Ví dụ: Với $1,000\text{ RMB}$ và phí $2\text{ USDT}$, tổng tiền là $3,561,241\text{ ₫} \rightarrow 3,561.24\text{ ₫/Tệ}$)*

### B. Reverse Conversion (VNĐ / USDT ➔ RMB)
- **Từ VNĐ**:
  $$\text{USDT có sẵn} = \max\left(0, \frac{\text{Số VNĐ}}{\text{Tỷ giá USDT/VNĐ}} - \text{Phí}\right)$$
  $$\text{RMB nhận được} = \text{USDT có sẵn} \times \text{Tỷ giá Tệ/USDT}$$
- **Từ USDT**:
  $$\text{RMB nhận được} = \max\left(0, \text{Số USDT} - \text{Phí}\right) \times \text{Tỷ giá Tệ/USDT}$$

---

## 2. Project Setup & Dependencies

Initialize a Vite + React + TypeScript project with modern styling:

```bash
# 1. Scaffolding
npx -y create-vite@latest ./ --no-interactive --template react-ts

# 2. Production dependencies
npm install lucide-react clsx tailwind-merge canvas-confetti

# 3. Development dependencies (Tailwind v4 & Capacitor 8)
npm install -D @tailwindcss/vite tailwindcss @types/canvas-confetti @capacitor/core @capacitor/cli @capacitor/android
```

### Critical Dependency Rules
- **Node.js Requirement**: Capacitor 8 CLI requires **Node.js >= 22.0.0**. Never use Node 18 or 20 for Capacitor 8 builds.
- **Tailwind v4 Integration**: Use `@tailwindcss/vite` in `vite.config.ts`:
  ```ts
  import tailwindcss from '@tailwindcss/vite'
  export default defineConfig({
    plugins: [react(), tailwindcss()],
  })
  ```

---

## 3. Real-Time OKX Rate Integration

The app must fetch rates directly from OKX and provide transparent CORS handling and offline fallbacks (`src/lib/okxService.ts`):

### A. Endpoints
1. **OKX VND P2P Buy Book**:
   `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=VND&baseCurrency=USDT&side=buy&paymentMethod=all`
2. **OKX CNY P2P Buy Book**:
   `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=buy&paymentMethod=all`
3. **OKX Official Exchange Rate Endpoint (Fallback)**:
   `https://www.okx.com/api/v5/market/exchange-rate` (returns `usdCny`)

### B. CORS Resilience Architecture
Browsers block direct requests to `okx.com` due to lack of CORS headers. In Capacitor webview or browser, use a tiered fetch function:
1. **Attempt 1**: Direct `fetch(targetUrl)` (works in Capacitor native Android).
2. **Attempt 2**: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`.
3. **Attempt 3**: `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`.
4. **Attempt 4**: Read cached rates from `localStorage` (`rmb_app_okx_cache`).
5. **Attempt 5**: Hardcoded defaults ($25,450\text{ ₫}$ và $7.25\text{ ¥}$).

---

## 4. Mobile & PWA Optimization (Android-First)

Ensure the application looks, feels, and behaves like a native Android app:

1. **HTML Meta Tags (`index.html`)**:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
   <meta name="theme-color" content="#0b0f19" />
   <meta name="mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
   <link rel="manifest" href="/manifest.json" />
   ```

2. **Web App Manifest (`public/manifest.json`)**:
   ```json
   {
     "name": "RMB Quy Đổi Nhanh",
     "short_name": "RMB Tỷ Giá",
     "start_url": "/",
     "display": "standalone",
     "orientation": "portrait",
     "background_color": "#0b0f19",
     "theme_color": "#0b0f19"
   }
   ```

3. **Haptic Vibration Feedback**:
   Call `navigator.vibrate(12)` on key presses and `navigator.vibrate([15, 40, 25])` on successful calculations/copying.

4. **1-Tap Share Message**:
   Generate an invoice-style formatted string for instant copying to Zalo/Telegram:
   ```text
   🧾 BẢNG TÍNH QUY ĐỔI TỆ ➔ ĐÔ ➔ VNĐ (Nguồn OKX):
   🔹 Số Tệ cần đổi: 1.000 ¥ (RMB)
   🔹 Tỷ giá Tệ/USDT: 7.25 ¥/$
   🔹 Tỷ giá USDT/VND: 25.450 ₫
   👉 TỔNG USDT CẦN: 137.93 USDT
   👉 THÀNH TIỀN VNĐ: 3.510.345 ₫
   👉 TỶ GIÁ 1 TỆ: 3.510,34 ₫
   ```

---

## 5. Capacitor Native Android Setup

1. **Capacitor Configuration (`capacitor.config.ts`)**:
   ```ts
   import type { CapacitorConfig } from '@capacitor/cli';
   const config: CapacitorConfig = {
     appId: 'com.rmbexchange.app',
     appName: 'RMB Quy Đổi',
     webDir: 'dist',
     server: { androidScheme: 'https' }
   };
   export default config;
   ```

2. **Generate Android Project**:
   ```bash
   npm run build
   npx cap add android
   chmod +x android/gradlew
   ```

---

## 6. GitHub Actions CI/CD for APK Building & Releases

When pushing to GitHub, always provide the complete automated build workflow in `.github/workflows/build-apk.yml`.

### Key Requirements
- **Runner**: `ubuntu-latest`.
- **Node Version**: `22` (Capacitor 8 requirement).
- **Java Version**: `21` Temurin (Capacitor 8 requires Java 21 source release).
- **Do NOT use `android-actions/setup-android@v3`**: On GitHub's Ubuntu runners, the Android SDK is already pre-installed at `/usr/local/lib/android/sdk`. Third-party setup-android actions crash with `Failed to find package 'tools'`. Use `gradle/actions/setup-gradle@v4` instead.
- **Permissions**: `permissions: contents: write` is required so GitHub Actions can publish the APK directly to GitHub Releases.

### Complete Workflow Template
```yaml
name: Build Android APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    name: Build & Package Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build Web Application
        run: npm run build

      - name: Setup Java JDK 21
        uses: actions/setup-java@v5
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Sync Capacitor Android
        run: npx cap sync android

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v4

      - name: Make Gradle executable
        run: chmod +x android/gradlew

      - name: Build Android Debug APK
        run: |
          cd android
          ./gradlew assembleDebug --no-daemon

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: rmb-exchange-app-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error
          retention-days: 30

      - name: Publish APK to GitHub Release
        uses: softprops/action-gh-release@v2
        if: github.ref == 'refs/heads/main'
        with:
          tag_name: latest
          name: "RMB Quy Đổi Android (Bản mới nhất)"
          body: "Bản build APK tự động từ GitHub Actions cho ứng dụng RMB Quy Đổi."
          files: android/app/build/outputs/apk/debug/app-debug.apk
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 7. Common Gotchas & Troubleshooting Guide

| Issue / Error | Root Cause | Solution |
| :--- | :--- | :--- |
| `[fatal] The Capacitor CLI requires NodeJS >=22.0.0` | GitHub Actions runner or local machine using Node 18 or 20 | Set `node-version: 22` in workflow and upgrade local Node. |
| `error: invalid source release: 21` during Gradle build | Capacitor 8 requires Java 21 compilation, but runner was set to Java 17 | Set `java-version: '21'` with `actions/setup-java@v5`. |
| `Failed to find package 'tools'` in `setup-android` | Deprecated cmdline-tools called by third-party GitHub action | Remove `android-actions/setup-android` action. Runner already has `$ANDROID_HOME`. |
| APK is in Artifacts but user cannot find it | Default GitHub Actions artifacts are hidden as `.zip` at bottom of run page | Use `softprops/action-gh-release@v2` with `tag_name: latest` to make `.apk` downloadable directly from GitHub Releases. |
| Browser CORS error when fetching `okx.com` | `okx.com` does not send permissive CORS headers to browsers | Use proxy fallback (`allorigins.win`, `corsproxy.io`) and local cache fallback. |

---

## 8. Agent Verification Protocol

Before declaring the task complete, the agent must verify:
1. `npm run build` exits with code 0 (zero TypeScript errors, no dead imports).
2. Mathematical calculations match test cases:
   - 1000 RMB, 7.25 rate, 25,450 rate, 0 fee $\rightarrow$ 137.93 USDT, 3,510,345 VND, 1 RMB = 3,510.34 VND.
   - 1000 RMB, 7.25 rate, 25,450 rate, 2 USDT fee $\rightarrow$ 139.93 USDT, 3,561,245 VND, 1 RMB = 3,561.24 VND.
3. Git repository is initialized, committed, and pushed to GitHub.
4. GitHub Actions run finishes with status `success`.
5. The `app-debug.apk` is available in GitHub Releases and downloaded locally.
