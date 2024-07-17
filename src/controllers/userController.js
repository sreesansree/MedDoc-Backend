import userUseCase from "../usecase/userCase.js";


export const registerUser = async (req, res) => {
  try {
    const response = await userUseCase.registerUser(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const response = await userUseCase.verifyOTP(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await userUseCase.loginUser({ email, password });
    res.cookie("token", response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json(response.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const google = async (req, res, next) => {
  try {
    const { email, name, googlePhotoUrl } = req.body;
    const response = await userUseCase.google({ email, name, googlePhotoUrl });
    res.cookie("token", response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 60 * 1000, // 5 hours
    }).status(200).json(response);
  } catch (error) {
    console.error("Error in Google OAuth controller:", error);
    res.status(400).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token").status(200).json("User has been logout");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  // req.logout((err) => {
  //   if (err) {
  //     return res.status(500).json({ message: "Logout failed" });
  //   }
  //   res.clearCookie("token"); // Clear the session cookie
  //   res.status(200).json({ message: "Logged out successfully" });
  // });
};
