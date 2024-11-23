const ApiError = require("../../../errors/ApiError");
const Products = require("../products/product.model");
const { Carts } = require("./order.model");
const User = require("../user/user.model");

const productAddToCart = async (req) => {
  const { userId } = req.user;  
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    throw new ApiError(400, "Product ID and quantity are required.");
  }

  const product = await Products.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  let cart = await Carts.findOne({ user: userId });

  if (!cart) { 
    cart = new Carts({
      user: userId,
      items: [{ product: productId, quantity }],
      total_amount: product.price * quantity,  
    });
  } else { 
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) { 
      existingItem.quantity += quantity;
    } else { 
      cart.items.push({ product: productId, quantity });
    }
 
    cart.total_amount = cart.items.reduce(
      (total, item) => total + item.quantity * product.price,
      0
    );
  }

  const savedCart = await cart.save();
  if (!savedCart) {
    throw new ApiError(500, "Failed to update cart.");
  }

  return savedCart;
};

const getUserCartData = async (payload) => {
  const { userId } = payload;

  if (!userId) {
    throw new ApiError(401, "Unauthorized access.");
  }
 
  const cart = await Carts.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price",  
  });

  return cart;
};
// ---------------------
const updateAddress = async (request) => {
  const { userId } = request.user;
  const { name, contact_no, delivery_address } = request.body;

  if (!name || !contact_no || !delivery_address) {
    throw new ApiError(400, "All fields are required.");
  }
 
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "address.name": name,
        "address.contact_no": contact_no,
        "address.delivery_address": delivery_address,
      },
    },
    { new: true, runValidators: true }  
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};
// ---------------------

 


const OrdersService = {
  productAddToCart, 
  getUserCartData,
  updateAddress
}

module.exports = OrdersService;