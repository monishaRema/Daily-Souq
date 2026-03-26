# System Design

## Overview

DailySouq is a backend system for a local multi-vendor grocery marketplace. The system is designed around a shared catalog model where:

- Admin manages categories and catalog products
- Vendors create sellable listings for existing catalog products
- Customers compare vendor listings, add items to cart, and place orders
- Orders and payments are modeled separately
- Stock and earnings follow explicit business rules

The backend is structured to emphasize:

- clear separation of concerns
- predictable request flow
- transaction-safe checkout
- strict role-based access control
- maintainable domain boundaries

---

## High-Level Architecture

The backend follows a layered architecture:

```text
Client
  |
Route
  |
Controller
  |
Service
  |
Repository / Prisma
  |
PostgreSQL
```

### Route Layer

The route layer maps HTTP endpoints to the correct controller functions.

Responsibilities:

- define REST endpoints
- attach middleware
- enforce route-level authorization where needed

This layer should remain thin.

### Controller Layer

Controllers handle the HTTP request/response boundary.

Responsibilities:

- extract request data
- call service methods
- return formatted responses
- delegate business logic to services

Controllers should not contain business rules.

### Service Layer

The service layer contains core business logic.

Responsibilities:

- enforce business rules
- coordinate multiple repositories
- validate workflow state transitions
- manage transactional operations

Examples:

- validating single-vendor cart before checkout
- confirming payment and reducing stock
- restricting vendor order transitions
- checking review eligibility after completed order

This is the most important application layer.

### Repository / Data Access Layer

Repositories are responsible for database interaction.

Responsibilities:

- query data
- create/update/delete records
- isolate Prisma/database code from services

This layer should not contain business decisions. It should only implement data access operations.

### Database Layer

PostgreSQL stores the relational domain data.

Core domains:

- identity and vendor profile
- catalog and listings
- cart and checkout
- order and payment
- reviews and campaigns
- audit logs

The schema is designed to preserve clear domain boundaries and support predictable queries.

---

## Core Domain Structure

DailySouq is organized around the following business domains.

### 1. Identity & Access

Includes:

- users
- vendors
- roles

Purpose:

- manage authentication and authorization
- distinguish customer, vendor, and admin responsibilities

### 2. Catalog

Includes:

- categories
- catalog products
- vendor listings

Purpose:

- represent shared product identity
- allow many vendors to sell the same product
- support product comparison

Key design choice:
A catalog product is not directly sellable. Customers buy a vendor listing.

### 3. Cart & Checkout

Includes:

- carts
- cart items

Purpose:

- collect items before purchase
- enforce single-vendor cart rule
- prepare order creation

Key design choice:
The cart is not a stock reservation system.

### 4. Orders & Payments

Includes:

- orders
- order items
- payments

Purpose:

- track purchase intent
- track payment outcome separately
- enforce order lifecycle
- protect historical purchase data through order snapshots

Key design choice:
Orders and payments are separate resources because commerce state and payment state are different concerns.

### 5. Reviews

Includes:

- reviews

Purpose:

- allow verified buyers to review purchased items
- allow one vendor reply per review

Key design choice:
Vendor reply stays inside the review model in v1 instead of using a separate reply entity.

### 6. Campaigns

Includes:

- campaigns

Purpose:

- allow vendors to create visibility campaigns for storefront and homepage exposure
- enforce admin approval and date-based visibility

### 7. Audit Logs

Includes:

- audit logs

Purpose:

- record important business events for traceability
- support operational clarity and debugging of business workflows

---

## Shared Catalog Model

One of the most important system design decisions is the use of a shared catalog.

### Catalog Product

Represents the shared product identity.

Examples:

- Potato
- Onion
- Tomato

### Vendor Listing

Represents a vendor selling that product.

Examples:

- Vendor A selling Potato for 4.50 QAR
- Vendor B selling Potato for 4.00 QAR

### Why This Matters

This design enables:

- clean comparison across vendors
- proper many-to-many marketplace modeling
- better moderation and product consistency
- simpler public product search and display

Without this split, the marketplace would become a search-based approximation rather than a clean comparison system.

---

## Single-Vendor Cart Design

The cart is intentionally limited to one vendor at a time.

### Why

A multi-vendor cart introduces major complexity:

- checkout splitting
- multiple vendor orders
- payment allocation complexity
- vendor-specific fulfillment branching

