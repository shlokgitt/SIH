# Handoff Note — Marketplace & Order Controllers

Hey Shubham, quick note on what I've touched in `backend/` so you know exactly what's yours to take from here.

---

## ✅ My part (Backend & Integration Lead) — done, don't need to touch

- `src/config/db.js` — MongoDB connection
- `src/models/User.js` — User schema + auth
- `src/models/Batch.js` — Batch schema (labValues, complianceStatus, QR fields, etc.)
- `src/models/Order.js` — Order schema, **including `batchSnapshot`** (the immutable copy of a batch's lab values at order time — this is the core design decision, ping me if anything about it is unclear)
- `src/middleware/auth.js` — `protect()` + `authorize(...roles)`
- `src/controllers/authController.js` + `src/routes/authRoutes.js` — register/login/getMe
- `src/controllers/batchController.js` + `src/routes/batchRoutes.js` — create batch (runs compliance check + QR gen), get certificate (public), toggle listing
- `src/utils/fcoNorms.js` — `checkCompliance(labValues)` against FCO thresholds
- `src/utils/qrGenerator.js` — `generateBatchQR(batchId)` → QR data URL + certificate URL

All of the above is tested (via `node src/utils/testX.js` scripts + Thunder Client) and working.

---

## ⚠️ Your part — I drafted a starting version, please review/rewrite as you see fit

I wrote rough drafts of these two so we wouldn't lose time under deadline pressure — **treat them as scaffolding, not final code**. Change field names, logic, whatever you want.

- `src/controllers/marketplaceController.js` — browse listings (filtered to compliant + listed + in-stock), single listing detail
- `src/controllers/orderController.js` — place order (atomic stock decrement + snapshot write), get my orders, update order status (cancel restores stock)
- `src/routes/marketplaceRoutes.js`, `src/routes/orderRoutes.js` — matching routes for the above

**What you get to build on:**
- `Batch` model fields: `labValues`, `complianceStatus`, `listedInMarketplace`, `quantityKgTotal`/`quantityKgAvailable`, `pricePerKg`, `pickupLocation`
- `Order` model fields: `batchSnapshot`, `quantityKg`, `pricePerKgAtOrder`, `totalPrice`, `status`

Feel free to fully rewrite the controller logic — I'm not precious about it, just wanted something in place so nothing was blocked.

---

## Not touched (still open, nobody assigned)

- Advisory controller (dosage calculator reading from `order.batchSnapshot`) — I'm building this next, it's mine per the plan
- Wiring remaining routes into `app.js` (marketplace/orders still need to be double-checked once you finalize your controllers)

Ping me if any of the model fields don't fit what you need — happy to adjust the schema together rather than you working around it.
