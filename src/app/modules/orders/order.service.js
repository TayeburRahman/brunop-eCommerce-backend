const ApiError = require("../../../errors/ApiError");
const Products = require("../products/product.model");
const { Carts, Orders } = require("./order.model");
const User = require("../user/user.model");
const QueryBuilder = require("../../../builder/queryBuilder");
const { populate } = require("../auth/auth.model");

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
  const { userId } = req.user;
  const { items, total_amount, address, deliveryFee, paymentDetails, orderType} = req.body;
  if ( !items || !total_amount || !address || !deliveryFee || !orderType) {
    throw new ApiError(400, "All required fields are missing.");
  }

  const userDB = await User.findById(userId)

  if (!userDB) {
    throw new ApiError(404, "User not found.");
  }

  if(userDB.customerType === "REGULAR"){
    if(!paymentDetails.transactionId || paymentDetails.paymentMethod){
      throw new ApiError(400, "Payment details are required for REGULAR customers.");
    }
  }

  try {
    const newOrder = new Orders({
      user: userDB._id,
      email: userDB.email,
      items,
      total_amount: total_amount,
      deliveryFee,
      address,
      orderType
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
  } else if (user.customerType === "REGULAR") {
    currentOrders = await Orders.find({
      user: userId,
      status: { $in: ["Pending", "Processing", "Shipping"] },
      // payment: "Completed",
    }).populate("user", "name email profile_image")
      .sort({ createdAt: -1 });
  } else {
    throw new ApiError(403, "Access denied! You are not a premium or regular customer.");
  }

  return currentOrders;
};
// Premium=====================
const getPremiumOderDeu = async (req) => {
  const { year, month } = req.query;
  const userId = req.query.userId;
 
  if (!year || isNaN(year)) {
    throw new ApiError(400, "Year is required and must be a valid number.");
  }
  if (month && (isNaN(month) || month < 1 || month > 12)) {
    throw new ApiError(400, "Month must be a valid number between 1 and 12.");
  }

  const user = await User.findOne({ _id: userId });

  console.log(user);

  if (user?.customerType !== "PREMIUM") {
    throw new ApiError(403, "Access denied! User is not a premium customer.");
  }
 
  const startDate = new Date(year, month ? month - 1 : 0, 1); 
  const endDate = new Date(
    month ? new Date(year, month, 0) : new Date(year, 11, 31)  
  );

  const orders = await Orders.find({
    user: userId,
    payment: { $in: ["Pending"] },
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .populate("user", "name email profile_image")
    .sort({ createdAt: -1 });

  return orders;
};

// Admin======================================
const getAllOrders = async (req) => {
  const query = req.query;

  const orderQuery = new QueryBuilder(
    Orders.find()
      .populate({
        path: "user",
      }),
    query
  )
    .search(["email", "status"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { result, meta };
};

const updateStatus = async (req) => {
  const { status, orderId } = req.query;

  if (!status || !orderId) {
    throw new ApiError(400, "Status and Order ID are required.");
  }

  const validStatuses = ["Pending", "Processing", "Shipping", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`);
  }

  const order = await Orders.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }
  order.status = status;
  await order.save();

  return {
    message: `Order ${status} updated successfully`,
    data: order,
  };

};




const OrdersService = {
  productAddToCart,
  getUserCartData,
  updateAddress,
  getUserAddress,
  checkUserStatus,
  createOrder,
  getPastOrders,
  getCurrentOrders,
  getAllOrders,
  updateStatus,
  getPremiumOderDeu
}

module.exports = OrdersService;