function parseBooleanFlag(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (["true", "1", "yes"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }

  return null;
}

function roleMiddleware(req, res, next) {
  const isAdminHeader =
    parseBooleanFlag(req.header("x-is-admin")) ??
    parseBooleanFlag(req.header("is_admin"));
  const roleHeader = (req.header("x-user-role") || "user").toLowerCase();
  const isAdmin = isAdminHeader ?? roleHeader === "admin";

  res.locals.userRole = isAdmin ? "admin" : "user";
  res.locals.isAdmin = isAdmin;
  res.locals.is_admin = isAdmin;
  next();
}

module.exports = roleMiddleware;
