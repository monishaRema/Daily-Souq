# DailySouq v1 - Final Business Definition

## Overview

DailySouq is a local multi-vendor grocery marketplace backend where:

- admin manages categories and shared catalog products
- approved vendors create sellable listings for catalog products
- customers search shared products and compare vendor offers
- customers add items to a single-vendor cart
- checkout creates an order and payment separately
- stock reduces only when payment succeeds and order becomes `CONFIRMED`
- vendors fulfill confirmed orders
- vendor earnings are recognized only when order becomes `COMPLETED`
- eligible customers can review purchased products
- vendors can publish admin-approved campaigns
- important business actions are recorded in an audit log

## This Is Not

- a delivery platform
- a refund system
- a withdrawal/payout system
- a finance ledger system
- a coupon/discount engine
- a real-time websocket system
- a multi-vendor checkout system

That is locked.

## Global System Rules

### Roles

System roles are:

- `CUSTOMER`
- `VENDOR`
- `ADMIN`

All accounts are stored in `users`.
A vendor is still a user, but also has a vendor profile.

### Marketplace Participation

- only approved vendors can sell
- only customers can buy
- vendors cannot buy
- admins cannot buy

### Product Model

- products are shared catalog products
- vendors do not create shared product identity
- vendors create listings for existing catalog products only

### Cart Model

- a cart is single-vendor only
- one active cart cannot contain listings from multiple vendors

### Payment and Stock

- order is created before payment finalization
- payment is separate from order
- stock reduces only when payment succeeds and order becomes `CONFIRMED`
- stock does not reduce at cart-add time
- stock does not reduce at `COMPLETED`

### Earnings

- vendor earnings are recognized only from `COMPLETED` orders
- earnings are derived from completed order data
- no withdrawal flow in v1

### Reviews

- only customers with eligible purchase can review
- one review can have one vendor reply
- no separate review reply entity in v1

### Campaigns

- campaigns are vendor-owned only
- max 5 campaigns per vendor
- campaigns require admin approval before public visibility

### Audit Trail

- important business/domain actions should create audit log entries
- audit log is for traceability, not event-sourcing

## Resource 1 - Users

### Purpose

Represents system identity and authentication/authorization base.

### Owner

System-owned. Each user owns their own account data where allowed. Admin has governance authority.

### Who Can Exist

- customer user
- vendor user
- admin user

### Business Rules

- every actor must have a user account
- role determines permissions
- one user cannot act outside their allowed role capabilities
- vendor/admin cannot use customer purchase flow

### `CUSTOMER` Can

- register/login
- manage own account/profile if supported
- browse products
- manage own cart
- place orders
- view own orders
- write eligible reviews

### `VENDOR` Can

- register/login
- manage own linked vendor profile
- create/manage own listings
- create/manage own campaigns
- view own orders
- reply to eligible reviews on own sold items

### `ADMIN` Can

- manage categories
- manage catalog products
- approve/reject/suspend vendors
- approve/reject/archive listings
- approve/reject/archive campaigns
- inspect platform activity

### Not Allowed

- customer cannot access vendor/admin operations
- vendor cannot access admin-only operations
- vendor/admin cannot buy through checkout
- users cannot mutate other users' private data unless explicitly allowed by admin flow

## Resource 2 - Vendors

### Purpose

Represents vendor shop/business profile linked to a vendor user.

### Owner

Vendor owns their own profile content. Admin governs approval and participation.

### Business Rules

- vendor profile belongs to one vendor user
- vendor is not a separate auth system
- only approved active vendors can sell publicly
- vendor profile holds business/store data, not core auth identity
- vendor dashboard earnings in v1 are analytics derived from completed orders, not payout/account balance truth

### Vendor Can

- manage own shop information
- view own listings
- view own campaigns
- view own order/sales analytics
- view own reviews and reply where allowed

### Admin Can

- approve vendor
- reject vendor
- suspend/deactivate vendor
- archive vendor if needed

### Not Allowed

- vendor cannot approve themselves
- vendor cannot alter another vendor profile
- vendor cannot buy as customer
- vendor cannot mutate payment state manually

### Vendor Lifecycle

Use:

- `PENDING_APPROVAL`
- `APPROVED`
- `REJECTED`
- `SUSPENDED`
- `ARCHIVED`

