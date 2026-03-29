# Order Lifecycle

## Overview

This document defines the order lifecycle rules for DailySouq.

The order lifecycle is intentionally strict. Orders are not generic records. They move through controlled business states.

The goals are:

- preserve payment and fulfillment clarity
- prevent invalid state transitions
- protect stock correctness
- keep vendor actions bounded
- support clean earnings recognition

---

## Core Design Rules

- orders and payments are separate resources
- order is created before payment is finalized
- stock reduces only when payment succeeds and order becomes `CONFIRMED`
- vendor earnings are recognized only when order becomes `COMPLETED`
- no normal post-payment vendor cancellation in v1
- no refund flow in v1

---

## Order Statuses

DailySouq uses the following order statuses:

```txt
PENDING_PAYMENT
PAYMENT_FAILED
CONFIRMED
PROCESSING
COMPLETED
CANCELLED
```

### `PENDING_PAYMENT`

Order has been created from checkout, but payment is not finalized yet.

At this stage:

- order exists
- order items exist
- payment exists in pending state
- stock is unchanged

### `PAYMENT_FAILED`

Payment attempt failed.

At this stage:

- order remains recorded for traceability
- stock is unchanged
- order cannot move into fulfillment flow

### `CONFIRMED`

Payment succeeded and inventory is now commercially committed.

At this stage:

- payment is successful
- stock is reduced
- order is ready for vendor fulfillment
- cart is cleared

This is the inventory commitment point.

### `PROCESSING`

Vendor has started handling the confirmed order.

At this stage:

- payment already succeeded
- stock already reduced
- vendor is actively working on fulfillment

### `COMPLETED`

Vendor finished the order.

At this stage:

- order is fulfilled
- vendor earnings analytics may include this order

This is the earnings recognition point.

### `CANCELLED`

Order is cancelled before confirmation or under tightly controlled exceptional conditions.

In v1, this is not a normal post-payment vendor action.

---

## Allowed Normal Transitions

Only these normal transitions are allowed:

```txt
PENDING_PAYMENT -> CONFIRMED
PENDING_PAYMENT -> PAYMENT_FAILED
PENDING_PAYMENT -> CANCELLED
CONFIRMED -> PROCESSING
PROCESSING -> COMPLETED
```

---

## Disallowed Transitions

The following transitions must be rejected:

```txt
PAYMENT_FAILED -> PROCESSING
PAYMENT_FAILED -> COMPLETED
CANCELLED -> PROCESSING
CANCELLED -> COMPLETED
CONFIRMED -> COMPLETED
PROCESSING -> CONFIRMED
COMPLETED -> PROCESSING
```

Also reject any arbitrary jump not explicitly allowed.

---

## Lifecycle Ownership

### Customer

Customer can:

- create order indirectly through checkout
- view own orders

Customer does not directly control normal lifecycle transitions after creation.

### System

System controls:

- creation of order at checkout
- movement from `PENDING_PAYMENT` to:
  - `CONFIRMED`
  - `PAYMENT_FAILED`
  - `CANCELLED`, if such pre-confirmation path exists
- stock reduction at confirmation

### Vendor

Vendor controls only fulfillment states on own orders:

```txt
CONFIRMED -> PROCESSING
PROCESSING -> COMPLETED
```

Vendor cannot:

- confirm payment
- fail payment
- normally cancel paid orders in v1
- move other vendors' orders

### Admin

Admin can inspect lifecycle state.

If later you add exceptional governance transitions, make them explicit. Do not casually give admin unrestricted mutation in implementation.

---

## Order Creation Flow

### Step 1

Customer checks out active cart.

### Step 2

System validates:

- customer role is allowed to buy
- cart exists
- cart has items
- cart belongs to one vendor
- listings are valid

### Step 3

System creates:

- order
- order items
- payment with pending status

### Step 4

Order status becomes:

```txt
PENDING_PAYMENT
```

---

## Payment Outcome Flow

### On payment success

Inside a database transaction:

- re-check stock
- payment becomes `SUCCESS`
- order becomes `CONFIRMED`
- stock is reduced
- cart is cleared

### On payment failure

Inside controlled update:

- payment becomes `FAILED`
- order becomes `PAYMENT_FAILED`
- stock remains unchanged

---

## Stock Rule

Stock reduces at:

- `CONFIRMED`

Stock does not reduce at:

- cart add
- order creation
- processing
- completion

Why:

This keeps inventory aligned with commercial commitment, not manual fulfillment timing.

---

## Earnings Rule

Vendor earnings are recognized at:

- `COMPLETED`

Not at:

- `CONFIRMED`
- `PROCESSING`

Why:

`CONFIRMED` means paid and stock committed. `COMPLETED` means vendor actually fulfilled the order.

This separation keeps earnings logic cleaner.

---

## Cancellation Rule

### v1 policy

Normal vendor cancellation after payment success is not allowed.

Why:

Because v1 does not include:

- refund flow
- payout correction
- stock restoration logic for normal paid cancellation path

So the system avoids that complexity intentionally.

### Practical rule

Use `CANCELLED` mainly for:

- pre-confirmation cancellation
- tightly controlled exceptional admin/system path if ever needed

Do not treat `CANCELLED` as a loose fallback state.

---

## Order Query Expectations

### Customer order view

Customer sees only own orders.

### Vendor order view

Vendor sees only orders belonging to own shop.

### Admin order view

Admin may inspect all orders.

---

## Order Items and Historical Integrity

Order lifecycle depends on stable purchase history.

Each order item must snapshot:

- product name
- unit price
- quantity
- subtotal

Do not rely on current listing price after purchase.

---

## Audit Logging Expectations

Important lifecycle changes should create audit log records.

Recommended events:

- `ORDER_CREATED`
- `PAYMENT_FAILED`
- `ORDER_CONFIRMED`
- `ORDER_PROCESSING_STARTED`
- `ORDER_COMPLETED`
- `ORDER_CANCELLED`, if used

Audit log is not the state machine itself. It is the trace of state changes.

---

## Final Lifecycle Summary

```txt
Checkout started
  -> Order created as PENDING_PAYMENT
  -> Payment pending

If payment fails:
  -> PAYMENT_FAILED

If payment succeeds:
  -> CONFIRMED
  -> stock reduced

Vendor handles order:
  -> PROCESSING
  -> COMPLETED
```

Vendor earnings analytics include order only at `COMPLETED`.
