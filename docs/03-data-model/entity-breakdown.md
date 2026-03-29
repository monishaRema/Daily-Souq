# Entity Breakdown

## Overview

This document describes the high-level schema design of DailySouq.

It is intentionally written as **business-oriented schema pseudocode**, not Prisma or SQL.

The goal is to explain:

- what each entity represents
- what data it should own
- how entities relate to each other
- what important constraints apply

This document should remain stable even if ORM or implementation details change later.

---

## 1. Users

### Purpose

Represents system identity and role access.

### High-Level Shape

```txt
User
- id
- name
- avatar (optional)
- email
- phone (optional)
- passwordHash
- role: CUSTOMER | VENDOR | ADMIN
- status
- createdAt
- updatedAt
```

Owns:

- authentication identity
- base role information
- core user account state
- minimal profile information

Relationships:

- one user may have one vendor profile
- one user may have one active cart
- one user may place many orders
- one user may write many reviews

Important rules:

- role controls access
- vendor and admin cannot use customer purchase flow
- user is the base identity layer for all actors
- email should be unique

---

## 2. Vendors

### Purpose

Represents vendor business/store profile.

### High-Level Shape

```txt
Vendor
- id
- userId
- shopName
- shopImage (optional)
- shopLocation
- businessDescription
- approvalStatus
- rejectionReason (optional)
- createdAt
- updatedAt
```

Owns:

- store/business information
- marketplace participation status

Relationships:

- belongs to one user
- has many vendor listings
- has many campaigns
- receives many orders

Important rules:

- vendor is not a separate auth system
- only approved vendors can sell publicly
- one user can have at most one vendor profile
- earnings are derived from completed orders, not stored as source of truth in v1

High-level constraint:

```txt
Unique(userId)
```

---

## 3. Categories

### Purpose

Represents admin-managed product grouping.

### High-Level Shape

```txt
Category
- id
- name
- slug
- status
- createdAt
- updatedAt
```

Owns:

- category display identity
- catalog grouping metadata

Relationships:

- one category has many catalog products

Important rules:

- only admin manages categories
- each catalog product must belong to one category
- slug should be unique
- inactive or archived categories should not be used for new marketplace data

High-level constraint:

```txt
Unique(slug)
```

---

## 4. Catalog Products

### Purpose

Represents shared marketplace product identity.

### High-Level Shape

```txt
CatalogProduct
- id
- categoryId
- name
- shortDescription (optional)
- unit
- image
- status
- createdAt
- updatedAt
```

Owns:

- shared product identity
- non-vendor-specific product information

Relationships:

- belongs to one category
- has many vendor listings
- may appear in many order items as reference context
- may appear in many reviews as product context

Important rules:

- admin manages catalog products
- vendor does not create catalog product in v1
- catalog product does not own price
- catalog product does not own stock
- customer does not buy catalog product directly
- unit belongs here because product measurement is shared identity data

---

## 5. Vendor Listings

### Purpose

Represents one vendor selling one catalog product.

### High-Level Shape

```txt
VendorListing
- id
- vendorId
- catalogProductId
- price
- stockQuantity
- moderationStatus
- sellingStatus
- sku 
- createdAt
- updatedAt
```

Owns:

- vendor-specific commercial offer
- vendor-specific stock
- listing moderation state
- listing selling availability

Relationships:

- belongs to one vendor
- belongs to one catalog product
- may appear in many cart items
- may appear in many order items
- may appear in many reviews as purchase context

Important rules:

- this is the core marketplace join entity
- one vendor can sell many products
- one product can be sold by many vendors
- one vendor can list one catalog product only once in v1
- stock belongs only to listing
- price belongs only to listing
- stock reduces only when payment succeeds and order becomes confirmed

High-level constraint:

```txt
Unique(vendorId, catalogProductId)
```

---

## 6. Carts

### Purpose

Represents a customer's active shopping container.

### High-Level Shape

```txt
Cart
- id
- customerId
- vendorId
- createdAt
- updatedAt
```

Owns:

- active shopping session context
- single-vendor purchase boundary

