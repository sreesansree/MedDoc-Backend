import mongoose from "mongoose";
import BookingSlot from "../models/BookingSlotModel.js";
import Doctor from "../models/DoctorModel.js";
// create a new booking slot

export const createBookingSlot = async (req, res) => {
  const { doctorEmailOrName, date, startTime, endTime, price } = req.body;

  try {
    // Find doctor by email or name
    const doctor = await Doctor.findOne({
      $or: [{ email: doctorEmailOrName }, { name: doctorEmailOrName }],
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if the doctor already has five slots for the specified date
    const existingSlots = await BookingSlot.find({ doctor: doctor._id, date });
    if (existingSlots.length >= 5) {
      return res
        .status(400)
        .json({ message: "Doctor already has five slots for this date" });
    }

    // Check if there is any overlap with existing slots
    const overlappingSlot = existingSlots.find(
      (slot) => startTime < slot.endTime && endTime > slot.startTime
    );
    if (overlappingSlot) {
      return res
        .status(400)
        .json({ message: "There is a time overlap with an existing slot" });
    }

    // Create the new slot
    const newSlot = new BookingSlot({
      doctor: doctor._id,
      date,
      startTime,
      endTime,
      price
    });

    await newSlot.save();
    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all booking slots for a doctor
export const getDoctorsSlots = async (req, res) => {
  const { id } = req.params;
  console.log(req.params);

  console.log("Received doctor ID:", id);

  try {
    // Ensure doctorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }
    const slots = await BookingSlot.find({ doctor: id });
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a slot

export const bookSlot = async (req, res) => {
  const { slotId } = req.params;
  try {
    const slot = await BookingSlot.findById(slotId);
    // console.log(slot, "found slot");
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    if (slot.isBooked) {
      return res.status(400).json({ message: "Slot is already booked" });
    }
    slot.isBooked = true;
    await slot.save();
    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
