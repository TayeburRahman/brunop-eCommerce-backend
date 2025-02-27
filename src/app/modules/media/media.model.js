const mongoose = require('mongoose');

const addsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    adds_image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Adds = mongoose.model('Adds', addsSchema);

module.exports = { Adds };
