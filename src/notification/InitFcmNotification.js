var admin = require("firebase-admin");
var serviceAccount = require("./town-jo-dd7aa-firebase-adminsdk-gys2n-34fc76746d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
