
const express = require("express");
const { fileUpload } = require("../controller/fileUploader.controller");
const router = express.Router();

router.route("/file-upload").post(fileUpload);

module.exports = router