### Public Selling Rule

Vendor can sell publicly only if:

- vendor status = `APPROVED`
- vendor is not `SUSPENDED` or `ARCHIVED`

## Resource 3 - Categories

### Purpose

Admin-managed grouping for catalog products.

### Owner

Admin only.

### Business Rules

- each catalog product must belong to one category
- vendors cannot create or edit categories
- categories support search, browsing, and organization

### Admin Can

- create category
- update category
- activate/deactivate category
- archive category

### Not Allowed

- vendor/customer cannot mutate categories
- catalog product should not exist without a category

### Category Lifecycle

Use:

- `ACTIVE`
- `INACTIVE`
- `ARCHIVED`

### Category Effect

Recommended rule:

- inactive/archived category should not be used for new catalog products or new listings

public visibility of affected products should be controlled cleanly; for v1, simpler rule is better:

- inactive category removes normal public discovery

## Resource 4 - Catalog Products

### Purpose

Shared marketplace product identity used for search and vendor comparison.

### Examples

- Potato
- Onion
- Milk 1L

### Owner

Admin only.

### Business Rules

- catalog product is not vendor-owned
- catalog product does not store vendor stock
- catalog product does not store vendor selling price
- multiple vendors may sell the same catalog product through different listings
- customers search generic product identity first, then compare vendors

### Admin Can

- create catalog product
- assign category
- update shared product fields
- activate/deactivate/archive product

### Vendor Can

- choose existing catalog product when creating a listing
- not create generic catalog product in v1

### Customer-Facing Rule

Generic product card/page shows:

- product identity
- lowest available vendor price
- number of vendors selling

Use:

- From X QAR
- Y vendors

Do not show one universal product price.

### Not Allowed

- vendor cannot rename catalog product
- vendor cannot change category through listing
- customer cannot buy catalog product directly

### Catalog Product Lifecycle

Use:

- `ACTIVE`
- `INACTIVE`
- `ARCHIVED`

### Public Visibility

A catalog product appears in public browsing when:

- product is active
- category is active
- at least one eligible vendor listing exists

## Resource 5 - Vendor Listings

This is the core commerce-side resource.

### Purpose

Represents one vendor selling one catalog product under vendor-specific commercial terms.

One listing means:

- one vendor
- one catalog product
- one current price
- one current stock

### Owner

Vendor owns the listing. Admin governs moderation.

### Core Business Rules

- one vendor can sell many catalog products
- one catalog product can be sold by many vendors
- one vendor may have only one listing per catalog product in v1
- listing is the thing customers compare, cart, and buy
- stock belongs to listing
- current price belongs to listing
- no price-history feature in v1

### Mandatory Uniqueness Rule

one vendor cannot create duplicate listing for the same catalog product

Business meaning:

- vendor + catalog_product must be unique

### Vendor Can

- create listing for an existing catalog product
- set current price
- set stock
- submit listing for approval
- update operational fields after approval:
  price
  stock
  selling active/inactive state

### Admin Can

- approve listing
- reject listing
- archive listing
- inspect listing history

### Customer Can

- view approved active listings
- compare listings for the same catalog product
- add specific listing to cart

### Not Allowed

- vendor cannot create listing for inactive vendor/product/category
- vendor cannot modify another vendor's listing
- customer cannot buy inactive/unapproved/unavailable listing
- vendor cannot rename catalog product through listing

### Listing Moderation Lifecycle

Use:

- `DRAFT`
- `PENDING_APPROVAL`
- `APPROVED`
- `REJECTED`
- `ARCHIVED`

### Listing Selling State

Separate from moderation:

- `ACTIVE`
- `INACTIVE`

### Effective Public Visibility Rule

A listing is publicly visible/buyable only if:

- moderation state = `APPROVED`
- selling state = `ACTIVE`
- vendor is approved/active
- catalog product is active
- stock > 0 for buyability

### Stock Rules

- stock belongs only to listing
- stock cannot be negative
- stock is not reserved in cart
- stock is rechecked at checkout
- stock reduces only when payment succeeds and order becomes `CONFIRMED`

### Price Rules

- listing stores only current price in v1
- historical price charting is out of scope
- optional audit log can record price changes
- no discount price in v1

