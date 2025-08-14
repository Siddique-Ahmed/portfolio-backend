import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(404).json({
        message: "token not found!",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.TOKEN_SECRET);

    if (!decode) {
      return res.status(401).json({
        message: "user not authenticated",
        success: false,
      });
    }

    req.userId = decode.userId;

    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
