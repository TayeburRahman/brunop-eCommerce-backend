const express = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { ProductController } = require("./product.controller");
const { uploadFile } = require("../../middlewares/fileUploader");

const router = express.Router();

router
  .get(
    "/get-details/:id",
    ProductController.getProductDetails
  )
  .post(
    "/create",
    uploadFile(),
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
    ProductController.createProduct
  )
  .patch(
    "/update/:productId",
    uploadFile(),
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
    ProductController.productUpdates
  )
  .delete(
    "/delete/:id",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
    ProductController.deleteProduct
  )
  .get(
    "/get-all", 
    ProductController.getAllProducts
  )
// --------------------
.patch(
  "/favorite", 
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.MANAGER),
  ProductController.toggleFavorite
)
 

module.exports = router;
