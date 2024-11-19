const express = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { uploadFile } = require("../../middlewares/fileUploader");
const { ManagerController } = require("./manager.controller");

const router = express.Router();

router

module.exports = router;
