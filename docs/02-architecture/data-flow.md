
---

# `data-flow.md`

```md
# Data Flow

## Overview

This document explains how data moves through the major workflows in DailySouq.

The goal is not to describe every endpoint. The goal is to show how the main resources interact during critical business flows.

The most important flows are:

- product discovery and comparison
- vendor listing creation and approval
- cart and checkout
- payment confirmation and stock update
- vendor order handling
- review creation
- campaign approval and visibility
- audit logging

---

# 1. Product Discovery and Comparison Flow

## Goal
Allow a customer to search a shared product and compare all vendor offers for that product.

## Flow
1. Customer searches for a product, e.g. `Potato`
2. System finds matching catalog product(s)
3. System fetches all eligible vendor listings for the catalog product
4. System computes:
   - lowest available price
   - number of vendors selling the product
5. System returns product summary for search/listing page
6. On product detail page, system returns all vendor listings for comparison

## Data involved
- `categories`
- `catalog_products`
- `vendor_listings`
- `vendors`

## Eligibility rules for listing visibility
A listing should be considered in customer-facing discovery only if:
- listing moderation status is approved
- listing selling status is active
- vendor is approved/active
- catalog product is active
- stock > 0 for buyable listing display

## Output example
For a product card:
- product name
- image
- `From X QAR`
- `Y vendors`

For product detail/comparison:
- vendor name
- price
- stock availability

---

# 2. Vendor Listing Creation and Approval Flow

## Goal
Allow a vendor to create a sellable listing for an existing catalog product, then send it through admin moderation.

## Flow
1. Vendor selects an existing catalog product
2. Vendor enters listing data:
   - price
   - stock
3. Listing is saved as draft or immediately submitted
4. Listing enters `PENDING_APPROVAL`
5. Admin reviews the listing
6. Admin either:
   - approves the listing
   - rejects the listing
   - archives the listing

## Data involved
- `vendors`
- `catalog_products`
- `vendor_listings`
- `audit_logs`

## Key business rules
- vendor cannot create listing for non-existent catalog product
- vendor cannot create duplicate listing for the same catalog product
- vendor cannot publish publicly without admin approval

## Audit examples
- `LISTING_CREATED`
- `LISTING_SUBMITTED`
- `LISTING_APPROVED`
- `LISTING_REJECTED`

---

# 3. Cart Add Flow

## Goal
Allow customer to add a vendor listing to cart while preserving single-vendor cart rule.

## Flow
1. Customer chooses a specific vendor listing
2. System checks whether customer already has an active cart
3. If no active cart exists:
   - create cart with current vendor context
4. If active cart exists:
   - verify selected listing belongs to same vendor
5. If vendor is different:
   - reject add-to-cart request
6. If vendor is same:
   - add new cart item or update existing quantity

## Data involved
- `users`
- `carts`
- `cart_items`
- `vendor_listings`

## Key business rules
- cart references vendor listings, not generic catalog products
- one cart cannot mix vendors
- adding to cart does not reserve stock

---

# 4. Checkout Flow

## Goal
Convert the customer’s active cart into an order and payment attempt.

## Flow
1. Customer starts checkout
2. System loads active cart and cart items
3. System validates:
   - customer role is allowed to buy
   - cart exists
   - cart contains items
   - all items belong to same vendor
   - listings are still approved and active
4. System calculates order total
5. System creates order with status `PENDING_PAYMENT`
6. System creates order items with purchase-time snapshots
7. System creates payment with status `PENDING`

## Data involved
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`

## Why order items are snapshotted
Order items must preserve:
- product name
- unit price
- quantity
- subtotal

This prevents historical data from changing when listing price changes later.

## Result
At this stage:
- order exists
- order items exist
- payment exists
- stock is unchanged

---

# 5. Payment Success Flow

## Goal
Finalize checkout safely and commit inventory.

## Flow
1. Payment attempt returns success
2. System starts a database transaction
3. System re-fetches relevant listings
4. System re-validates stock
5. If stock is sufficient:
   - payment status becomes `SUCCESS`
   - order status becomes `CONFIRMED`
   - stock is reduced for each purchased listing
   - cart is cleared
6. Transaction commits

## Data involved
- `payments`
- `orders`
- `order_items`
- `vendor_listings`
- `carts`
- `cart_items`
- `audit_logs`

## Why stock is rechecked here
Cart is not a reservation system. Stock may have changed after items were added to cart.

## Critical business rule
Stock is reduced only at `CONFIRMED`, not at cart-add or `COMPLETED`.

## Audit examples
- `PAYMENT_SUCCESS`
- `ORDER_CONFIRMED`
- `STOCK_REDUCED`

---

# 6. Payment Failure Flow

## Goal
Preserve failed payment history without affecting stock.

