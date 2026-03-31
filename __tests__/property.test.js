const propertyController = require("../src/controllers/propertyController");
const propertyService = require("../src/services/propertyService");
const roleMiddleware = require("../src/middleware/roleMiddleware");

jest.mock("../src/services/propertyService");

function createResponse() {
  return {
    locals: {},
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("Property module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("listProperties returns paginated search results", async () => {
    propertyService.listProperties.mockResolvedValue({
      data: [{ id: 1, title: "Villa in Naxal" }],
      total: 1,
    });

    const req = {
      query: {
        suburb: "Naxal",
        price_min: "500000",
        limit: "5",
        offset: "0",
      },
    };
    const res = createResponse();
    res.locals.isAdmin = false;
    const next = jest.fn();

    await propertyController.listProperties(req, res, next);

    expect(propertyService.listProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        suburb: "Naxal",
        price_min: "500000",
      }),
      { limit: 5, offset: 0 },
      false,
    );
    expect(res.json).toHaveBeenCalledWith({
      meta: {
        total: 1,
        offset: 0,
        limit: 5,
        currentPage: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
      data: [{ id: 1, title: "Villa in Naxal" }],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("getPropertyById returns 404 when the listing does not exist", async () => {
    propertyService.getProperty.mockResolvedValue(null);

    const req = { params: { id: "999" } };
    const res = createResponse();
    res.locals.isAdmin = false;
    const next = jest.fn();

    await propertyController.getPropertyById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Property not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("roleMiddleware enables admin-only behaviour from the request header", () => {
    const req = {
      header: jest.fn().mockReturnValue("admin"),
    };
    const res = { locals: {} };
    const next = jest.fn();

    roleMiddleware(req, res, next);

    expect(res.locals.userRole).toBe("admin");
    expect(res.locals.isAdmin).toBe(true);
    expect(res.locals.is_admin).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  it("roleMiddleware supports a boolean is_admin header", () => {
    const req = {
      header: jest.fn((name) => {
        if (name === "x-is-admin") return "true";
        if (name === "x-user-role") return "user";
        return undefined;
      }),
    };
    const res = { locals: {} };
    const next = jest.fn();

    roleMiddleware(req, res, next);

    expect(res.locals.userRole).toBe("admin");
    expect(res.locals.isAdmin).toBe(true);
    expect(res.locals.is_admin).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  it("supports the type alias and caps limit to 100", async () => {
    propertyService.listProperties.mockResolvedValue({
      data: [{ id: 2, title: "House Listing" }],
      total: 1,
    });

    const req = {
      query: {
        type: "House",
        limit: "250",
      },
    };
    const res = createResponse();
    res.locals.isAdmin = true;
    const next = jest.fn();

    await propertyController.listProperties(req, res, next);

    expect(propertyService.listProperties).toHaveBeenCalledWith(
      expect.objectContaining({ property_type: "House" }),
      { limit: 100, offset: 0 },
      true,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("buildFilterQuery creates SQL for common filters", () => {
    const { buildFilterQuery } = jest.requireActual(
      "../src/repositories/propertyRepository",
    );
    const { where, filterParams, orderByParams, orderBy } = buildFilterQuery({
      suburb: "North side",
      price_min: "100000",
      keyword: "Villa garden",
    });

    expect(where).toContain("p.suburb ILIKE");
    expect(where).toContain("p.title ILIKE");
    expect(where).toContain("p.price >=");
    expect(where).toContain("ILIKE");
    expect(filterParams).toEqual([
      100000,
      "%North%",
      "%side%",
      "%Villa%",
      "%garden%",
    ]);
    expect(orderByParams).toEqual([
      "%North side%",
      "%North side%",
      "%Villa garden%",
      "%Villa garden%",
      "%Villa garden%",
    ]);
    expect(orderBy).toContain("CASE");
  });
});
