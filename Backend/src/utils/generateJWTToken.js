import jwt from "jsonwebtoken";

const generateJWTToken = (user) => {
  const payload = {
    _id: user._id,
    id: user._id,
    username: user.username,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || "skillswap_super_secret_jwt_key_2026_secure";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

const generateJWTToken_username = (user) => {
  return generateJWTToken(user);
};

export { generateJWTToken, generateJWTToken_username };