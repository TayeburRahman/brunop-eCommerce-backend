const express = require('express');
const auth = require('../../middlewares/auth'); 
const { uploadFile } = require('../../middlewares/fileUploader'); 
const AddsController = require('./media.controller');
const { ENUM_USER_ROLE } = require('../../../utils/enums');
const router = express.Router();

router.post(
  '/create-adds',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AddsController.insertIntoDB
);

router.get(
  '/all-adds',
  AddsController.allAdds
);

router.patch(
  '/edit-adds/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AddsController.updateAdds
);

router.delete(
  '/delete-adds/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AddsController.deleteAdds
);

module.exports = router;
