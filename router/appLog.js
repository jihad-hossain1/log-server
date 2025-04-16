
const express = require("express");
const { appLogs } = require("../controller/appLogController");
const router = express.Router();

router.route("/logs").get(appLogs);

module.exports = router