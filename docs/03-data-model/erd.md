# ERD

## Overview

DailySouq is modeled as a relational multi-vendor marketplace system with a **shared catalog** and **vendor-specific listings**.

### View the [Visual Diagram](./dailySoup-ERD.svg) or explore the <a href="https://app.eraser.io/workspace/ETaL8JlS8AnQZiyZmZOv?origin=share">interactive diagram on Eraser.io</a>

The core relational idea is:

- admin defines shared product identities
- vendors create sellable listings for those products
- customers buy vendor listings, not generic catalog products
- carts and orders are single-vendor in v1
- payments are modeled separately from orders
- reviews are allowed only after completed purchase
- campaigns are vendor-owned and approval-based

This design supports:

- product comparison across vendors
- clear RBAC boundaries
- transaction-safe checkout
- minimal but scalable domain modeling

---

## Core Entity Groups

The system is organized into the following domains:

### Identity and Access

- `users`
- `vendors`

### Catalog

- `categories`
- `catalog_products`
- `vendor_listings`

### Cart and Checkout

- `carts`
- `cart_items`

### Orders and Payments

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

```txt
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

- one user may have one vendor profile
- one vendor belongs to one user

This keeps:

- authentication in `users`
- store/business profile in `vendors`

### 2. Category -> Catalog Product

Categories group shared catalog products.

- one category has many `catalog_products`
- one `catalog_product` belongs to one category

Examples:

- Category: Vegetables
- Products: Potato, Onion, Tomato

A category also owns a unique slug for clean public routing.

### 3. Catalog Product <-> Vendor Listing

This is the core marketplace relationship.

- one `catalog_product` can be sold by many vendors
- one vendor can sell many catalog products
- `vendor_listings` is the join entity between them

One row in `vendor_listings` means:

> one vendor is selling one catalog product under that vendor's own commercial terms

This table stores:

- vendor-specific price
- vendor-specific stock
- moderation status
- selling status
- optional vendor SKU

This is the most important entity in the system.

### 4. User -> Cart -> Cart Items

Cart belongs to customer.

- one user can have one active cart at a time in v1
- one cart has many `cart_items`
- one `cart_item` references one `vendor_listing`

Important:

Cart items reference `vendor_listing`, not `catalog_product`.

Why:

- price is vendor-specific
- stock is vendor-specific
- purchase is vendor-specific

Cart is also single-vendor in v1, so cart carries `vendorId`.

### 5. User -> Order -> Order Items

Orders represent customer purchase intent and fulfillment lifecycle.

- one user can have many orders
- one order belongs to one vendor
- one order has many `order_items`

Each `order_item` is a purchase snapshot.

It preserves:

- product name at purchase time
- unit at purchase time
- unit price at purchase time
- quantity
- subtotal

This prevents history from breaking if listing or catalog data changes later.

### 6. Order -> Payment

Orders and payments are separate.

- one order has one payment in v1
- one payment belongs to one order

This separation is intentional.

Why:

- order = commerce intent + fulfillment lifecycle
- payment = payment result lifecycle

### 7. Order Item / Purchase Context -> Review

Reviews are allowed only after eligible purchase.

- one completed purchase context may produce one review in v1
- one review belongs to:
  - one customer
  - one vendor context
  - one catalog product context
  - one vendor listing context
  - one order / order-item context

A review also stores one vendor reply directly in the same resource.

No separate `review_replies` entity is used in v1.

### 8. Vendor -> Campaign

Campaigns are vendor-owned promotional resources.

- one vendor can have many campaigns
- one campaign belongs to one vendor

Constraints:

- max 5 campaigns per vendor
- admin approval required
- visibility determined by status + date range

### 9. Audit Logs

Audit logs track important business events.

- one `audit_log` records one important domain event
- it may reference a resource such as:
  - vendor
  - listing
  - order
  - payment
  - campaign
  - review

This is an activity/audit trail, not a source of truth for business state.

---

## Design Notes

### Shared Catalog Rule

The system uses a shared catalog.

That means:

- product identity is created by admin
- vendor does not create independent product identity in v1
- vendor participates by creating a `vendor_listing`

This avoids duplicate product identity fragmentation.

### Single-Vendor Checkout Rule

Checkout is intentionally simplified in v1.

That means:

- one active cart per customer
- one cart belongs to one vendor context
- one order belongs to one vendor

Multi-vendor checkout is explicitly out of scope for v1.

### Inventory Rule

Inventory lives only in `vendor_listings`.

That means:

- `catalog_products` does not own stock
- stock is revalidated at checkout
- stock is reduced only after successful payment and confirmed order

Cart does not reserve stock.

### Snapshot Rule

Historical purchase truth is preserved in `order_items`.

That means:

- order history should not depend on current listing values
- purchase snapshot remains stable even if price or product display data changes later

### Minimal Scope Rule

This model is intentionally minimal.

It does not include in v1:

- multi-vendor checkout
- product variants
- stock reservation system
- refunds and payout ledger
- multiple payment attempts per order
- separate review reply entity
- advanced media galleries
