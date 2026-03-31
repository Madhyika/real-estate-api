const db = require("../db/db");

function normalizeKeyword(keyword) {
  return String(keyword || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function buildTokenSearchClause(params, tokens, columns) {
  const tokenClauses = [];

  tokens.forEach((token) => {
    params.push(`%${token}%`);
    const paramRef = `$${params.length}`;
    tokenClauses.push(
      `(${columns.map((column) => `${column} ILIKE ${paramRef}`).join(" OR ")})`,
    );
  });

  return tokenClauses;
}

function buildFilterQuery(filters) {
  const clauses = [];
  const filterParams = [];
  const orderByParams = [];
  let orderBy = "ORDER BY p.id ASC";

  if (filters.property_type) {
    filterParams.push(filters.property_type);
    clauses.push(`p.property_type = $${filterParams.length}`);
  }
  if (filters.price_min) {
    filterParams.push(parseInt(filters.price_min, 10));
    clauses.push(`p.price >= $${filterParams.length}`);
  }
  if (filters.price_max) {
    filterParams.push(parseInt(filters.price_max, 10));
    clauses.push(`p.price <= $${filterParams.length}`);
  }
  if (filters.beds_min) {
    filterParams.push(parseInt(filters.beds_min, 10));
    clauses.push(`p.beds >= $${filterParams.length}`);
  }
  if (filters.beds_max) {
    filterParams.push(parseInt(filters.beds_max, 10));
    clauses.push(`p.beds <= $${filterParams.length}`);
  }
  if (filters.baths_min) {
    filterParams.push(parseInt(filters.baths_min, 10));
    clauses.push(`p.baths >= $${filterParams.length}`);
  }
  if (filters.baths_max) {
    filterParams.push(parseInt(filters.baths_max, 10));
    clauses.push(`p.baths <= $${filterParams.length}`);
  }
  if (filters.suburb) {
    const suburbTokens = normalizeKeyword(filters.suburb);
    clauses.push(
      ...buildTokenSearchClause(filterParams, suburbTokens, [
        "p.suburb",
        "p.title",
        "p.description",
      ]),
    );

    if (suburbTokens.length > 0) {
      const phrase = `%${suburbTokens.join(" ")}%`;
      orderByParams.push(phrase);
      const suburbPhraseIndex = filterParams.length + orderByParams.length;
      orderByParams.push(phrase);
      const titlePhraseIndex = filterParams.length + orderByParams.length;

      orderBy = `
        ORDER BY
          CASE
            WHEN p.suburb ILIKE $${suburbPhraseIndex} THEN 0
            WHEN p.title ILIKE $${titlePhraseIndex} THEN 1
            ELSE 2
          END,
          p.id ASC
      `;
    }
  }
  if (filters.keyword) {
    const keywordTokens = normalizeKeyword(filters.keyword);
    clauses.push(
      ...buildTokenSearchClause(filterParams, keywordTokens, [
        "p.title",
        "p.description",
        "p.suburb",
        "p.property_type",
      ]),
    );

    if (keywordTokens.length > 0) {
      const phrase = `%${keywordTokens.join(" ")}%`;
      orderByParams.push(phrase);
      const titlePhraseIndex = filterParams.length + orderByParams.length;
      orderByParams.push(phrase);
      const descriptionPhraseIndex = filterParams.length + orderByParams.length;
      orderByParams.push(phrase);
      const suburbPhraseIndex = filterParams.length + orderByParams.length;

      orderBy = `
        ORDER BY
          CASE
            WHEN p.title ILIKE $${titlePhraseIndex} THEN 0
            WHEN p.description ILIKE $${descriptionPhraseIndex} THEN 1
            WHEN p.suburb ILIKE $${suburbPhraseIndex} THEN 2
            ELSE 3
          END,
          p.id ASC
      `;
    }
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, filterParams, orderByParams, orderBy };
}

async function getListings(filters = {}, pagination = {}) {
  const { where, filterParams, orderByParams, orderBy } = buildFilterQuery(
    filters,
  );
  const pageSize = Number(pagination.limit) || 6;
  const offset = Number(pagination.offset) || 0;

  const countQuery = `SELECT COUNT(*) as total FROM properties p ${where}`;
  const countRes = await db.query(countQuery, filterParams);
  const total = Number(countRes.rows[0].total);

  const selectQuery = `
    SELECT
      p.*, a.name as agent_name, a.email as agent_email, a.phone as agent_phone
    FROM properties p
    LEFT JOIN agents a ON p.agent_id = a.id
    ${where}
    ${orderBy}
    LIMIT $${filterParams.length + orderByParams.length + 1}
    OFFSET $${filterParams.length + orderByParams.length + 2}
  `;
  const queryParams = [...filterParams, ...orderByParams, pageSize, offset];
  const res = await db.query(selectQuery, queryParams);
  return { rows: res.rows, total };
}

async function getListingById(id) {
  const query = `
    SELECT
      p.*, a.name as agent_name, a.email as agent_email, a.phone as agent_phone
    FROM properties p
    LEFT JOIN agents a ON p.agent_id = a.id
    WHERE p.id = $1
    LIMIT 1
  `;
  const res = await db.query(query, [id]);

  return res.rows[0];
}

module.exports = {
  getListings,
  getListingById,
  buildFilterQuery,
  normalizeKeyword,
  buildTokenSearchClause,
};
