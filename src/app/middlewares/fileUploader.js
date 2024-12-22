const multer = require("multer");
const fs = require("fs");

const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = "";


      if (file.fieldname === "profile_image") {
        uploadPath = "uploads/images/profile";
      }
      else if (file.fieldname === "image") {
        uploadPath = "uploads/images";
      } else if (file.fieldname === "product_image") {
        uploadPath = "uploads/images/products";
      }  else if (file.fieldname === "adds_image") {
        uploadPath = "uploads/images/adds";
      } 
      else {
         
        uploadPath = "uploads";
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "video/mp4"
      ) {
        cb(null, uploadPath);
      } else {
        cb(new Error("Invalid file type"));
      }
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedFieldnames = [
      "profile_image",
      'product_image',
      "image",
      "adds_image"
    ];

    if (file.fieldname === undefined) {
      // Allow requests without any files
      cb(null, true);
    } else if (allowedFieldnames.includes(file.fieldname)) {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/webp"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"));
      }
    } else {
      cb(new Error("Invalid fieldname"));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: "profile_image", maxCount: 1 }, 
    { name: "product_image", maxCount: 10 },
    { name: "image", maxCount: 10 },
    { name: "adds_image", maxCount: 1 },

     
  ]);

  return upload;
};

module.exports = { uploadFile };
