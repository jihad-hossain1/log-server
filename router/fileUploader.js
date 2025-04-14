const express = require("express");
const { fileUpload } = require("../controller/fileUploader.controller");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), fileUpload);

module.exports = router;
