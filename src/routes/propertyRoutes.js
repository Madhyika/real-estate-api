const express = require("express");
const router = express.Router();

const propertyController = require("../controllers/propertyController");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(roleMiddleware);

router.get("/", propertyController.listProperties);
router.get("/:id", propertyController.getPropertyById);

module.exports = router;