### Removed From v1

- price history feature
- discount engine
- tags
- listing gallery complexity

## Resource 6 - Carts

### Purpose

Represents a customer's current selected items before checkout.

### Owner

Customer owns their cart.

### Core Business Rules

- a cart belongs to one customer
- active cart is single-vendor only
- all items in one cart must belong to listings from the same vendor
- cart is not a stock reservation mechanism

### Customer Can

- create/use own cart
- add item
- update quantity
- remove item
- clear cart
- checkout

### System Behavior

If customer tries to add item from different vendor than current cart vendor:

- reject the action
- tell customer cart is vendor-specific

### Not Allowed

- vendor/admin cannot use cart to buy
- customer cannot mutate another customer's cart
- stock does not reduce when item is added to cart

### Cart Lifecycle

For v1, keep simple:

- one active cart per customer
- explicit heavy cart lifecycle not necessary

If needed later:

- `ACTIVE`
- `CHECKED_OUT`
- `ABANDONED`

But do not overbuild this now.

## Resource 7 - Cart Items

### Purpose

Represents individual selected listings inside a cart.

### Owner

Customer through their cart.

### Business Rules

- cart item references a vendor listing, not generic catalog product
- quantity must be positive
- checkout must validate actual stock before confirming order
- one cart should not contain duplicate rows for same listing; quantity should be updated/merged

### Customer Can

- add cart item
- increase/decrease quantity
- remove item

### Not Allowed

- customer cannot add inactive/unapproved/unavailable listing
- customer cannot add another vendor's listing into same active cart
- cart item cannot exist without cart

## Resource 8 - Orders

### Purpose

Represents commercial purchase intent and fulfillment lifecycle.

### Owner

System creates order from checkout. Customer owns viewing their own orders. Vendor owns fulfillment actions on own orders. Admin has governance visibility.

### Core Business Rules

- one order belongs to one customer
- one order belongs to one vendor
- one order comes from one single-vendor cart
- order exists before payment is finalized
- order is separate from payment

### Customer Can

- create order indirectly via checkout
- view own orders
- cancel only before confirmation if you expose that action later

### Vendor Can

- view own orders
- move order:
  CONFIRMED -> PROCESSING
  PROCESSING -> COMPLETED

### Admin Can

- inspect orders
- perform tightly controlled governance actions if needed later

### Not Allowed

- vendor cannot view/mutate other vendors' orders
- customer cannot mutate other customers' orders
- vendor cannot move failed/cancelled order into processing
- vendor cannot normally cancel paid confirmed order in v1

### Locked Order Lifecycle

Use exactly:

- `PENDING_PAYMENT`
- `PAYMENT_FAILED`
- `CONFIRMED`
- `PROCESSING`
- `COMPLETED`
- `CANCELLED`

### Allowed Normal Transitions

- `PENDING_PAYMENT` -> `CONFIRMED`
- `PENDING_PAYMENT` -> `PAYMENT_FAILED`
- `PENDING_PAYMENT` -> `CANCELLED`
- `CONFIRMED` -> `PROCESSING`
- `PROCESSING` -> `COMPLETED`

### Meaning of Each State

#### `PENDING_PAYMENT`

Order created, payment not finalized.

#### `PAYMENT_FAILED`

Payment attempt failed. Stock unchanged.

#### `CONFIRMED`

Payment succeeded. Stock reduced. Order commercially committed.

#### `PROCESSING`

Vendor is handling the order.

#### `COMPLETED`

Vendor finished the order. Vendor earnings are now recognized in analytics.

#### `CANCELLED`

Pre-confirmation cancellation or tightly controlled exceptional case.

### Hard Order Rules

- stock reduces at `CONFIRMED`
- no normal post-payment vendor cancellation in v1
- no refund flow in v1
- fulfillment starts only after payment success
- vendor earnings are recognized only at `COMPLETED`

## Resource 9 - Order Items

### Purpose

Represents line items inside an order.

### Owner

System-owned after checkout.

### Core Business Rules

- one order may contain multiple order items
- each item comes from a vendor listing from the cart
- order items must snapshot purchase-time facts

### Snapshot Rules

Order item must preserve:

