const crypto = require("crypto");
const createToken = (encryptionMethod) => {
  // Generate verification token using crypto
  let token = crypto.randomBytes(32).toString(encryptionMethod);
  return token;
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { createToken, hashToken };
