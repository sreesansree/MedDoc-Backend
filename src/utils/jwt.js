import jwt from "jsonwebtoken";

export const generateToken = (user, role) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: role, // Add role to the payload
  };
  const secret = process.env.JWT_SECRET;
  const options = {
    expiresIn: "5h",
  };

  return jwt.sign(payload, secret, options);
};

export const generateAdminToken = (res, adminId) => {
  const token = jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });
  return token
};
