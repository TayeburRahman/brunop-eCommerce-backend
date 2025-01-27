const ApiError = require("../../../errors/ApiError");
const Products = require("../products/product.model");
const { Carts, Orders } = require("./order.model");
const User = require("../user/user.model");
const QueryBuilder = require("../../../builder/queryBuilder");
const { populate } = require("../auth/auth.model");
const { ENUM_NOTIFICATION_TYPE } = require("../../../utils/enums");
const { NotificationService } = require("../notification/notification.service");
const UsaAddressData = require("../dashboard/dashboard.address");
const { Transaction } = require("../payment/payment.model");
const httpStatus = require("http-status");

const productAddToCart = async (req) => {
  const { userId } = req.user;
  const { productId, quantity: qValue } = req.body;
  const quantity = Number(qValue);

  if (!productId || !quantity) {
    throw new ApiError(400, "Product ID and quantity are required.");
  }

  const product = await Products.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const productImage = Array.isArray(product.product_image)
    ? product.product_image[0]
    : product.product_image;

  let cart = await Carts.findOne({ user: userId });

  if (!cart) {
    cart = new Carts({
      user: userId,
      items: [
        {
          product: productId,
          quantity,
          price: product.price,
          product_image: productImage,
        },
      ],
      total_amount: product.price * quantity,
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      if (existingItem.quantity === 1 && quantity === -1) {
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
      } else {
        existingItem.quantity += quantity;

        if (existingItem.quantity < 1) {
          existingItem.quantity = 1;
        }

        // Update product_image if it is not already set
        if (!existingItem.product_image) {
          existingItem.product_image = productImage;
        }
      }
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        product_image: productImage,
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
    select: "name price product_image",
  });

  return cart;
};

const updateAddress = async (request) => {
  const { userId } = request.user;
  const { full_name, contact_no, street_address, city, state, instruction } = request.body;

  if (!full_name || !street_address || !city || !state) {
    throw new ApiError(400, "All fields are required.");
  }

  let data;
  try {
    data = await UsaAddressData.getAddressData({ street_address, city, state });
  } catch (error) {
    throw error;
  }

  if (!data.ZIPCode) {
    throw new ApiError(400, "Invalid address. Please provide a valid US address.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (!user.address) {
    user.address = {};
  }

  user.address.full_name = full_name;
  user.address.contact_no = contact_no;
  user.address.street_address = street_address;
  user.address.city = city;
  user.address.state = state;
  user.address.toZipCode = data.ZIPCode;
  user.address.instruction = instruction;

  await user.save();

  return user;
};

const getUserAddress = async (payload) => {
  const { userId } = payload;
  if (!userId) {
    throw new ApiError(401, "Unauthorized access! Please provide userId.");
  }


  const user = await User.findById(userId).select("name email address customerType");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

const getDeliveryFee = async (data) => {
  const { cart_id, userId } = data

  if (!cart_id || !userId) {
    throw new ApiError(400, "cart_id and userId are required.");
  }

  const userAddress = {
    originZIPCode: "22407",
    destinationZIPCode: "63118",
    weight: 20,
    length: 1,
    width: 1,
    height: 1,
  }
  const result = await UsaAddressData.getBaseRates(userAddress);
  return result
}

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
  const { cart_id, total_amount, items, type, transactionId, orderType: orderTypes, address } = req.body;
  let orderType = orderTypes;

  if (!total_amount || !orderType || !type) {
    throw new ApiError(400, "All required fields are missing.");
  }

  if (address) { 
    if (!address.full_name || !address.contact_no || !address.street_address || !address.city || !address.state) {
      throw new ApiError(400, "Address all field are required.");
    }
  }

  const userDB = await User.findById(userId);
 

  if (!userDB) {
    throw new ApiError(404, "User not found.");
  }

  if (userDB.customerType === "REGULAR") {
    orderType = 'regular'
    if (!transactionId || orderType !== "regular") {
      throw new ApiError(400, "Payments are required for regular customers.");
    }
  }


  let itemsOfProduct;
  if (type === "signal") {
    if (!items) {
      throw new ApiError(400, "Items are required for signal product.");
    }
    itemsOfProduct = items
  } else {
    if (!cart_id) {
      throw new ApiError(400, "Cart ID is required for product.");
    }
    const cart = await Carts.findById(cart_id);
    itemsOfProduct = cart.items;
  }
  try {
    const newOrder = new Orders({
      transactionId:{ 
        product_payment: transactionId
      },
      user: userDB._id,
      email: userDB.email,
      items: itemsOfProduct,
      total_amount,
      payment: transactionId ? "Product-Payment-Completed" : "Incomplete",
      address: address,
      shipping_info: address ? true : false,
      orderType
    });

    const savedOrder = await newOrder.save();

    if (cart_id) {
      await Carts.deleteOne({ _id: cart_id })
    }

    if (transactionId)
      await Transaction.create({
        orderId: [newOrder._id],
        userId: userId,
        amount: total_amount,
        paymentStatus: "Completed",
        transaction_id: transactionId,
        paymentType: "Products Cost"
      })

   const nnn = await NotificationService.sendNotification({
      userId,
      type: ENUM_NOTIFICATION_TYPE.ORDER_SUCCESS,
      getId: savedOrder._id,
      title: "Your Order Has Been Placed!",
      message: `Thank you for your purchase! Your order has been successfully created. Total Product Price: $${total_amount}.`,
    });

    if (!address) {
   const all=    await NotificationService.sendNotification({
        userId,
        type:ENUM_NOTIFICATION_TYPE.SHIPPING_INFO,
        getId: savedOrder._id,
        title: "Provide Shipping Information",
        message: "To proceed with your order, provide your shipping details. Once completed, we will charge the shipping fee accordingly.",
      }); 
    } 
    return savedOrder;
  } catch (error) {
    await NotificationService.sendNotification({
      userId,
      type: ENUM_NOTIFICATION_TYPE.ORDER_FAILED,
      title: "Ohh! Order Creation Failed",
      message: `We encountered an error while creating your order. Please contact support. ${transactionId && `with Transaction ID: ${transactionId}`}`,
    });
    throw new ApiError(400, `Error creating order: ${error.message}`);
  }
};

const shippingCostPaymentsSuccess = async (req) => {
  const { userId } = req.user;
  const { orderId, amount, transactionId } = req.body;

  if (!amount || !transactionId || !orderId) {
    throw new ApiError(400, "All required fields are missing.");
  }

  try {
    const userDB = await User.findById(userId);
    if (!userDB) {
      throw new ApiError(404, "User not found.");
    }

    const order = await Orders.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    order.transactionId = { ...order.transactionId, shipping_payment: transactionId };
    order.payment = "All-Payment-Completed";
    order.delivery_cost = "Completed";

    const savedOrder = await order.save();
 
    await Transaction.create({
      orderId: [order._id],
      userId: userId,
      amount: amount,
      paymentStatus: "Completed",
      transaction_id: transactionId,
      paymentType: "Shipping Cost",
    });
 
    await NotificationService.sendNotification({
      userId,
      type: ENUM_NOTIFICATION_TYPE.ORDER_SUCCESS,
      getId: order._id,
      title: "Shipping Payment Successful!",
      message: `Thank you for your purchase! Your shipping payment was successful. Shipping fee paid: $${amount}.`,
    });

    return savedOrder;
  } catch (error) { 
    await NotificationService.sendNotification({
      userId,
      type: ENUM_NOTIFICATION_TYPE.ORDER_FAILED,
      title: "Ohh! Payment Failed",
      message: `Payment Save failed. Please contact support. ${transactionId ? `Transaction ID: ${transactionId}` : ""}`,
    });

    throw new ApiError(400, `Error processing payment: ${error.message}`);
  }
};


const addShippingInfo = async (payload) => {
  const { orderId, full_name, contact_no, street_address, city, state, toZipCode } = payload;

  const requiredFields = { orderId, full_name, contact_no, street_address, city, state, toZipCode };
  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `The following fields are required: ${missingFields.join(', ')}`
    );
  }

  const order = await Orders.findByIdAndUpdate(
    orderId,
    {
      $set: {
        address: {
          full_name,
          contact_no,
          street_address,
          city,
          state,
          toZipCode,
        },
        shipping_info: true,
      },
    },
    { new: true, runValidators: true }
  );
  return {
    order
  };
};