## Flow
1. Payment attempt returns failure
2. System updates payment status to `FAILED`
3. System updates order status to `PAYMENT_FAILED`
4. Stock remains unchanged
5. Cart may remain or be handled according to checkout retry policy later

## Data involved
- `payments`
- `orders`
- `audit_logs`

## Audit examples
- `PAYMENT_FAILED`

---

# 7. Vendor Order Fulfillment Flow

## Goal
Allow vendor to process only valid paid orders.

## Flow
1. Vendor views own confirmed orders
2. Vendor moves order:
   - `CONFIRMED` → `PROCESSING`
3. Vendor finishes order:
   - `PROCESSING` → `COMPLETED`

## Data involved
- `orders`
- `order_items`
- `vendors`
- `audit_logs`

## Key business rules
- vendor can only see their own orders
- vendor cannot process unpaid or failed orders
- vendor cannot jump invalid states
- vendor cannot normally cancel paid confirmed orders in v1

## Audit examples
- `ORDER_PROCESSING_STARTED`
- `ORDER_COMPLETED`

---

# 8. Earnings Recognition Flow

## Goal
Reflect vendor earnings only after fulfillment is complete.

## Flow
1. Vendor completes order
2. Order status becomes `COMPLETED`
3. Vendor earnings analytics become eligible to include this order

## Data involved
- `orders`
- `order_items`
- `vendors` (dashboard analytics view)
- optional reporting queries

## Key business rule
Vendor earnings are recognized only from completed orders.

## Design note
In v1, earnings are derived from completed order data rather than managed through a withdrawal/ledger system.

---

# 9. Review Creation Flow

## Goal
Allow only verified buyers to review items after eligible purchase.

## Flow
1. Customer opens eligible completed order
2. System checks review eligibility:
   - customer owns the order
   - order is completed
   - review for that purchase context does not already exist
3. Customer submits rating and comment
4. Review is stored
5. Review becomes visible according to platform rules

## Data involved
- `orders`
- `order_items`
- `reviews`
- `audit_logs`

## Key business rules
- only customers can create reviews
- only after completed order
- review must be tied to purchase context
- one review per allowed purchase context in v1

## Audit examples
- `REVIEW_CREATED`

---

# 10. Vendor Reply to Review Flow

## Goal
Allow vendor to reply once to a valid review on their own sold item context.

## Flow
1. Vendor views reviews related to their own listings/orders
2. Vendor selects a review without existing reply
3. Vendor submits reply
4. System stores reply text and reply timestamp on the review record

## Data involved
- `reviews`
- `vendors`
- `audit_logs`

## Key business rules
- vendor can reply only to reviews related to their own sales context
- one review can have only one vendor reply in v1
- no separate reply thread/entity exists

## Audit examples
- `REVIEW_REPLY_ADDED`

---

# 11. Campaign Creation and Approval Flow

## Goal
Allow vendor to create campaign content that becomes public only after admin approval and valid date window.

## Flow
1. Vendor creates campaign draft
2. Vendor enters:
   - title
   - short description
   - image
   - start date
   - end date
3. Vendor submits campaign
4. Campaign moves to `PENDING_APPROVAL`
5. Admin reviews campaign
6. Admin either:
   - approves
   - rejects
   - archives
7. Public visibility is determined by:
   - approval state
   - vendor active state
   - current date within campaign range

## Data involved
- `campaigns`
- `vendors`
- `audit_logs`

## Key business rules
- max 5 campaigns per vendor
- one image only
- start date must be before end date
- campaign does not affect checkout price
- query/business logic decides actual visibility by date

## Audit examples
- `CAMPAIGN_CREATED`
- `CAMPAIGN_APPROVED`
- `CAMPAIGN_REJECTED`
- `CAMPAIGN_EXPIRED`

---

# 12. Audit Logging Flow

## Goal
Capture important domain events for traceability.

## Flow
1. Important business action happens
2. System creates audit entry
3. Audit entry records:
   - event type
   - resource type
   - resource id
   - actor id / role
   - message
   - timestamp
   - optional metadata

## Data involved
- `audit_logs`

## Good audit candidates
- vendor approval changes
- listing moderation events
- price or stock updates
- order creation
- payment success/failure
- order lifecycle transitions
- review and review reply creation
- campaign moderation events

## Design note
Audit log is not the source of truth for business state. It is an operational trace.

---

# End-to-End Commerce Summary

The main commerce data flow is:

```text
Customer searches catalog product
  ↓
System loads vendor listings
  ↓
Customer selects one vendor listing
  ↓
Customer adds items to single-vendor cart
  ↓
Checkout creates:
  - order
  - order items
  - payment
  ↓
Payment success:
  - order confirmed
  - stock reduced
  - cart cleared
  ↓
Vendor processes order
  ↓
Vendor completes order
  ↓
Customer becomes eligible to review
  ↓
Vendor earnings analytics include completed order