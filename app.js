const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = new express();

app.use(cors());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// route importer

const appLog = require("./router/appLog");
const imageResize = require("./router/image.process");

// const productCategory = require("./routes/productCategoryRoutes");

app.use("/api", appLog);
app.use("/api", imageResize);
app.use("/api", require("./router/fileUploader"));
// app.use("/api", productCategory);

module.exports = app;
