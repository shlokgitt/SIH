# Marketplace Backend — owned by: Shubham

## What to build/extend
- `marketplaceController.js` — order management, scheduling logic
- `orderController.js` — distance-based buyer-plant matching refinements
- `marketplaceRoutes.js`, `orderRoutes.js`

Core models (`Batch.js`, `Order.js`) and base controllers already exist — built by Shlok as the pipeline foundation. Extend these, don't rewrite the snapshot logic in `Order.js` without checking with Shlok first, since Advisory depends on it staying consistent.

## Rules
- Coordinate with Shlok before changing shared models (`User.js`, `Batch.js`, `Order.js`).
- Your own routes/controllers are yours to build out fully.