import sendEmail from "../utils/sendEmail.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email, otp) => {
  const subject = "Your OTP Code";
  const message = `Your OTP code is ${otp}. Please enter this code to verify your account.`;

  await sendEmail(email, subject, message);
};

const validateOtp = (storedOtp, otpExpires, enteredOtp) => {
  if (Date.now() > otpExpires) {
    return false;
  }
  return storedOtp === enteredOtp;
};

export default {
  generateOTP,
  sendOTP,
  validateOtp
};
