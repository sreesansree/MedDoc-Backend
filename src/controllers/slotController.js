import BookingSlot from "../models/BookingSlotModel.js";

// create a new booking slot
export const createBookingSlot = async (req, res) => {
  const { doctor, date, startTime, endTime } = req.body;

  try {
    // Check if the doctor already has five slots for the specified date
    const existingSlots = await BookingSlot.find({ doctor, date });
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

    const newSlot = await new BookingSlot({
      doctor,
      date,
      startTime,
      endTime,
    });

    await newSlot.save();
    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all booking slots for a doctor
export const getDoctorsSlots = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const slots = await BookingSlot.find({ doctor: doctorId });
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