For v1, the system uses:

- one active cart per customer
- one vendor per cart
- one order per checkout

This keeps the commerce model focused and easier to reason about.

---

## Order and Payment Separation

Orders and payments are modeled separately.

### Order

Represents:

- what the customer is buying
- from which vendor
- in what quantity
- the fulfillment lifecycle

### Payment

Represents:

- whether payment was attempted
- whether it succeeded or failed
- the payment state independent of fulfillment

### Why This Matters

If payment and order are merged, failed-payment history becomes unclear and lifecycle rules become weaker.

This separation makes the commerce flow more realistic and easier to maintain.

---

## Order Lifecycle Design

The order lifecycle is strictly controlled.

### Order Statuses

- `PENDING_PAYMENT`
- `PAYMENT_FAILED`
- `CONFIRMED`
- `PROCESSING`
- `COMPLETED`
- `CANCELLED`

### Normal Transitions

- `PENDING_PAYMENT` -> `CONFIRMED`
- `PENDING_PAYMENT` -> `PAYMENT_FAILED`
- `PENDING_PAYMENT` -> `CANCELLED`
- `CONFIRMED` -> `PROCESSING`
- `PROCESSING` -> `COMPLETED`

### Key Business Meaning

- `CONFIRMED` means payment succeeded and stock is reduced
- `COMPLETED` means vendor fulfilled the order
- vendor earnings are recognized only at `COMPLETED`

This separation avoids mixing inventory commitment with earnings recognition.

---

## Payment Flow Design

Payment is modeled as a separate resource with its own lifecycle.

### Payment Statuses

- `PENDING`
- `SUCCESS`
- `FAILED`

### Core Rule

On payment success:

- payment becomes `SUCCESS`
- order becomes `CONFIRMED`
- stock is reduced
- cart is cleared

On payment failure:

- payment becomes `FAILED`
- order becomes `PAYMENT_FAILED`
- stock remains unchanged

This design keeps checkout traceable and transaction-safe.

---

## Stock Management Design

Stock belongs to the vendor listing, not the catalog product.

### Core Stock Rules

- stock is vendor-specific
- stock is not reserved at cart-add time
- stock is revalidated at checkout
- stock is reduced only at payment success / order confirmation

### Why

This ensures:

- correct marketplace inventory ownership
- reduced overselling risk
- consistency between commercial commitment and inventory deduction

---

## Earnings Design

Vendor earnings are intentionally simplified in v1.

### Rule

Vendor earnings are recognized only from `COMPLETED` orders.

### Design Choice

Earnings are treated as derived analytics from completed order data, not as a full finance or withdrawal system.

### Why

This avoids introducing premature complexity such as:

- payout approval
- withdrawal locking
- ledger management
- refund reconciliation

---

## Review Design

Reviews are constrained by purchase eligibility.

### Rules

- only customers can review
- review requires eligible completed purchase
- one review can have one vendor reply
- no threaded reply model in v1

### Why

This preserves trust in review data and keeps the feature bounded.

---

## Campaign Design

Campaigns are vendor-owned visibility cards.

### Rules

- vendor creates campaign
- admin approval required
- one image only
- date-bound visibility
- max 5 campaigns per vendor

### Why

Campaigns are treated as visibility content, not pricing logic.

This keeps promotions clean and prevents accidental drift into discount-engine complexity.

---

## Audit Logging Design

Audit logs are included for important domain events.

### Examples

- listing created
- listing approved
- payment succeeded
- order completed
- campaign approved
- review created

### Why

Audit logs improve traceability and help explain system state changes during development and debugging.

This is not event sourcing. It is a focused business activity log.

---

## API Design Approach

The system uses RESTful, versioned endpoints.

### Principles

- resource-oriented URLs
- proper HTTP methods
- consistent response shape
- lifecycle changes controlled by service layer logic

Example style:

```text
GET /api/v1/products
POST /api/v1/listings
PATCH /api/v1/orders/:id/status
```

---

## Design Priorities

This system is intentionally optimized for:

- correctness over feature count
- clean domain boundaries over convenience shortcuts
- explicit lifecycle rules over loose mutation
- backend clarity over UI-driven shortcuts

The goal is not to simulate every marketplace feature. The goal is to build a backend system that demonstrates strong engineering fundamentals and clear business reasoning.
