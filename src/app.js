const express = require("express");
const cors = require("cors");
const globalErrorHandler = require("./app/middlewares/globalErrorHandler");
const routes = require("./app/routes");
const NotFoundHandler = require("./errors/NotFoundHandler");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const config = require("./config");

const app = express();
// CORS configuration
app.use(
  cors({
    origin: [
      "http://192.168.12.90:3002", 
      "http://10.0.60.45:3002",
      "http://143.110.241.146:4173"
    ],
    credentials: true,
  })
);

// Set views directory and view engine
app.set("views", path.join(__dirname, "./app/views"));
app.set("view engine", "ejs");


// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("uploads"));  

// All Routes
app.use("/", routes);


// app.get("/payment/success", async (req, res) => {
//   res.render("index");
// });

// Home route to render index.ejs
app.get("/", async (req, res) => {
  res.json("Welcome to E-Commerce App");
});

// Global Error Handler
app.use(globalErrorHandler);

// Handle not found
app.use(NotFoundHandler.handle);

// Export the app
module.exports = app;
