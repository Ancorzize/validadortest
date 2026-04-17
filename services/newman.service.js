const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("../config");

function executeTests(selectedTests = []) {
  return new Promise((resolve, reject) => {

    const reportFile = "latest-report.html";
    const reportPath = path.join(config.reportsDir, reportFile);
    const customStylePath = path.join(__dirname, "../public/css/report.css");
    const nodeBin = process.execPath;
    const newmanCli = require.resolve("newman/bin/newman.js");

    try {
      if (!fs.existsSync(config.collectionPath)) {
        console.error("No existe collectionPath:", config.collectionPath);
        return reject(new Error(`No existe la colección: ${config.collectionPath}`));
      }

      if (!fs.existsSync(config.reportsDir)) {
        fs.mkdirSync(config.reportsDir, { recursive: true });
      }

      const args = [
        newmanCli,
        "run",
        config.collectionPath,
        "-r",
        "htmlextra",
        "--reporter-htmlextra-export",
        reportPath,
        "--reporter-htmlextra-customStyle",
        customStylePath,
        "--reporter-htmlextra-theme",
        "default"
      ];

      selectedTests.forEach(test => {
        args.push("--folder", test);
      });

      const child = spawn(nodeBin, args, { shell: false });

      child.stderr.on("data", d => {
        console.error("STDERR:", d.toString());
      });

      child.on("close", code => {
        const reportExists = fs.existsSync(reportPath);
        if (!reportExists) {
          return reject(new Error("Newman terminó pero no generó el reporte"));
        }

        resolve({
          success: true,
          code,
          reportFile
        });
      });

      child.on("error", err => {
        if (err && err.stack) {
          console.error(err.stack);
        }
        reject(err);
      });
    } catch (err) {
      if (err && err.stack) {
        console.error(err.stack);
      }
      reject(err);
    }
  });
}

module.exports = { executeTests };