Relationships:

- belongs to one customer
- belongs to one vendor context while active
- has many cart items

Important rules:

- one active cart per customer in v1
- cart is single-vendor only
- cart is not a stock reservation mechanism
- cart vendor context must match all child listing vendor ownership

---

## 7. Cart Items

### Purpose

Represents selected vendor listings inside a cart.

### High-Level Shape

```txt
CartItem
- id
- cartId
- vendorListingId
- quantity
- createdAt
- updatedAt
```

Owns:

- selected purchasable item and quantity inside cart

Relationships:

- belongs to one cart
- belongs to one vendor listing

Important rules:

- references vendor listing, not catalog product
- quantity must be positive
- duplicate listing rows in same cart should be merged logically
- stock validation happens again at checkout

High-level constraint:

```txt
Unique(cartId, vendorListingId)
```

---

## 8. Orders

### Purpose

Represents commercial purchase intent and fulfillment lifecycle.

### High-Level Shape

```txt
Order
- id
- customerId
- vendorId
- orderStatus
- totalAmount
- createdAt
- updatedAt
```

Owns:

- who bought
- from which vendor
- current order lifecycle state
- total commercial amount

Relationships:

- belongs to one customer
- belongs to one vendor
- has many order items
- has one payment in v1

Important rules:

- one order comes from one single-vendor cart
- order is created before payment finalization
- order lifecycle is separate from payment lifecycle
- vendor can only process own confirmed orders

Lifecycle:

```txt
PENDING_PAYMENT
PAYMENT_FAILED
CONFIRMED
PROCESSING
COMPLETED
CANCELLED
```

---

## 9. Order Items

### Purpose

Represents line-item snapshots inside an order.

### High-Level Shape

```txt
OrderItem
- id
- orderId
- vendorListingId
- catalogProductId
- productName
- unit
- unitPrice
- quantity
- subtotal
- createdAt
```

Owns:

- immutable purchase-time line item data

Relationships:

- belongs to one order
- references one vendor listing as source context
- references one catalog product as identity context

Important rules:

- snapshot data must not depend on current listing values later
- preserves historical correctness if listing price changes
- preserves historical correctness if product name or unit changes later
- one order can contain many order items

---

## 10. Payments

### Purpose

Represents payment result separately from order.

### High-Level Shape

```txt
Payment
- id
- orderId
- customerId
- amount
- paymentMethod
- paymentStatus
- providerReference
- failureReason (optional)
- createdAt
- updatedAt
```

Owns:

- payment state
- attempted amount
- payment outcome metadata

Relationships:

- belongs to one order
- belongs to one customer

Important rules:

- one order has one payment in v1
- payment is separate from order
- payment success confirms order and reduces stock
- payment failure does not affect stock
- vendor does not control payment state

Lifecycle:

```txt
PENDING
SUCCESS
FAILED
```

High-level constraint:

```txt
Unique(orderId)
```

---

## 11. Reviews

### Purpose

Represents customer feedback tied to an eligible completed purchase context.

### High-Level Shape

```txt
Review
- id
- customerId
- vendorId
- catalogProductId
- vendorListingId
- orderId
- orderItemId
- rating
- comment (optional)
- vendorReplyText (optional)
- vendorReplyAt (optional)
- createdAt
- updatedAt
```

Owns:

- customer review content
- one vendor reply
- verified purchase context

Relationships:

- belongs to one customer
- belongs to one vendor context
- belongs to one catalog product context
- belongs to one vendor listing context
- belongs to one order / order item context

Important rules:

- only customers can review
- review allowed only after completed order
- one reply per review by vendor
- no separate review reply table in v1
- vendor can reply only to own review context

High-level constraint:

```txt
Unique(orderItemId)
```

This means one review per purchased order-item context in v1.

---

## 12. Campaigns

### Purpose

Represents vendor-owned promotional campaign cards.

### High-Level Shape

```txt
Campaign
- id
- vendorId
- title
- shortDescription
- image
- startDate
- endDate
- campaignStatus
- rejectionReason (optional)
- createdAt
- updatedAt
```

