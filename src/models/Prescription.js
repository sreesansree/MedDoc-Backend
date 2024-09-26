import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookingSlot",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // prescriptionText: {
  //   type: String,
  //   required: true,
  // }, // Main prescription text
  medicines: [
    {
      name: {
        type: String,
        required: true,
      },
      dosage: {
        type: String,
        required: true,
      },
      instructions: {
        type: String,
        required: true,
      },
    },
  ],
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
