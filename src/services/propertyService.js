const propertyRepository = require("../repositories/propertyRepository");

function reduceForRole(property, isAdmin) {
  if (isAdmin) {
    return property;
  }

  const { internal_notes, ...publicFields } = property;
  return publicFields;
}

async function listProperties(filters, pagination, isAdmin) {
  const { rows, total } = await propertyRepository.getListings(
    filters,
    pagination,
  );
  const data = rows.map((row) => reduceForRole(row, isAdmin));
  return { data, total };
}

async function getProperty(id, isAdmin) {
  const row = await propertyRepository.getListingById(id);
  if (!row) return null;
  return reduceForRole(row, isAdmin);
}

module.exports = {
  listProperties,
  getProperty,
};
