import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      dafult:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    gender: {
      type: String,
    },
    age: {
      type: Number,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    bloodgroup: {
      type: String,
    },
    token: {
      type: String,
      default: "",
    },
    is_blocked: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true }
);
const User = mongoose.model("user", userSchema);
export default User;
