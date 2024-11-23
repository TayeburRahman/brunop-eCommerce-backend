const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError"); 
const Products = require("./product.model");

// cron.schedule("* * * * *", async () => {
//   try {
//     const now = new Date();
//     const result = await Auth.updateMany(
//       {
//         isActive: false,
//         expirationTime: { $lte: now },
//         activationCode: { $ne: null },
//       },
//       {
//         $unset: { activationCode: "" },
//       }
//     );

//     if (result.modifiedCount > 0) {
//       logger.info(
//         `Removed activation codes from ${result.modifiedCount} expired inactive users`
//       );
//     }
//   } catch (error) {
//     logger.error("Error removing activation codes from expired users:", error);
//   }
// });

//==Products ========================


const getProductDetails = async (params) => {
  const { id } = params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing product Id");
  } 

  const result = await Products.findById(id)
  
  // .populate("authId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, `Product not found!`);
  }
  return result;
};

const createProduct = async (req) => {
  const files = req.files || {};  
  const payload = req.body;
  const { authId } = req.user;
 
  const requiredFields = ["name", "description", "store", "price"];
 
  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new ApiError(400, `${field} is required.`);
    }
  }
 
  if (isNaN(payload.price) || payload.price <= 0) {
    throw new ApiError(400, "Price must be a positive number.");
  }

  if (isNaN(payload.store) || payload.store <= 0) {
    throw new ApiError(400, "Price must be a positive number.");
  } 
 
  if (files.product_image) {
    payload.product_image = files.product_image.map(
      (file) => `/images/products/${file.filename}`
    );
  }
 
  payload.owner = authId;
 
  const newProduct = new Products(payload);
  const savedProduct = await newProduct.save();

  if (!savedProduct) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create product."
    );
  }

  return savedProduct;
}; 
 
const deleteProduct= async (params) => {
  const { id } = params;
 
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing product Id");
  } 
  const result = await Products.findByIdAndDelete(id)
   
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, `Product not found!`);
  }
  return `Delete Product Id: ${result._id}`;
};
  
const updateProduct = async (req) => {
  const files = req.files || {};  
  const payload = req.body;
  const { productId } = req.params;   

  if (!productId) {
    throw new ApiError(400, "Product ID is required.");
  }
 
  const existingProduct = await Products.findById(productId);
  if (!existingProduct) {
    throw new ApiError(404, "Product not found.");
  }
 
  if (files.product_image) {
    payload.product_image = files.product_image.map(
      (file) => `/images/products/${file.filename}`
    );
  }
 
  if (payload.price && (isNaN(payload.price) || payload.price <= 0)) {
    throw new ApiError(400, "Price must be a positive number.");
  }
  if (payload.quantity && (!Number.isInteger(Number(payload.quantity)) || payload.quantity < 0)) {
    throw new ApiError(400, "Quantity must be a non-negative integer.");
  }

  // Update the product
  const updatedProduct = await Products.findByIdAndUpdate(
    productId,
    { $set: payload },
    { new: true, runValidators: true } 
  );

  if (!updatedProduct) {
    throw new ApiError(500, "Failed to update product.");
  }

  return updatedProduct;
};

const getAllProducts= async () => { 
  const result = await Products.find({})
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, `Product not found!`);
  }
  return result;
};

// --Favorite ----------------------------
const toggleFavorite = async (request) => {
  const { productId } = request.query;
  const { userId } = request.user;

  if (!productId || !userId) {
    throw new ApiError(400, "Product ID and user ID are required.");
  }
 
  const product = await Products.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }
 
  const userIndex = product.favorite.indexOf(userId);

  if (userIndex === -1) { 
    product.favorite.push(userId);
  } else { 
    product.favorite.splice(userIndex, 1);
  }
 
  const updatedProduct = await product.save();
  if (!updatedProduct) {
    throw new ApiError(500, "Failed to update favorites.");
  }

  return updatedProduct;
};

 



 

const ProductsService = { 
  createProduct,
  getProductDetails,
  deleteProduct, 
  updateProduct, 
  getAllProducts,
  toggleFavorite
};

module.exports = { ProductsService };