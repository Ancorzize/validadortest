const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("../config");

function executeTests(selectedTests = []) {
  return new Promise((resolve, reject) => {
    console.log("========== executeTests ==========");
    console.log("Fecha:", new Date().toISOString());
    console.log("selectedTests recibidos:", selectedTests);

    const reportFile = "latest-report.html";
    const reportPath = path.join(config.reportsDir, reportFile);
    const customStylePath = path.join(__dirname, "../public/css/report.css");

    const newmanBin = path.join(process.cwd(), "node_modules", ".bin", "newman");

    console.log("process.cwd():", process.cwd());
    console.log("config.collectionPath:", config.collectionPath);
    console.log("config.reportsDir:", config.reportsDir);
    console.log("reportPath:", reportPath);
    console.log("customStylePath:", customStylePath);
    console.log("newmanBin:", newmanBin);

    try {
      if (!fs.existsSync(config.collectionPath)) {
        console.error("No existe collectionPath:", config.collectionPath);
        return reject(new Error(`No existe la colección: ${config.collectionPath}`));
      }

      if (!fs.existsSync(config.reportsDir)) {
        console.log("No existe reportsDir. Creando carpeta...");
        fs.mkdirSync(config.reportsDir, { recursive: true });
      }

      console.log("¿Existe colección?:", fs.existsSync(config.collectionPath));
      console.log("¿Existe reportsDir?:", fs.existsSync(config.reportsDir));
      console.log("¿Existe customStylePath?:", fs.existsSync(customStylePath));
      console.log("¿Existe newmanBin?:", fs.existsSync(newmanBin));

      const args = [
        "run",
        config.collectionPath,
        "-r",
        "htmlextra",
        "--reporter-htmlextra-export",
        reportPath,
        "--reporter-htmlextra-customStyle",
        customStylePath,
      ];

      selectedTests.forEach(test => {
        args.push("--folder", test);
      });

      console.log("Comando a ejecutar:");
      console.log(newmanBin + " " + args.join(" "));

      const child = spawn(newmanBin, args, { shell: false });

      child.stdout.on("data", d => {
        console.log("STDOUT:", d.toString());
      });

      child.stderr.on("data", d => {
        console.error("STDERR:", d.toString());
      });

      child.on("close", code => {
        console.log("========== child close ==========");
        console.log("Newman terminó con código:", code);

        if (code !== 0) {
          return resolve({
            success: false,
            code,
            reportFile: null,
            message: "La ejecución de Newman falló"
          });
        }

        const reportExists = fs.existsSync(reportPath);
        console.log("¿Existe reportPath después de ejecutar?:", reportExists);

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
        console.error("========== child error ==========");
        console.error(err);
        if (err && err.stack) {
          console.error(err.stack);
        }
        reject(err);
      });
    } catch (err) {
      console.error("ERROR general en executeTests:");
      console.error(err);
      if (err && err.stack) {
        console.error(err.stack);
      }
      reject(err);
    }
  });
}

module.exports = { executeTests };