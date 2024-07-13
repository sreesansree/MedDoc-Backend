import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(errorHandler(401, "No token, authorization denied"));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      next(errorHandler(401, "Unauthorizes!!!"));
    }
    req.user = user;
    next();
  });
};

export const verifyAdminToken = (req, res, next) => {
  const token = req.cookies.admintoken;

  try {
    if (!token) {
      return next(errorHandler(401, "No token, authorization denied"));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
      if (err) {
        next(errorHandler(401, "Unauthorizes!!!"));
      }
      req.admin = admin;
      next();
    });
  } catch (error) {
    next(error);
  } 
};

