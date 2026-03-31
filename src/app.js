require("dotenv").config();
const express = require("express");
const cors = require("cors");

const propertyRoutes = require("./routes/propertyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/listings", propertyRoutes);
app.use("/listings", propertyRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
