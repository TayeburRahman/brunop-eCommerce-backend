const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError"); 
const Products = require("./product.model");
const QueryBuilder = require("../../../builder/queryBuilder");
 

//==Products ========================
const getProductDetailsAdmin = async (req) => {
  const { id } = req.params; 

  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing product Id");
  }

  const details = await Products.findById(id).lean();
  if (!details) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found!");
  } 

  delete details.favorite;

  return details;
}
const getProductDetails = async (req) => {
  const { id } = req.params;
  const { userId } = req.user;

  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing product Id");
  }

  const details = await Products.findById(id).lean();
  if (!details) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found!");
  }
  details.userFavorite = Array.isArray(details.favorite) && details.favorite.includes(userId);
  details.favoriteCount = Array.isArray(details.favorite) ? details.favorite.length : 0;

  delete details.favorite;

  const query = req.query;
  const userQuery = new QueryBuilder(Products.find(), query)
    .search(["name", "description"])
    .filter()
    .sort()
    .paginate() 
    .fields();

  const filters = userQuery.modelQuery.getFilter();

  const pipeline = [
    { $match: filters }, 
    {
      $addFields: {
        favoriteCount: {
          $cond: {
            if: { $isArray: "$favorite" },
            then: { $size: "$favorite" }, 
            else: 0,
          },
        },
        userFavorite: {
          $cond: {
            if: { $isArray: "$favorite" },
            then: { $in: [userId, "$favorite"] }, 
            else: false,
          },
        },
      },
    },
    {
      $project: {
        favorite: 0, 
      },
    },
    { $sort: { favoriteCount: -1 } }, 
    { $skip: (query.page - 1) * query.limit },  
    { $limit: parseInt(query.limit) || 10 }, 
  ];
 
  const result = await Products.aggregate(pipeline);
 
  const totalProducts = await Products.countDocuments(filters);

  const meta = {
    page: parseInt(query.page) || 1,
    limit: parseInt(query.limit) || 10,
    total: totalProducts,
    totalPage: Math.ceil(totalProducts / (parseInt(query.limit) || 10)),
  };
 
  const allProduct = result.filter((product) => product._id.toString() !== id);

  return { details, allProduct, meta };
};

const createProduct = async (req) => {
  const files = req.files || {};  
  const {price, ...payload} = req.body;
  const { authId } = req.user; 
  payload.price = Number(price)

  console.log(payload)
 
  const requiredFields = ["name", "description", "store", "price"];
 
  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new ApiError(400, `${field} is required.`);
    }
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
 
const getAllProducts = async (req) => {
  try {
    const query = req.query;
    const { userId } = req.user;

    // Check if userId exists
    if (!userId) {
      throw new Error("User ID is required for this operation.");
    }

    // QueryBuilder setup
    const userQuery = new QueryBuilder(Products.find(), query)
      .search(["name", "description"])
      .filter()
      .sort()
      .paginate()
      .fields();

    // Get the filters applied by the QueryBuilder
    const filters = userQuery.modelQuery.getFilter();

    // Aggregation pipeline
    const aggregationPipeline = [
      { $match: filters },
      {
        $addFields: {
          favoriteCount: {
            $cond: {
              if: { $isArray: "$favorite" },
              then: { $size: "$favorite" },
              else: 0,
            },
          },
          userFavorite: {
            $cond: {
              if: { $isArray: "$favorite" },
              then: { $in: [userId, "$favorite"] },
              else: false,
            },
          },
        },
      },
      {
        $project: {
          favorite: 0,  // Hide favorite field in the final output
        },
      },
      {
        $sort: query.sortBy ? { [query.sortBy]: query.sortOrder === "asc" ? 1 : -1 } : { favoriteCount: -1 },
      },
      { $skip: (Number(query.page) - 1 || 0) * (Number(query.limit) || 10) },
      { $limit: Number(query.limit) || 10 },
    ];

    // Execute the aggregation
    const result = await Products.aggregate(aggregationPipeline);

    // Get metadata for pagination
    const meta = await userQuery.countTotal();

    return { result, meta };

  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

//=Favorite ===============================
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

const getUserFavorite = async (request) => {
  const { userId } = request.user;
  const { page = 1, limit = 10 } = request.query;  
 
  const pageNum = Number(page);
  const limitNum = Number(limit);
 
  const skip = (pageNum - 1) * limitNum;
 
  const favoriteProducts = await Products.find({ favorite: userId })
    .skip(skip)   
    .limit(limitNum)  
    .select("-favorite")
    .lean();  
 
  const totalFavorites = await Products.countDocuments({ favorite: userId });
 
  const productsWithFavorite = favoriteProducts.map((product) => ({
    ...product,
    favorite: true,  
  }));
 
  const totalPages = Math.ceil(totalFavorites / limitNum);
 
  return {
    result: productsWithFavorite,
    meta: {
      page: pageNum,
      limit: limitNum,
      total: totalFavorites,
      totalPage: totalPages,
    },
  };
};

const ProductsService = { 
  createProduct,
  getProductDetails,
  deleteProduct, 
  updateProduct, 
  getAllProducts,
  toggleFavorite,
  getUserFavorite,
  getProductDetailsAdmin
};

module.exports = { ProductsService };
