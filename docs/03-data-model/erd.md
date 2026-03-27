# ERD

## Overview

DailySouq is modeled as a relational multi-vendor marketplace system with a **shared catalog** and **vendor-specific listings**.

The core relational idea is:

- admin defines shared catalog products
- vendors create listings for those products
- customers buy vendor listings, not generic products
- orders and payments are separate
- reviews are allowed only after completed purchase
- campaigns are vendor-owned and approval-based

This design supports:

- clean product comparison
- strong RBAC boundaries
- transaction-safe checkout
- clear lifecycle-based business rules

---

## Core Entity Groups

The system is organized into the following domains:

### Identity & Access

- `users`
- `vendors`

### Catalog

- `categories`
- `catalog_products`
- `vendor_listings`

### Cart & Checkout

- `carts`
- `cart_items`

### Orders & Payments

- `orders`
- `order_items`
- `payments`

### Engagement

- `reviews`
- `campaigns`

### Observability

- `audit_logs`

---

## High-Level Relationship Summary

```text
users
  `-- vendors

categories
  `-- catalog_products
        `-- vendor_listings
              |-- cart_items
              |-- order_items
              `-- reviews

users
  `-- carts
        `-- cart_items

users
  `-- orders
        `-- order_items
              `-- reviews

orders
  `-- payments

vendors
  |-- vendor_listings
  |-- orders
  |-- campaigns
  `-- reviews (via listing/order context)

audit_logs
  `-- polymorphic business event references
```

---

## Main Business Relationships

### 1. User -> Vendor

A vendor is a user with an attached vendor business profile.

- One user may have one vendor profile
- One vendor belongs to one user

This separation keeps:

- authentication in `users`
- business/store data in `vendors`

### 2. Category -> Catalog Product

Categories group shared products.

- One category has many `catalog_products`
- One `catalog_product` belongs to one category

Example:

- Category: Vegetables
- Products: Potato, Onion, Tomato

### 3. Catalog Product <-> Vendor Listing

This is the core marketplace relationship.

- One `catalog_product` can be sold by many vendors
- One vendor can sell many catalog products
- `vendor_listings` is the join entity between them

One row in `vendor_listings` means:

- one vendor is selling one catalog product under their own commercial terms

This table stores:

- vendor-specific price
- vendor-specific stock
- approval status
- selling state

This is the most important table in the system.

### 4. User -> Cart -> Cart Items

Cart belongs to customer.

- One user can have one active cart at a time in v1
- One cart has many `cart_items`
- One `cart_item` references one `vendor_listing`

Important:
Cart items reference `vendor_listing`, not `catalog_product`.

Why:

- price is vendor-specific
- stock is vendor-specific
- purchase is vendor-specific

### 5. User -> Order -> Order Items

Orders represent customer purchase intent and fulfillment lifecycle.

- One user can have many orders
- One order belongs to one vendor
- One order has many `order_items`

Each `order_item` is a snapshot of what was purchased.

It preserves:

- product name at purchase time
- unit price at purchase time
- quantity
- subtotal

This prevents order history from breaking when listing price changes later.

### 6. Order -> Payment

Orders and payments are separate.

- One order has one payment in v1
- One payment belongs to one order

This separation is intentional.

Why:

- order = commerce intent + fulfillment lifecycle
- payment = payment attempt/result lifecycle

### 7. Order Item / Purchase Context -> Review

Reviews are allowed only after eligible purchase.

- One completed purchase context may produce one review in v1
- One review belongs to:
  - one customer
  - one vendor/listing context
  - one order/order-item context
  - one catalog product context

A review also stores one vendor reply directly in the same resource.

No separate `review_replies` entity is used in v1.

### 8. Vendor -> Campaign

Campaigns are vendor-owned promotional resources.

- One vendor can have many campaigns
- One campaign belongs to one vendor

Constraints:

- max 5 campaigns per vendor
- admin approval required
- visibility determined by status + date range

### 9. Audit Logs

Audit logs track important domain events.

- One `audit_log` records one important business event
- It may reference a resource such as:
  - vendor
  - listing
  - order
  - payment
  - campaign
  - review

This is an activity/audit trail, not a source of truth for business state.

---

## Why `vendor_listings` Exists

A common beginner mistake is to merge product identity and vendor selling data into one table.

DailySouq intentionally separates them:

### `catalog_products`

Represents:

- what the product is

### `vendor_listings`

Represents:

- who is selling it
- for how much
- with how much stock

This separation enables:

- comparison across vendors
- proper many-to-many marketplace modeling
- vendor-specific stock ownership
- vendor-specific pricing
- cleaner moderation rules

Without this split, product comparison becomes weak and inconsistent.

---

## Why Cart and Orders Use `vendor_listing`

Customers never buy the generic catalog product directly.

They buy a vendor's sellable offer.

So both:

- `cart_items`
- `order_items`

must be tied to the listing context.

This preserves:

- vendor ownership
- correct price source
- correct stock source
- clean order creation

---

## Why Orders Snapshot Data

`order_items` must snapshot purchase-time values.

If the system only references live listing data, historical order records become incorrect when:

- price changes
- product name changes
- listing becomes inactive

So `order_items` preserve a stable historical record even when upstream entities change.

---

## Lifecycle-Driven Data Design

The ERD is shaped by lifecycle rules, not just CRUD structure.

### Listing Lifecycle

- draft
- pending approval
- approved
- rejected
- archived

### Order Lifecycle

- pending payment
- payment failed
- confirmed
- processing
- completed
- cancelled

### Payment Lifecycle

- pending
- success
- failed

### Campaign Lifecycle

- draft
- pending approval
- approved
- rejected
- expired
- archived

This matters because state transitions affect:

- visibility
- stock behavior
- review eligibility
- earnings recognition

---

## Mermaid ER Diagram

## Entity Purpose Summary

| Entity | Purpose |
| --- | --- |
| `users` | Base identity and role access |
| `vendors` | Vendor business/store profile |
| `categories` | Admin-managed grouping |
| `catalog_products` | Shared product identity |
| `vendor_listings` | Vendor-specific sellable offer |
| `carts` | Customer active shopping container |
| `cart_items` | Selected listings with quantity |
| `orders` | Purchase intent + fulfillment state |
| `order_items` | Purchased line-item snapshots |
| `payments` | Payment attempt/result |
| `reviews` | Verified customer feedback |
| `campaigns` | Vendor-owned promotion card |
| `audit_logs` | Important business event trail |

---

## Key Constraints

The ERD is designed around these important constraints:

- one vendor cannot create duplicate listing for the same catalog product
- one active cart is single-vendor only
- one order belongs to one vendor
- one order has one payment in v1
- stock belongs only to vendor listing
- stock reduces only at order confirmation after payment success
- vendor earnings are recognized only at order completion
- one review can have one vendor reply in v1
- one vendor can have at most 5 campaigns
