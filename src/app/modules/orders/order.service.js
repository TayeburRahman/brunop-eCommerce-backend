const ApiError = require("../../../errors/ApiError");
const Products = require("../products/product.model");
const { Carts, Orders } = require("./order.model");
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
      items: [{ 
        product: productId, 
        quantity, 
        price: product.price 
      }],
      total_amount: product.price * quantity,  
    });
  } else {  
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {  
      existingItem.quantity += quantity;
    } else {  
      cart.items.push({ 
        product: productId, 
        quantity, 
        price: product.price 
      });
    }
    cart.total_amount = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
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

const getUserAddress = async (payload) => {
  const { userId } = payload;
  if (!userId) {
    throw new ApiError(401, "Unauthorized access! Please provide userId.");
  }

  const user = await User.findById(userId).select("name email address");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return user;
};

const checkUserStatus = async (payload) => {
  const { userId, type } = payload;
  if (!userId) {
    throw new ApiError(401, "Unauthorized access! Please provide userId!");
  }
  const user = await User.findById(userId).select("_id name email customerType");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
 let isMatch = false;
  if (type === "REGULAR" && user.customerType === "REGULAR") {
    isMatch = true;
  }
  if (type === "PREMIUM" && user.customerType === "PREMIUM") {
    isMatch = true;
  }
  return {
    isMatch,
    user
  };
};

const createOrder = async (req) => {
  const { user, items, total_amount, address, deliveryFee} = req.body;
  if (!user ||!items ||!total_amount ||!address || !deliveryFee) {
    throw new ApiError(400, "All required fields are missing.");
  }

  try {
    const newOrder = new Orders({
      user: user,
      items,
      total_amount: total_amount,
      deliveryFee,
      address,
    });

    const savedOrder = await newOrder.save();
    console.log("Order created successfully:", savedOrder);
    return savedOrder;
  } catch (error) {
    console.error("Error creating order:", error.message);
    throw new ApiError(400, "Error creating order:", error.message);
  }
};

const getPastOrders = async (payload) => {
  const { userId } = payload;
  if (!userId) {
    throw new ApiError(401, "Unauthorized access! Please provide userId!");
  } 

  const orders = await Orders.find({
    user: userId,
    status: { $in: ["Delivered", "Cancelled"] },
  }).populate("user", "name email profile_image") 
    .sort({ createdAt: -1 }); 

  return orders;
};


const getCurrentOrders = async (payload) => {
  const { userId } = payload;
  if (!userId) {
    throw new ApiError(401, "Unauthorized access! Please provide userId!");
  }

  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

 

  let currentOrders;
  if (user.customerType === "PREMIUM") {
    currentOrders = await Orders.find({
      user: userId,
      status: { $in: ["Pending", "Processing", "Shipping"] },
    }).populate("user", "name email Profile_image")  
      .sort({ createdAt: -1 });  
  // console.log("user.customerType", user.customerType)
  }else if(user.customerType === "REGULAR"){
    currentOrders = await Orders.find({
      user: userId,
      status: { $in: ["Pending", "Processing", "Shipping"] },
      // payment: "Completed",
    }).populate("user", "name email profile_image")  
     .sort({ createdAt: -1 });
  }else{
    throw new ApiError(403, "Access denied! You are not a premium or regular customer.");
  } 

  return currentOrders;
};



const OrdersService = {
  productAddToCart, 
  getUserCartData,
  updateAddress,
  getUserAddress,
  checkUserStatus,
  createOrder,
  getPastOrders,
  getCurrentOrders
}

module.exports = OrdersService;