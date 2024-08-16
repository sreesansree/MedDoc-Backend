// models/Admin.js
import mongoose from "mongoose";
// import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  profilePicture: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
  },
  name: {
    type: String,
    required: [true, "Your username is required"],
  },
  role: {
    type: String,
    enum: ["user", "doctor", "admin"],
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

// adminSchema.pre("save", async function () {
//   this.password = await bcrypt.hash(this.password, 12);
// });

const AdminModel = mongoose.model("Admin", adminSchema);
export default AdminModel;
