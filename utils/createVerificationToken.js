const { createToken } = require("./token");
const sendEmail = require("./email");
const { encryptString } = require("./encryption");

// Function that creates an email verification token and sends it to the user's email.
// FUnction params: the request object, and the user object
// returns the hashed verification token

const createVerificationTokenAndSendToEmail = async (req, user) => {
  // Create a verification URL and send to the user's email for verification
  const verification_token = createToken("hex");
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify/${user.email}/${verification_token}`;

  const message = `Please click on the link below to verify your email address: \n\n ${verificationUrl}`;
  const title = "Please verify your email address";
  const name = `${user?.firstname}  ${user?.lastname}`;
  const document_title = "Unipatron";
  const context = { message, title, name, document_title };
  console.log(context);

  await sendEmail({
    email: user.email,
    subject: "Email Verification",
    // message: `Please click on the link below to verify your email address: \n\n ${verificationUrl}`,
    context,
  });

  // Hash the verification token and save to the user data in the database
  const hashedVerificationToken = encryptString(verification_token, 10);
  return hashedVerificationToken;
};

module.exports = createVerificationTokenAndSendToEmail;
