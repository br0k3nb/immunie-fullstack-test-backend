import mongoose from "mongoose";

export default new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  validUntil: {
    type: String,
    required: true,
  },
  profileImageName: {
    type: String,
    required: true,
  },
});
