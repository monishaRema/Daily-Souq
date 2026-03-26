# Project Scope

## Included in v1

This project focuses on core backend functionality:

- user roles (customer, vendor, admin)
- vendor onboarding and approval
- shared product catalog
- vendor listings (price + stock)
- product search and comparison
- single-vendor cart system
- order and payment lifecycle
- stock management
- vendor order handling
- review system
- campaign management
- audit logging

---

## Explicitly Excluded

The following features are intentionally **not included** to maintain focus:

### Commerce Complexity
- multi-vendor checkout
- coupon/discount system
- price history tracking
- product variations (size, weight, etc.)

### Financial Systems
- vendor withdrawals
- payout processing
- accounting ledger
- refunds

### Logistics
- delivery system
- rider/driver management
- shipping tracking

### UX Enhancements
- wishlist
- real-time notifications
- WebSocket features

### Integrations
- real payment gateway (mocked instead)

---

## Design Philosophy

This project prioritizes:

- correctness over feature count
- clarity over abstraction
- strong fundamentals over shortcuts

Every feature included is implemented with:
- clear ownership
- defined lifecycle
- strict business rules

---

## Future Extension Possibilities

The system is designed to allow future expansion:

- multi-vendor checkout (cart redesign required)
- withdrawal system (finance module required)
- price analytics (historical price tracking)
- discount engine
- delivery/logistics module

These are intentionally deferred to avoid premature complexity.