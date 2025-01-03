import sendEmail from "../utils/sendEmail.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email, otp) => {
  const subject = "MedDoc Verification";
  const message = `Your OTP code is ${otp}. It will expire in 10 minutes. Please enter this code to verify your account.`;

  await sendEmail(email, subject, message);
};

const validateOtp = (storedOtp, otpExpires, enteredOtp) => {
  if (Date.now() > otpExpires) {
    return false;
  }
  // console.log(storedOtp,'storedOTP')
  // console.log(enteredOtp,'EnteredOTP')
  // return storedOtp === enteredOtp;

  // Normalize both OTPs to strings for comparison
  const isValid = String(storedOtp) === String(enteredOtp);
  return isValid;
};

export default {
  generateOTP,
  sendOTP,
  validateOtp,
};
