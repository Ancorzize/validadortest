const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("../config");

function executeTests(selectedTests = []) {
  return new Promise((resolve, reject) => {
    const reportFile = "latest-report.html";
    const reportPath = path.join(config.reportsDir, reportFile);

    const args = [
      "run",
      config.collectionPath,
      "-r", "htmlextra",
      "--reporter-htmlextra-export", reportPath,
      "--reporter-htmlextra-customStyle", path.join(__dirname, "../public/css/report.css"),
    ];

    selectedTests.forEach(test => {
      args.push("--folder", test);
    });

    console.log("Ejecutando newman:", "npx newman", args.join(" "));

    const child = spawn("npx", ["newman", ...args], { shell: true });

    child.stdout.on("data", d => console.log("STDOUT:", d.toString()));
    child.stderr.on("data", d => console.error("STDERR:", d.toString()));

    child.on("close", code => {
      console.log("Newman terminó con código:", code);

      if (!fs.existsSync(reportPath)) {
        return reject("No se generó el reporte");
      }

      resolve({
        success: code === 0,
        code,
        reportFile
      });
    });

    child.on("error", err => {
      reject(err);
    });
  });
}

module.exports = { executeTests };