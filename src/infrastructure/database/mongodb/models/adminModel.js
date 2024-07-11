import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
  name: {
    type: String,
    required: [true, "Your username is required"],
  },
  role: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});
adminSchema.pre("save",async function(){
  this.password = await bcrypt.hash(this.password,12)
})
const AdminModel = mongoose.model("Admin", adminSchema);
export default AdminModel;
