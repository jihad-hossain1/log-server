const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = new express();

app.use(
  cors({ credentials: true, origin: true, exposedHeaders: ["Set-Cookie"] })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// route importer

const appLog = require('./router/appLog');
// const productCategory = require("./routes/productCategoryRoutes");


app.use("/api", appLog);
// app.use("/api", productCategory);

module.exports = app;