
const express = require("express");
const { uploadImage } = require("../controller/image_process");
const upload = require("../utils/multer");
const router = express.Router();

router.route("/image-process", upload.single('image')).post(uploadImage);

module.exports = router