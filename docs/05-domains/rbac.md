# RBAC

## Overview

DailySouq uses role-based access control (RBAC) to restrict what each actor can do in the system.

The three system roles are:

- `CUSTOMER`
- `VENDOR`
- `ADMIN`

All actors exist in the `users` table. A vendor is still a user, but also has a linked vendor profile.

RBAC is enforced after authentication.

- **Authentication** answers: who is the user?
- **Authorization** answers: what is the user allowed to do?

---

## Role Summary

| Role | Purpose |
|---|---|
| `CUSTOMER` | Browse, cart, order, review |
| `VENDOR` | Sell products, manage listings, fulfill orders, manage campaigns |
| `ADMIN` | Govern marketplace resources and approvals |

---

## Customer Permissions

### Customer can

- register and log in
- browse categories and catalog products
- search products
- compare vendor listings
- view eligible campaigns
- manage own cart
- apply to become vendor
- add, update, remove cart items
- create order through checkout
- make payment through checkout flow
- view own orders
- create review after eligible completed purchase

### Customer cannot

- create or approve categories
- create or approve catalog products
- create or approve vendor listings
- create or approve campaigns
- access admin-only resources
- mutate another customer's cart or order
- buy on behalf of another user
- reply to reviews as vendor
- act as marketplace moderator

---

## Vendor Permissions

### Vendor can

- register and log in
- manage own vendor profile
- view own dashboard data
- create listing for existing catalog product
- update own listing price
- update own listing stock
- activate or deactivate own listing
- submit listing for approval
- view own orders
- move order status:
  - `CONFIRMED` -> `PROCESSING`
  - `PROCESSING` -> `COMPLETED`
- create campaign
- edit own draft or rejected campaign
- submit campaign for approval
- reply once to eligible review in own product/listing context
- view derived sales/earnings analytics

### Vendor cannot

- create generic catalog product
- create category
- approve vendor, listing, or campaign
- buy as customer in v1
- mutate another vendor's data
- manually force payment success
- move invalid order states
- normally cancel paid confirmed order in v1
- reply multiple times to the same review
- reply to another vendor's review context

---

## Admin Permissions

### Admin can

- manage categories
- manage catalog products
- approve, reject, or suspend vendors
- approve, reject, or archive vendor listings
- approve, reject, or archive campaigns
- inspect platform orders
- inspect platform payments
- inspect reviews
- inspect audit logs
- perform platform governance actions

### Admin cannot

- use customer checkout flow in v1
- act as vendor seller unless intentionally designed through separate flow
- bypass business rules casually without explicit governance path

---

## Resource Ownership Summary

| Resource | Primary Owner | Governance Owner |
|---|---|---|
| User account | User | Admin |
| Vendor profile | Vendor | Admin |
| Category | Admin | Admin |
| Catalog product | Admin | Admin |
| Vendor listing | Vendor | Admin |
| Cart | Customer | System |
| Cart item | Customer | System |
| Order | System / Customer view / Vendor fulfillment | Admin inspection |
| Payment | System | Admin inspection |
| Review | Customer | Admin inspection |
| Vendor reply in review | Vendor | Admin inspection |
| Campaign | Vendor | Admin |
| Audit log | System | Admin inspection |

---

## Access Rules by Domain

### Identity

- user can access own account data
- vendor can access own linked vendor profile
- admin can inspect and govern user/vendor participation

### Catalog

- admin controls categories and catalog products
- vendor can only create listings for existing catalog products
- customer can only read public catalog/listing data

### Cart and Checkout

- only customer can own and modify cart
- vendor and admin cannot use buyer checkout
- cart is single-vendor only

### Orders

- customer can see only own orders
- vendor can see only orders belonging to own shop
- admin can inspect all orders
- vendor can only perform allowed fulfillment transitions

### Payments

- payment state is system-controlled
- customer initiates payment through checkout
- vendor cannot mutate payment state
- admin may inspect payment state

### Reviews

- only customer can create review
- only after eligible completed order
- vendor can reply once to own review context
- admin can inspect and later moderate if needed

### Campaigns

- vendor owns campaign content
- admin owns approval decision
- customer can only see eligible public campaigns

### Audit Logs

- system writes audit logs
- admin can inspect logs
- normal users should not mutate logs

---

## Authorization Principles

### Principle 1: ownership before action

A user must own the resource or have admin authority before mutating it.

### Principle 2: role is not enough without ownership

Example:

- being a vendor does not allow editing every listing
- vendor can only edit own listings

### Principle 3: lifecycle rules override raw role access

Example:

- vendor role does not mean vendor can change order to any state
- only allowed transitions are valid

### Principle 4: system-controlled resources remain system-controlled

Example:

- payment status
- stock reduction timing
- audit log creation

---

## Example Permission Matrix

| Action | CUSTOMER | VENDOR | ADMIN |
|---|---|---|---|
| Browse products | Yes | Yes | Yes |
| Create catalog product | No | No | Yes |
| Create vendor listing | No | Yes | No |
| Approve listing | No | No | Yes |
| Add to cart | Yes | No | No |
| Checkout | Yes | No | No |
| Update payment status | No | No | System/Admin inspect only |
| View own orders | Yes | Yes (own vendor orders only) | Yes |
| Mark order processing | No | Yes (own confirmed order only) | Yes if governance path exists |
| Write review | Yes (eligible purchase only) | No | No |
| Reply to review | No | Yes (one reply, own context only) | No normal path |
| Create campaign | No | Yes | No |
| Approve campaign | No | No | Yes |

---

## Guard Conditions

RBAC alone is not enough. The system must also check business conditions.

### Example: review creation

Even if role is `CUSTOMER`, review is allowed only if:

- order belongs to customer
- order is `COMPLETED`
- review does not already exist for that order item context

### Example: vendor order processing

Even if role is `VENDOR`, status change is allowed only if:

- order belongs to vendor
- order is currently `CONFIRMED`
- requested transition is valid

### Example: listing update

Even if role is `VENDOR`, update is allowed only if:

- listing belongs to vendor
- listing is not archived
- related vendor, product, and category are valid

---

## Forbidden Patterns

The following are explicitly not allowed in v1:

- vendor buying through customer flow
- admin buying through customer flow
- vendor approving own listing
- vendor creating shared catalog product
- customer changing order or payment state directly
- vendor changing payment state directly
- vendor cancelling paid confirmed order in normal flow
- multiple vendor replies to one review
- customer reviewing without completed purchase

---

## Final RBAC Rule Set

### Customer

Customer is the buyer actor.

### Vendor

Vendor is the seller actor.

### Admin

Admin is the marketplace governance actor.

These boundaries should remain fixed during implementation.
