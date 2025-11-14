# Seasonal-UI 🌦🍂🎄  
**The next level after Dark Mode.**  
UI that reacts to seasons, holidays, and live weather.  
Because apps should feel *alive* — not static.

---

### ✨ What it does
- Automatically changes UI based on **real-world weather**
- Auto switches to **seasonal themes** (Spring, Summer, Fall, Winter)
- Optional PRO add-on for **holiday themes** (Christmas, Halloween, Thanksgiving, etc.)
- Works with React, Tailwind, or vanilla JS
- Uses CSS Design Tokens — no rewrites needed

---

### 🚀 Install

```bash
npm install seasonal-ui


## 🔐 Security & Hardening

Seasonal-UI is designed to be **zero-trust**, privacy-first, and safe to use in production UI environments.

### ✅ Security Highlights

- ✦ Enum-based allowlists (`season`, `weather`)
- ✦ Debug overrides disabled in production by default
- ✦ Never stores or exposes GPS coordinates
- ✦ Only derived state is cached (e.g., `"snow"`)
- ✦ FX canvas cannot intercept pointer events (`pointer-events:none;`)
- ✦ Auto respects `prefers-reduced-motion`

### ✅ Secure Mode (recommended)

```ts
import { enableSecureMode } from "seasonal-ui";
enableSecureMode();