Owns:

- campaign content
- campaign scheduling window
- campaign moderation state

Relationships:

- belongs to one vendor

Important rules:

- one vendor can have max 5 campaigns
- campaign requires admin approval for visibility
- one image only in v1
- campaign does not change checkout pricing
- campaign visibility depends on status + date window + vendor state

Lifecycle:

```txt
DRAFT
PENDING_APPROVAL
APPROVED
REJECTED
EXPIRED
ARCHIVED
```

---

## 13. Audit Logs

### Purpose

Represents traceable record of important business/domain events.

### High-Level Shape

```txt
AuditLog
- id
- eventType
- entityType
- entityId
- actorUserId (optional)
- actorVendorId (optional)
- actorRole
- message
- metadata (optional)
- createdAt
```

Owns:

- event trace metadata
- actor context
- resource context
- optional supporting metadata

Relationships:

- loosely references many business resources by type + id
- may reference user/vendor actor context

Important rules:

- audit log is not the source of truth
- only important domain events should be logged
- not every trivial update needs an audit record
- metadata should be structured in implementation, even if represented simply here

---

## Relationship Summary

### Identity

```txt
User 1 --- 0..1 Vendor
User 1 --- * Orders
User 1 --- * Reviews
User 1 --- 0..1 ActiveCart
```

### Catalog

```txt
Category 1 --- * CatalogProducts
CatalogProduct 1 --- * VendorListings
Vendor 1 --- * VendorListings
```

### Cart

```txt
Cart 1 --- * CartItems
VendorListing 1 --- * CartItems
```

### Orders

```txt
Order 1 --- * OrderItems
Order 1 --- 1 Payment
VendorListing 1 --- * OrderItems
CatalogProduct 1 --- * OrderItems
Vendor 1 --- * Orders
```

### Reviews

```txt
OrderItem 1 --- 0..1 Review
VendorListing 1 --- * Reviews
CatalogProduct 1 --- * Reviews
Vendor 1 --- * Reviews
User 1 --- * Reviews
```

### Campaigns

```txt
Vendor 1 --- * Campaigns
```

---

## Key Cross-Entity Rules

### Product Comparison Rule

The customer compares vendors through:

```txt
CatalogProduct -> VendorListings
```

Not through vendor-created duplicate product identities.

### Purchase Rule

Customer buys:

```txt
VendorListing
```

Not:

```txt
CatalogProduct
```

### Inventory Rule

Stock lives in:

```txt
VendorListing.stockQuantity
```

Not in:

```txt
CatalogProduct
```

### Snapshot Rule

Historical purchase truth lives in:

```txt
OrderItem.productName
OrderItem.unit
OrderItem.unitPrice
```

Not in current listing fields.

### Earnings Rule

Vendor earnings are derived from:

```txt
Orders where status = COMPLETED
```

Not from a mutable payout or balance field in v1.

---

## Enum Summary

### User Roles

```txt
CUSTOMER
VENDOR
ADMIN
```

### User Account Status

```txt
ACTIVE
SUSPENDED
ARCHIVED
```

### Vendor Approval Status

```txt
PENDING_APPROVAL
APPROVED
REJECTED
SUSPENDED
ARCHIVED
```

### Category Status

```txt
ACTIVE
INACTIVE
ARCHIVED
```

### Catalog Product Status

```txt
ACTIVE
INACTIVE
ARCHIVED
```

### Listing Moderation Status

```txt
DRAFT
PENDING_APPROVAL
APPROVED
REJECTED
ARCHIVED
```

### Listing Selling Status

```txt
ACTIVE
INACTIVE
```



### Order Status

```txt
PENDING_PAYMENT
PAYMENT_FAILED
CONFIRMED
PROCESSING
COMPLETED
CANCELLED
```

### Payment Method

```txt
MOCK_CARD
```

### Payment Status

```txt
PENDING
SUCCESS
FAILED
```

### Campaign Status

```txt
DRAFT
PENDING_APPROVAL
APPROVED
REJECTED
EXPIRED
ARCHIVED
```
