import Activity from "../models/ActivityModel.js";

export const logActivity = async (type, description, name, userId) => {
  try {
    await Activity.create({
      type,
      description,
      name,
      userId,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
