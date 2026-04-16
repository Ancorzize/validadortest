const path = require("path");
const fs = require("fs");

const reportsDir = path.join(__dirname, "..", "public", "reports");
const collectionPath = path.join(__dirname, "..", "postman", "ValidatorCasino.postman_collection.json");

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}
//node 18 o mas
module.exports = {
  PORT: process.env.PORT || 3000,
  reportsDir,
  collectionPath,
};
