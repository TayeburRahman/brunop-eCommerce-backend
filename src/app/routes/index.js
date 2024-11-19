const express = require("express");
const router = express.Router();
const AuthRoutes = require("../modules/auth/auth.routes");
const AdminRoutes = require("../modules/admin/admin.routes");
const UserRoutes = require("../modules/user/user.routes");
const PartnerRoutes = require("../modules/manager/manager.routes");
const DashboardRoutes = require("../modules/dashboard/dashboard.routes"); 
const PaymentRoutes = require("../modules/payment/payment.routes"); 

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
    path: "/dashboard",
    route: DashboardRoutes,
  },
  {
    path: "/partner",
    route: PartnerRoutes,
  },  
  {
    path: "/payment",
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
