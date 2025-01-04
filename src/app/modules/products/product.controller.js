const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse"); 
const { ProductsService } = require("./product.service");


const createProduct = catchAsync(async (req, res) => {
  const result = await ProductsService.createProduct(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product Create Successfully",
    data: result,
  });
});

const productUpdates = catchAsync(async (req, res ) => {
  const result = await ProductsService.updateProduct(req); 
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product Update Successfully!',
    data: result,
  });
});

const getProductDetails = catchAsync(async (req, res) => {
  const result = await ProductsService.getProductDetails(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product details retrieved successfully",
    data: result,
  });
});
  
const deleteProduct = catchAsync(async (req, res) => { 
  const result = await ProductsService.deleteProduct(req.params);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Delete product successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => { 
  const result = await ProductsService.getAllProducts(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get all product successfully",
    data: result,
  });
});
// -----------------------
const toggleFavorite = catchAsync(async (req, res) => {
  const result = await ProductsService.toggleFavorite(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Toggle Favorite Successfully",
    data: result,
  });
});
// -----------------------
const getUserFavorite = catchAsync(async (req, res) => {
  const result = await ProductsService.getUserFavorite(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: " Get My Favorite Products Successfully",
    data: result,
  });
});

const getProductDetailsAdmin = catchAsync(async (req, res) => {
  const result = await ProductsService.getProductDetailsAdmin(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: " Get Product Details Successfully",
    data: result,
  });
});

 

const ProductController = { 
  createProduct,
  productUpdates,
  deleteProduct,
  getProductDetails, 
  getAllProducts,
  toggleFavorite,
  getUserFavorite,
  getProductDetailsAdmin
   
 
};

module.exports = { ProductController };
