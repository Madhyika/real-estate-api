require("dotenv").config();
const db = require("./db");

const createSql = `
  CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    suburb TEXT NOT NULL,
    price INT NOT NULL,
    beds INT NOT NULL,
    baths INT NOT NULL,
    property_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    internal_notes TEXT,
    agent_id INT REFERENCES agents(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
  CREATE INDEX IF NOT EXISTS idx_properties_suburb ON properties(suburb);
  CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
  CREATE INDEX IF NOT EXISTS idx_properties_beds ON properties(beds);
  CREATE INDEX IF NOT EXISTS idx_properties_baths ON properties(baths);
  CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_properties_suburb_type_price
    ON properties(suburb, property_type, price);
`;

const seedSql = `
  INSERT INTO agents (name, email, phone) VALUES
    ('Ram  Adhikari', 'ram@broker.com', '9876543210'),
    ('Sita  Sharma', 'sita@broker.com', '9876543210'),
    ('Hari  Karki', 'hari@broker.com', '9876543210');

  INSERT INTO properties (title, description, suburb, price, beds, baths, property_type, status, internal_notes, agent_id)
  VALUES
    ('Sunny 3BR Villa in Naxal', 'Bright and modern villa close to schools and temples', 'Naxal', 550000, 3, 2, 'House', 'active', 'Needs minor paint touch-up', 1),
    ('Apartment in Thamel', 'Convenient apartment in the heart of Kathmandu, walking distance to cafes and shops', 'Thamel', 450000, 2, 1, 'Apartment', 'active', 'Owner prefers 45-day closing period', 2),
    ('Estate in Lazimpat', 'Beautiful estate with large gardens and mountain views', 'Lazimpat', 1200000, 5, 4, 'House', 'active', 'High demand area near embassies', 1),
    ('Cozy Studio in Baneshwor', 'Affordable studio apartment perfect for first-time buyers', 'Baneshwor', 250000, 1, 1, 'Apartment', 'pending', 'Great for investors', 3),
    ('Family Home in Pulchowk', 'Spacious home with 3-car garage near playgrounds and schools', 'Pulchowk', 760000, 4, 3, 'House', 'active', 'Recently renovated roof', 1),
    ('Apartment in Jhamsikhel', 'Well-lit apartment with balcony seating and easy access to cafes and restaurants', 'Jhamsikhel', 520000, 2, 2, 'Apartment', 'active', 'Popular with young families', 2),
    ('House in Bhaktapur', 'Traditional brick home with renovated interiors and a sunny courtyard', 'Bhaktapur', 680000, 3, 2, 'House', 'active', 'Heritage facade must be preserved', 3),
    ('Penthouse in Boudha', 'Top-floor apartment with monastery views, elevator access, and private terrace', 'Boudha', 980000, 3, 3, 'Apartment', 'active', 'Premium pricing justified by terrace size', 2),
    ('Home in Kapan', 'Compact detached home in a quiet neighborhood with gated parking', 'Kapan', 390000, 2, 1, 'House', 'pending', 'Awaiting final bank valuation', 1),
    ('Modern Flat in Patan', 'Freshly updated flat near schools, markets, and daily transit routes', 'Patan', 470000, 2, 2, 'Apartment', 'active', 'Seller open to furnished offer', 3),
    ('Corner Plot in Tokha', 'Large family house with corner exposure, roof deck, and extra storage', 'Tokha', 830000, 4, 3, 'House', 'active', 'Best shown on weekends', 1),
    ('Investor Unit in Koteshwor', 'Low-maintenance apartment with strong rental demand and convenient road access', 'Koteshwor', 310000, 1, 1, 'Apartment', 'sold', 'Recently closed above asking', 2);
`;

async function seed() {
  try {
    await db.query("BEGIN");
    await db.query(createSql);
    await db.query(
      "TRUNCATE TABLE properties, agents RESTART IDENTITY CASCADE",
    );
    await db.query(seedSql);
    await db.query("COMMIT");
    console.log("DB seed completed.");
    process.exit(0);
  } catch (err) {
    await db.query("ROLLBACK").catch(() => {});
    console.error("Failed to seed DB", err);
    process.exit(1);
  }
}

seed();
