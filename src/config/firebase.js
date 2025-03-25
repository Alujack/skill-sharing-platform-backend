const admin = require("firebase-admin");

const serviceAccount = require("./social-auth-ssp-firebase-adminsdk-ce4ca-66c2c31ce2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