const getPastOrders = async (req) => {
  const { userId } = req.user;
  const query = req.query;

  if (!userId) {
    throw new ApiError(401, "Unauthorized access! Please provide userId!");
  }

  const orderQuery = new QueryBuilder(Orders.find({
    user: userId,
    status: { $in: ["Delivered", "Cancelled"] },
  }).populate("user", "name email profile_image")
    ,
    query
  )
    .sort({ createdAt: -1 })
    .search()
    .filter()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { result, meta };
};

const getCurrentOrders = async (req) => {
  const { userId } = req.user;
  const query = req.query;

  if (!userId) {
    throw new ApiError(401, "Unauthorized access! Please provide userId!");
  }

  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  let orderQuery;
  if (user.customerType === "PREMIUM") {
    orderQuery = new QueryBuilder(Orders.find({
      user: userId,
      status: { $in: ["Pending", "Processing", "Shipping"] },
    }).populate("user", "name email Profile_image"), query)
      .search()
      .filter()
      .paginate()
      .fields()
      .sort({ createdAt: -1 });
  } else if (user.customerType === "REGULAR") {
    orderQuery = new QueryBuilder(Orders.find({
      user: userId,
      status: { $in: ["Pending", "Processing", "Shipping"] },
    }).populate("user", "name email profile_image"), query)
      .search()
      .filter()
      .paginate()
      .fields()
      .sort({ createdAt: -1 });
  } else {
    throw new ApiError(403, "Access denied! You are not a premium or regular customer.");
  }

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { result, meta };;
};

