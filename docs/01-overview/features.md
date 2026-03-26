# Features

## 1. Shared Product Catalog
- Admin creates and manages products
- Vendors cannot create product identity
- Enables standardized comparison across vendors

---

## 2. Vendor Listings
- Vendors create listings for existing products
- Each listing includes:
  - price
  - stock
- One vendor can sell many products
- One product can be sold by many vendors

---

## 3. Product Comparison
- Customers search for a product (e.g., Potato)
- System returns all vendor listings for that product
- UI shows:
  - lowest price
  - number of vendors

---

## 4. Single-Vendor Cart
- Cart contains items from only one vendor
- Prevents multi-vendor checkout complexity
- Ensures clean transaction handling

---

## 5. Order & Payment Flow
- Order and payment are separate entities
- Payment determines order confirmation

Order lifecycle:
- PENDING_PAYMENT
- PAYMENT_FAILED
- CONFIRMED
- PROCESSING
- COMPLETED
- CANCELLED

---

## 6. Stock Management
- Stock belongs to vendor listings
- Reduced only when payment is successful (`CONFIRMED`)
- No stock reservation in cart

---

## 7. Vendor Dashboard (Backend Logic)
- Vendors can:
  - manage listings
  - update price and stock
  - view orders
  - track sales (derived from completed orders)

---

## 8. Reviews System
- Only customers with completed orders can review
- One review per purchase context
- Vendor can reply once

---

## 9. Campaigns (Promotions)
- Vendors create promotional campaigns
- Admin approval required
- Campaign includes:
  - title
  - description
  - image
  - start/end date
- Max 5 campaigns per vendor

---

## 10. Audit Logging
- Tracks important business events:
  - order creation
  - payment success/failure
  - listing updates
  - campaign approvals
- Improves traceability