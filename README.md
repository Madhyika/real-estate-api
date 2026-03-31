# Real Estate Listing Search API

## Overview

A Node.js/Express + PostgreSQL API for the listing-search backbone of a real-estate broker site.

It provides:

- Search and filter (`/api/listings`)
- Listing detail (`/api/listings/:id`)
- Role-aware output (`is_admin` / admin users can see internal notes)
- Pagination and URL-friendly filters
- PostgreSQL relational data model (`agents`, `properties`)
- Indexes for common search fields
- Automated tests with Jest

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create or update `.env` in the API root:

   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/realestate
   PORT=3001
   ```

3. Create database if needed:

   ```bash
   createdb realestate
   ```

4. Seed the database:

   ```bash
   npm run seed
   ```

5. Start server:

   ```bash
   npm start
   ```

The API runs on `http://localhost:3001` by default.

## API Endpoints

### Get Listings

GET `/listings` or `/api/listings`

Query params:

- `suburb` (string)
- `property_type` (string)
- `price_min`, `price_max` (integer)
- `beds_min`, `beds_max`, `baths_min`, `baths_max` (integer)
- `keyword` (string search in title/description)
- `limit` (integer, default 10)
- `offset` (integer, default 0)

Admin flag / role headers:

- `x-is-admin: true` or `is_admin: true` sets the server-side boolean admin flag
- `x-user-role: admin` is also supported for compatibility
- non-admin requests do not receive `internal_notes`

Example:

```bash
curl "http://localhost:3001/listings?suburb=Naxal&price_min=500000&limit=5" -H "x-is-admin: false"
```

### Get Listing Detail

GET `/listings/:id` or `/api/listings/:id`

Example:

```bash
curl "http://localhost:3001/listings/1" -H "x-is-admin: true"
```

## Testing

Run:

```bash
npm test
```

## Database Schema

- `agents` table (id, name, email, phone)
- `properties` table (id, title, description, suburb, price, beds, baths, property_type, status, internal_notes, agent_id)
- Indexes on `price`, `suburb`, `property_type`, `beds`, `baths`, `created_at`
- Composite index on `(suburb, property_type, price)`

## Seed Data

Seed the database with sample agents and property listings:

```bash
npm run seed
```
