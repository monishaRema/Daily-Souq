# Listing Rules

## Overview

This document defines the business rules for vendor listings in DailySouq.

A vendor listing is the core commerce resource of the marketplace.

It represents:

> one vendor selling one shared catalog product under vendor-specific commercial terms

Customers compare and buy listings, not generic catalog products.

---

## Listing Purpose

A listing owns the vendor-specific commercial data for a product:

- price
- stock
- moderation state
- selling availability

The shared product identity stays in `catalog_products`.

This separation is one of the most important design decisions in the system.

---

## Listing Ownership

### Vendor owns

- creation of own listing
- current price
- current stock
- selling active/inactive state

### Admin owns

- moderation decision
- approval/rejection/archive control

### Customer owns

- no listing mutation
- customer only reads eligible listings and buys them

---

## Core Listing Rules

### Rule 1: listing must belong to one vendor

Every listing belongs to exactly one vendor.

### Rule 2: listing must belong to one catalog product

Every listing represents one vendor selling one existing shared catalog product.

### Rule 3: one vendor cannot duplicate same product listing

In v1, a vendor may list a catalog product only once.

Business constraint:

```txt
Unique(vendorId, catalogProductId)
```

### Rule 4: listing owns stock

Stock belongs only to vendor listing.

### Rule 5: listing owns current price

Current price belongs only to vendor listing.

### Rule 6: listing does not own shared product identity

Vendor cannot rename the shared catalog product through listing.

---

## Listing Creation Rules

Vendor can create a listing only if:

- vendor profile exists
- vendor is eligible to participate
- target catalog product exists
- target catalog product is active
- target category is valid/active
- no duplicate vendor listing exists for the same product

### Listing input in v1

Vendor provides:

- price
- stock
- optional vendor SKU if used

Vendor does not provide:

- new catalog product identity
- category creation
- product identity mutation

---

## Listing Moderation Lifecycle

Listings use a moderation lifecycle:

```txt
DRAFT
PENDING_APPROVAL
APPROVED
REJECTED
ARCHIVED
```

### `DRAFT`

Listing created but not yet submitted.

### `PENDING_APPROVAL`

Listing submitted and waiting for admin decision.

### `APPROVED`

Listing accepted by admin. Can become publicly visible if other visibility rules are satisfied.

### `REJECTED`

Listing rejected by admin.

### `ARCHIVED`

Listing removed from normal active use.

---

## Listing Selling State

Moderation state and selling state are separate.

Selling state in v1:

```txt
ACTIVE
INACTIVE
```

### Why separate them

A listing can be:

- approved but inactive
- approved and active
- rejected and inactive
- archived and not sellable

This avoids mixing marketplace moderation with vendor operational intent.

---

## Effective Listing Visibility Rule

A listing is publicly visible and buyable only if all conditions are true:

- moderation status is `APPROVED`
- selling status is `ACTIVE`
- vendor is approved/active
- catalog product is active
- stock > 0 for buyability

If any of these fail, listing should not be treated as normally buyable.

---

## Vendor Editable Fields

After listing is approved, vendor can still update operational fields.

Vendor may update directly:

- current price
- stock quantity
- selling status (`ACTIVE` / `INACTIVE`)

Vendor may not update through listing:

- catalog product identity
- category assignment
- admin moderation state

---

## Stock Rules

### Stock belongs to listing

Each vendor controls stock for their own listing only.

### Stock must never be negative

Any operation leading to negative stock must fail.

### Stock is not reserved in cart

Adding a product to cart does not reduce stock.

### Stock is revalidated at checkout

Because cart is not a reservation system, stock must be checked again during checkout/payment confirmation.

### Stock reduces only at order confirmation

Stock reduction happens when:

- payment succeeds
- order becomes `CONFIRMED`

Not when:

- listing is added to cart
- order is created
- order becomes `PROCESSING`
- order becomes `COMPLETED`

---

## Price Rules

### Current price only in v1

Listing stores only current price.

### No price history feature in v1

Historical price charting is intentionally excluded.

### Optional audit trace

Price update actions may create audit log entries.

### No discount pricing in v1

Promotional campaigns do not change listing checkout price.

---

## Listing and Product Comparison

Customer compares vendors through:

```txt
CatalogProduct -> VendorListings
```

Example:

```txt
Potato
Vendor A -> 4.50 QAR
Vendor B -> 4.00 QAR
Vendor C -> 4.20 QAR
```

### Generic product page summary

For the shared product, the system may show:

- From X QAR
- Y vendors

This summary is derived from eligible listings.

---

## Listing Query Expectations

### Vendor dashboard view

Vendor should be able to see:

- all own listings
- listing status
- stock
- price
- activity state

### Customer product comparison view

Customer should be able to see:

- vendor name
- current price
- stock availability
- only eligible listings

### Admin moderation view

Admin should be able to see:

- pending listings
- rejected listings
- archived listings
- who created what

---

## Rejection and Resubmission Rules

### If listing is rejected

Vendor may:

- inspect rejection reason if exposed
- update allowed fields
- resubmit for approval

### If listing is archived

Treat as no longer part of normal active selling flow.

---

## Forbidden Behaviors

The following are not allowed in v1:

- vendor creating duplicate listing for same product
- vendor creating shared catalog product
- vendor modifying another vendor's listing
- customer buying unapproved listing
- customer buying inactive listing
- customer buying out-of-stock listing
- stock dropping below zero
- discount logic embedded into listing pricing
- price history feature built into listing core model

---

## Audit Logging Expectations

Important listing events should create audit entries.

Recommended events:

- `LISTING_CREATED`
- `LISTING_SUBMITTED`
- `LISTING_APPROVED`
- `LISTING_REJECTED`
- `LISTING_ARCHIVED`
- `LISTING_PRICE_UPDATED`
- `LISTING_STOCK_UPDATED`
- `LISTING_SELLING_STATUS_CHANGED`

---

## Final Listing Rule Summary

A listing is the core sellable marketplace resource.

It must preserve:

- vendor-specific ownership
- shared catalog consistency
- clean moderation
- safe stock handling
- clear price responsibility

This resource should remain tightly controlled. Do not let it drift into a generic "product" model.
