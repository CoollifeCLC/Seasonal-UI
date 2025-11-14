# 🛡 SECURITY POLICY — Seasonal-UI

Seasonal-UI is designed to be *zero-trust by default*  
and **privacy-preserving by architecture.**

We take security seriously. If you believe you’ve found a vulnerability, please follow the instructions below.

---

## 📣 Supported Versions

| Version | Supported |
|---------|-----------|
| `0.x`   | ✅ Security fixes |
| `<0.x`  | ❌ Not supported |

---

## 🔐 Security Principles

Seasonal-UI follows these guarantees:

- **No secrets in the DOM**
- **No storing geolocation coordinates**
- **Weather/Season input is *allowlisted*** (enum locked)
- **Debug overrides disabled in production**
- **All query parameters are sanitized**
- **No runtime execution of user-supplied strings**
- **Particle layer (snow/rain FX) uses a fixed, capped canvas**  
  → cannot intercept pointer events or block UI

---

## 🚫 What we do NOT collect

❌ No precise GPS location  
❌ No IP storage  
❌ No telemetry or analytics  
❌ No cookies  
❌ No external requests except weather (Open-Meteo) unless overridden

When Seasonal-UI determines weather, we only store:

```json
{ "wx": "snow", "t": 1733723829 }
