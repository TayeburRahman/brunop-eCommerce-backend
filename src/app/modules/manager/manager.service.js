const httpStatus = require("http-status"); 
const Auth = require("../auth/auth.model");
const Manager = require("./manager.model");
const QueryBuilder = require("../../../builder/queryBuilder");
const { Orders } = require("../orders/order.model");
const ApiError = require("../../../errors/ApiError");

 

const getOrderList = async (user) => {
  const userId = user.userId;
  const result = await Manager.findById(userId).populate("authId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const auth = await Auth.findById(result.authId);
  if (auth.is_block) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
  }

  return result;
};

const getOrderListManagers = async (req) => {
  const query = req.query;
  let statusFilter;
 
  if (query?.status === "Delivered") {
    statusFilter = { status: { $in: ["Delivered", "Cancelled"] } };
  } else { 
    statusFilter = { status: { $nin: ["Delivered", "Cancelled"] } };
  }
 
  const orderFilter = { ...statusFilter };
 
  const orderQuery = new QueryBuilder(
    Orders.find(orderFilter)
      .populate({
        path: "user",
        select: "name email customerType profile_image",
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


const orderDetails = async (req) => {
  const orderId = req.params.id;  
  const order = await Orders.findById(orderId)
  .populate('user')
  ;  
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }
  return order;
};

 

const ManagerService = { 
    getOrderList,
    getOrderListManagers,
    orderDetails
};

module.exports = { ManagerService };
