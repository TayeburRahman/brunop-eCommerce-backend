const express = require("express");
const router = express.Router();
const AuthRoutes = require("../modules/auth/auth.routes");
const AdminRoutes = require("../modules/admin/admin.routes");
const UserRoutes = require("../modules/user/user.routes");
const ManagerRoutes = require("../modules/manager/manager.routes");
const DashboardRoutes = require("../modules/dashboard/dashboard.routes"); 
const PaymentRoutes = require("../modules/payment/payment.routes"); 
const ProductsRoutes = require("../modules/products/product.routes"); 
const OrdersRoutes = require("../modules/orders/order.routers"); 
const AddsRoutes = require("../modules/media/media.routes");
const NotificationRoutes = require("../modules/notification/notification.route");
 

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/products",
    route: ProductsRoutes,
  },
  {
    path: "/orders",
    route: OrdersRoutes,
  },
  {
    path: '/adds',
    route: AddsRoutes,
  },
  {
    path: "/notification",
    route: NotificationRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
  {
    path: "/manager",
    route: ManagerRoutes,
  },  
  {
    path: "/payment",
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
