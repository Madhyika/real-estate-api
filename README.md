# Real Estate Listing Search API

## Overview

A Node.js/Express API for browsing real estate listings, with:

- Search and filter (`/api/listings`)
- Listing detail (`/api/listings/:id`)
- Role-aware output (`admin` sees internal notes)
- Pagination and URL-friendly filters
- PostgreSQL relational data model (`agents`, `properties`)
- Indexes for common search fields
- Unit/integration tests with Jest + Supertest

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

Role header:

- `x-is-admin: true` or `is_admin: true` sets the server-side boolean admin flag
- `x-user-role: admin` returns internal notes
- `x-user-role: user` hides admin-only fields

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

## Frontend Demo

A separate Next.js frontend is available in the `../real-estate-frontend/` directory.

To run the frontend:

1. In a separate terminal, navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the frontend: `npm run dev`
4. Open `http://localhost:3000` in the browser

The frontend provides a property search page with filters and property detail pages.

## Testing

Run:

```bash
npm test
```

## Database schema

- `agents` table (id, name, email, phone)
- `properties` table (id, title, description, suburb, price, beds, baths, property_type, status, internal_notes, agent_id)
- Indexes on `price`, `suburb`, `property_type`, `beds`, `baths`, `created_at`
- Composite index on `(suburb, property_type, price)`