- product name snapshot
- unit price snapshot
- quantity
- subtotal
- reference to listing/product as needed

Why:

- listing price may change later
- historical order must remain correct

### Not Allowed

- order history must not depend on current listing price
- order cannot be treated as valid commerce record without items

## Resource 10 - Payments

### Purpose

Represents payment attempt/result separately from order.

### Owner

System-controlled.

### Core Business Rules

- payment is separate from order
- one order has one payment record in v1
- payment failure does not reduce stock
- payment success confirms order and reduces stock
- vendor does not control payment state

### System Can

- create payment with `PENDING`
- mark payment success/failure
- transition order according to payment result

### Customer Can

- initiate payment via checkout

### Vendor Can

- no payment state mutation

### Admin Can

- inspect payment records
- not casually mutate normal flow

### Payment Lifecycle

Use:

- `PENDING`
- `SUCCESS`
- `FAILED`

### Allowed Normal Transitions

- `PENDING` -> `SUCCESS`
- `PENDING` -> `FAILED`

### Hard Payment Rules

On success, inside DB transaction:

- re-check stock
- payment -> `SUCCESS`
- order -> `CONFIRMED`
- reduce stock
- clear cart

On failure:

- payment -> `FAILED`
- order -> `PAYMENT_FAILED`
- stock unchanged

### Not Allowed

- no vague generic transactions table in v1
- no refund workflow
- no retry model in v1 unless intentionally added later

## Resource 11 - Reviews

### Purpose

Represents customer feedback for a purchased product in vendor-selling context.

### Owner

Customer owns review creation. Vendor owns one reply. Admin may inspect later.

### Core Business Rules

- only customers can review
- review requires eligible purchase
- better v1 rule: one customer review per purchased order item context
- one review can have one vendor reply
- no separate review reply entity in v1

### Review Target

A review belongs conceptually to:

- customer
- catalog product
- vendor/listing context
- order/order item context

That keeps review eligibility honest.

### Customer Can

- create review after eligible purchase

### Best v1 Rule

Allow review only after order is `COMPLETED`.

That is stricter and cleaner than allowing review at `CONFIRMED`.

### Vendor Can

- reply once to review on their own sold item/listing context

### Admin Can

- inspect reviews
- later moderate if needed

### Not Allowed

- vendor/admin cannot create customer reviews
- customer cannot review without eligible completed order
- vendor cannot reply more than once
- vendor cannot reply to another vendor's review context

### Review Lifecycle

Keep simple in v1.
Optional later moderation status:

- `VISIBLE`
- `HIDDEN`

Do not overbuild now.

### Review Reply Rule

Store reply inside the review resource itself:

- reply text
- reply timestamp

Do not create `review_replies` table in v1.

## Resource 12 - Campaigns

### Purpose

Represents vendor-owned promotional visibility card shown on storefront and homepage campaign section.

### Owner

Vendor owns campaign content. Admin owns approval decision.

### Core Business Rules

- each campaign belongs to exactly one vendor
- vendor can have max 5 campaigns
- campaign contains:
  title
  short description
  one image
  start date
  end date
- no product linking in v1
- no discount effect on checkout price
- campaign is visibility content, not pricing logic

### Visibility Surfaces

- vendor storefront
- homepage campaign/promo section

### Vendor Can

- create draft
- edit draft
- submit for approval
- archive own campaign if allowed
- edit rejected campaign and resubmit
- if campaign content changes after approval, require re-approval

### Admin Can

- approve
- reject
- archive/block if needed

### Customer Can

- view only eligible public campaigns

### Campaign Lifecycle

Use:

- `DRAFT`
- `PENDING_APPROVAL`
- `APPROVED`
- `REJECTED`
- `EXPIRED`
- `ARCHIVED`

### Visibility Rule

Campaign is publicly visible only if:

- campaign is approved
- vendor is approved/active
- current date is within start/end window

### Time Rule

Do not rely only on cron.

Best rule:

- query/business logic determines actual visibility by date
- optional cron may update stale records to `EXPIRED` for cleanup

### Hard Campaign Rules

- start date must be before end date
- one image only in v1
- max 5 campaigns per vendor
- rejected/expired/archived campaigns are not public

## Resource 13 - Audit Logs

### Purpose

Represents traceable record of important business/domain events.

