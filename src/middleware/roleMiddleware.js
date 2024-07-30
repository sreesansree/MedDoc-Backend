export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "User role not authorized" });
    }
    next();
  };
};

// middleware/roleMiddleware.js
const isAdmin = (req, res, next) => {
  console.log(req.user, "req.userrr");
  console.log(req.user.role, "req.userrr.roleee");
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};

const isDoctor = (req, res, next) => {
  console.log(req.user.role,'roleeeeeeeeeeee')
  console.log(req.user,'req.userrrrrrrr')
  if (req.user && req.user.role === "doctor") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as a doctor");
  }
};

export { isAdmin, isDoctor };
