# Project Overview

DailySouq is a backend system for a local multi-vendor grocery marketplace where multiple vendors sell the same products, allowing customers to compare prices and purchase from a single vendor per order.

The system is designed to model real-world marketplace behavior with a focus on:

- shared product catalog
- vendor-specific listings
- price comparison across vendors
- transactional checkout flow
- strict order and payment lifecycle
- role-based access control (RBAC)

## Core Idea

Instead of each vendor defining their own products, DailySouq uses a **shared catalog model**:

- Admin defines products (e.g., Potato, Onion)
- Vendors create listings for those products
- Customers compare listings (price, stock) across vendors

This ensures:
- consistent comparison
- clean relational modeling
- scalable marketplace structure

## System Focus

This project emphasizes backend engineering fundamentals:

- relational data modeling
- transactional integrity
- lifecycle-driven design
- clear separation of responsibilities
- predictable API design

## Key Constraint

To maintain system simplicity and correctness:

- each order belongs to **one vendor only**
- carts are **single-vendor**
- checkout is **transaction-safe**

## Target Outcome

The goal of this project is to demonstrate:

- ability to design a real-world backend system
- understanding of business rules and constraints
- clean architecture and API discipline