// Premium=====================
const getPremiumOderDeu = async (req) => {
  const { userId, year, month, ...query } = req.query;

  console.log("getPremiumOderDeu Input:", { year, month, query });

  if (!year || isNaN(year)) {
    throw new ApiError(400, `Year is required and must be a valid number. Received: ${year}`);
  }

  if (month && (isNaN(month) || month < 1 || month > 12)) {
    throw new ApiError(400, `Month must be a valid number between 1 and 12. Received: ${month}`);
  }

  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  if (user.customerType !== "PREMIUM") {
    throw new ApiError(403, "Access denied! User is not a premium customer.");
  }

  const startDate = new Date(year, month ? month - 1 : 0, 1);
  const endDate = new Date(month ? new Date(year, month, 0) : new Date(year, 11, 31));

  const orderQuery = new QueryBuilder(
    Orders.find({
      user: userId,
      payment: { $in: ["Incomplete"] }, 
      status: { $in: ["Delivered"] },
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("user", "name email profile_image"),
    query
  )
    .search()
    .filter()
    .paginate()
    .fields()
    .sort({ createdAt: -1 });

  // Execute query
  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  const dataDb = await Orders.find({
    user: userId,
    payment: { $in: ["Incomplete"] }, 
    status: { $in: ["Delivered"] },
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .populate("user", "name email profile_image")

  const totalAmountDue = dataDb.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  return { result, meta,totalAmountDue};
};

const payMonthlyPremiumUser = async (req) => {
  const { userId } = req.user;
  const { order_id, transactionId, total_amount } = req.body;

  if (!order_id?.length || !transactionId || !total_amount) {
    throw new ApiError(400, "All required fields are missing.");
  }

  const userDB = await User.findById(userId);

  if (!userDB) {
    throw new ApiError(404, "User not found.");
  }

  const orderIds = Array.isArray(order_id) ? order_id : [order_id];

  const orders = await Orders.find({ _id: { $in: orderIds } });

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "Orders not found.");
  }

  const updatedOrders = [];
  for (const order of orders) {
    if (!order?.items?.length) {
      throw new ApiError(
        400,
        `Cart is empty for order ID: ${order._id}. Please contact customer support. Transaction ID: ${transactionId}`
      );
    }
    order.transactionId = {  
    product_payment: transactionId,
    shipping_payment: order.deliveryFee !== null? transactionId: ''
  } 
    order.payment = order.deliveryFee !== null? "All-Payment-Completed": "Product-Payment-Completed";
    await order.save();
    updatedOrders.push(order);
  }

  await Transaction.create({
    orderId: order_id,
    userId: userId,
    amount: total_amount,
    paymentStatus: "Completed",
    transaction_id: transactionId,
    paymentType: "Premium Payment"
  })

  return {
    message: "Transaction successful. Orders updated.",
    updatedOrders,
  };
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
  const { status, orderId } = req.body;

  console.log("====", status, orderId);

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

const getOrderDetails = async (orderId) => {
  const order = await Orders.findById(orderId)
   .populate("user", "name email profile_image") 

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return order;
}
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
  getPremiumOderDeu,
  getDeliveryFee,
  payMonthlyPremiumUser,
  checkUserStatus,
  addShippingInfo,
  getOrderDetails,
  shippingCostPaymentsSuccess

}

module.exports = OrdersService;