### Owner

System-generated.

### Core Business Rules

- audit log is for important domain events only
- not every trivial read/write action needs an audit entry
- audit logs improve traceability and operational clarity
- audit log is not a replacement for app/server logging

### Good Events to Record

Examples:

- vendor created
- vendor approved/rejected/suspended
- listing created/submitted/approved/rejected/archived
- listing price updated
- listing stock updated
- campaign created/approved/rejected/expired
- order created
- payment success/failure
- order confirmed
- order moved to processing
- order completed
- review created
- vendor replied to review

### Not Allowed

- do not turn this into complex event-sourcing
- do not store meaningless "updated something" entries
- do not make audit log the only source of truth for business state

### Recommended Event Data

Each audit entry should capture at least:

- event type
- entity/resource type
- entity/resource id
- actor type/role
- actor id
- short message
- timestamp
- optional metadata for important before/after values

## RBAC Summary

### `CUSTOMER` Can

- browse categories/products
- compare vendor listings
- manage own cart/cart items
- checkout and pay
- view own orders
- create eligible reviews

### `CUSTOMER` Cannot

- create categories/catalog products/listings/campaigns
- approve anything
- buy on behalf of others
- mutate vendor/admin resources

### `VENDOR` Can

- manage own vendor profile
- create/manage own listings for existing catalog products
- update own listing price/stock/active state
- view own orders
- move orders:
  CONFIRMED -> PROCESSING
  PROCESSING -> COMPLETED
- create/manage own campaigns
- reply once to eligible reviews on own sold items

### `VENDOR` Cannot

- create categories/catalog products
- approve listings/campaigns/vendors
- buy as customer
- mutate another vendor's data
- manually force payment success
- normally cancel paid confirmed orders in v1

### `ADMIN` Can

- manage categories
- manage catalog products
- approve/reject/suspend vendors
- approve/reject/archive listings
- approve/reject/archive campaigns
- inspect orders/payments/reviews/audit logs

### `ADMIN` Cannot

- use customer checkout flow
- act as vendor seller unless intentionally designed through separate account/role flow

## Allowed vs Not Allowed - Final Summary

### Buying

Allowed:

- customer buys from one vendor cart

Not allowed:

- admin buys
- vendor buys
- mixed-vendor cart checkout

### Stock

Allowed:

- vendor updates stock operationally
- stock reduction on payment success

Not allowed:

- negative stock
- stock deduction at cart add
- stock deduction at order completion

### Payment

Allowed:

- one payment record per order
- failed payment history preserved

Not allowed:

- refund flow in v1
- retry model in v1
- vendor-controlled payment mutation

### Earnings

Allowed:

- vendor analytics from completed orders
- earnings recognized at `COMPLETED`

Not allowed:

- withdrawal flow in v1
- treating mutable vendor balance as finance truth in v1

### Catalog

Allowed:

- admin-created categories/products
- vendor-created listings for existing products

Not allowed:

- vendor-created shared catalog product in v1
- vendor renaming shared product identity

### Reviews

Allowed:

- post-completed-order customer review
- one vendor reply inside review

Not allowed:

- random reviews by non-buyers
- multiple threaded vendor replies
- separate reply table in v1

### Campaigns

Allowed:

- vendor-owned campaign with admin approval
- one image
- max 5 campaigns

Not allowed:

- coupon logic
- multi-image campaign gallery
- campaign-linked checkout discount logic

### Audit Logs

Allowed:

- important domain event logging

Not allowed:

- bloated fake event platform
- meaningless noisy audit records

## Final Locked Decisions

These should not change during implementation unless you intentionally revise scope.

### Locked

- shared catalog + vendor listings
- admin manages categories/products
- vendor sells existing products
- single-vendor cart
- order separate from payment
- stock reduces at `CONFIRMED`
- no normal post-payment vendor cancellation
- no refunds
- vendor earnings recognized at `COMPLETED`
- no withdrawal flow in v1
- review reply stored inside review
- campaign single image, max 5, approval-based
- audit log for important business events

### Removed From v1

- vendor-created generic products
- multi-vendor checkout
- withdrawal system
- ledger/finance module
- price history feature
- discount engine
- review reply table
- delivery/rider module
- wishlist
