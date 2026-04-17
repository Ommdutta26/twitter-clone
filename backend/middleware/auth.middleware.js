export const protectRoute = async (req, res, next) => {
  const auth = req.auth();

  if (!auth?.sessionId || !auth?.userId) {
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }

  // ✅ Attach user info to req.user so it can be accessed in controller
  req.user = {
    clerkId: auth.userId,
  };

  next();
};
