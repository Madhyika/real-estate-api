const propertyService = require("../services/propertyService");

function parseInteger(value, defaultValue) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) || n < 0 ? defaultValue : n;
}

async function listProperties(req, res, next) {
  try {
    const propertyType = req.query.property_type || req.query.type;
    const filters = {
      suburb: req.query.suburb,
      property_type: propertyType,
      price_min: req.query.price_min,
      price_max: req.query.price_max,
      beds_min: req.query.beds_min,
      beds_max: req.query.beds_max,
      baths_min: req.query.baths_min,
      baths_max: req.query.baths_max,
      keyword: req.query.keyword,
    };

    const pagination = {
      limit: Math.min(parseInteger(req.query.limit, 6), 100),
      offset: parseInteger(req.query.offset, 0),
    };

    const isAdmin = res.locals.isAdmin;
    const { data, total } = await propertyService.listProperties(
      filters,
      pagination,
      isAdmin,
    );
    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
    const totalPages =
      total === 0 ? 0 : Math.ceil(total / Math.max(pagination.limit, 1));

    res.json({
      meta: {
        total,
        offset: pagination.offset,
        limit: pagination.limit,
        currentPage,
        totalPages,
        hasPreviousPage: pagination.offset > 0,
        hasNextPage: pagination.offset + pagination.limit < total,
      },
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getPropertyById(req, res, next) {
  try {
    const id = req.params.id;
    const isAdmin = res.locals.isAdmin;
    const property = await propertyService.getProperty(id, isAdmin);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProperties,
  getPropertyById,
};
