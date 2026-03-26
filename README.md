# DailySouq - Multi-Vendor Grocery Marketplace Backend

## Overview

DailySouq is a backend system for a local multi-vendor grocery marketplace where multiple vendors sell the same products, allowing customers to compare prices and purchase from a single vendor per order.

The system focuses on **core commerce fundamentals**:

* shared product catalog
* vendor-specific listings
* price comparison
* transactional checkout
* strict order/payment lifecycle
* role-based access control (RBAC)

This project is intentionally scoped to demonstrate **backend engineering fundamentals and system design clarity**, not feature breadth.

---

## Problem Statement

In local markets, the same product (e.g., potato, onion, milk) is sold by multiple vendors at different prices. Customers typically:

* cannot easily compare vendor prices
* lack visibility into better deals
* rely on manual or fragmented information

DailySouq solves this by:

* standardizing products via a shared catalog
* allowing vendors to create their own listings
* enabling customers to compare and purchase efficiently

---

## Key Features

### 1. Shared Product Catalog

* Admin-defined products (e.g., Potato, Onion)
* Vendors cannot create product identity
* Ensures consistent comparison across vendors

### 2. Vendor Listings

* Vendors sell catalog products with:
  * their own price
  * their own stock
* One vendor -> one listing per product
* Customers compare listings across vendors

### 3. Single-Vendor Cart

* A cart can contain items from only one vendor
* Prevents complex multi-vendor checkout logic
* Keeps transaction handling simple and consistent

### 4. Order & Payment Separation

* Orders and payments are separate entities
* Supports realistic payment lifecycle:
  * `PENDING` -> `SUCCESS` / `FAILED`

### 5. Strict Order Lifecycle

```text
PENDING_PAYMENT -> CONFIRMED -> PROCESSING -> COMPLETED
                     |
                     -> PAYMENT_FAILED
```

* Stock reduces only at `CONFIRMED`
* Vendor earnings recognized only at `COMPLETED`

### 6. Vendor Dashboard (Backend Logic)

* Vendors can:
  * manage listings
  * update price and stock
  * view orders
  * track sales (derived from completed orders)

### 7. Reviews System

* Only customers who completed an order can review
* Vendors can reply once per review
* No separate reply entity (simplified model)

### 8. Campaigns (Promotions)

* Vendors create promotional campaigns
* Admin approval required
* Visibility controlled by date range

### 9. Audit Logging

* Tracks important business events:
  * order creation
  * payment success/failure
  * listing updates
  * campaign approvals
* Improves traceability and system observability

---

## System Design Highlights

* Relational database design (PostgreSQL)
* Clear separation of concerns:
  * controllers -> services -> repositories
* Transaction-safe checkout flow
* Strong RBAC enforcement
* Snapshot-based order items (immutable history)
* Derived analytics instead of mutable financial state

---

## Tech Stack

* **Backend:** Node.js, Express (TypeScript)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Validation:** Zod
* **Authentication:** JWT-based
* **Package Manager:** pnpm

---

## API Design Principles

* RESTful resource-based endpoints
* Versioned APIs (`/api/v1`)
* Consistent response format
* Proper HTTP status usage
* No action-based URLs (no `/createOrder`, `/approveUser`, etc.)

Example:

```text
GET    /api/v1/products
POST   /api/v1/orders
PATCH  /api/v1/listings/:id
```

---

## Core Business Rules

### Marketplace Rules

* Vendors sell existing catalog products only
* Customers compare vendor listings before purchase
* One order belongs to one vendor

### Stock Rules

* Stock belongs to vendor listings
* Reduced only when payment is successful

### Earnings Rules

* Earnings recognized only when order is `COMPLETED`
* No withdrawal system in v1
* Earnings derived from order data (not manually tracked)

### Review Rules

* Only verified buyers can review
* One review -> one vendor reply

### Campaign Rules

* Max 5 campaigns per vendor
* Must be admin-approved before visibility

---

## Project Scope (What is NOT included)

To maintain focus on backend fundamentals, the following are intentionally excluded:

* Multi-vendor checkout
* Payment gateway integration (mocked instead)
* Refund system
* Vendor withdrawals / payouts
* Price history analytics
* Coupon / discount engine
* Wishlist
* Delivery / logistics system
* Real-time features (WebSockets)

---

## Documentation

Detailed documentation is organized under the `/docs` directory:

* [Overview](./docs/01-overview/project-overview.md) - project scope and features
* [Architecture](./docs/02-architecture/system-design.md) - system design and data flow
* [Data Model](./docs/03-data-model/erd.md) - ERD and entity breakdown
* [API](./docs/04-api/api-overview.md) - endpoints and conventions
* [Business Rules](./docs/05-business-rules/rbac.md) - RBAC and lifecycle definitions
* [Decisions](./docs/06-decisions/design-decisions.md) - design tradeoffs and reasoning
* [Full Project Details](./docs/project-details.md) - consolidated business definition

---

## Getting Started

### Prerequisites

* Node.js (v18+)
* PostgreSQL
* pnpm

### Installation

```bash
pnpm install
```

### Setup Environment

Create `.env` file:

```env
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
```

### Run Development Server

```bash
pnpm dev
```

---

## Example API Response

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 120,
    "totalPages": 5
  }
}
```

---

## Author

Monisha Rema - Backend-focused Fullstack Developer  
Focused on building production-grade backend systems with strong fundamentals and clear system design.

---

## Final Note

This project prioritizes:

* correctness over complexity
* clarity over feature overload
* strong fundamentals over trends

It is designed to demonstrate real-world backend thinking rather than surface-level implementation.
