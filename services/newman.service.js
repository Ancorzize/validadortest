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

    console.log("process.cwd():", process.cwd());
    console.log("config.collectionPath:", config.collectionPath);
    console.log("config.reportsDir:", config.reportsDir);
    console.log("reportPath:", reportPath);
    console.log("customStylePath:", customStylePath);

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

      if (fs.existsSync(reportPath)) {
        const stats = fs.statSync(reportPath);
        console.log("Ya existía latest-report.html antes de ejecutar.");
        console.log("Última modificación previa:", stats.mtime.toISOString());
        console.log("Tamaño previo:", stats.size, "bytes");
      } else {
        console.log("No existía latest-report.html antes de ejecutar.");
      }

      const args = [
        "newman",
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
      console.log("npx " + args.join(" "));

      const child = spawn("npx", args, { shell: true });

      child.stdout.on("data", d => {
        console.log("STDOUT:", d.toString());
      });

      child.stderr.on("data", d => {
        console.error("STDERR:", d.toString());
      });

      child.on("close", code => {
        console.log("========== child close ==========");
        console.log("Newman terminó con código:", code);

        const reportExists = fs.existsSync(reportPath);
        console.log("¿Existe reportPath después de ejecutar?:", reportExists);

        if (reportExists) {
          const stats = fs.statSync(reportPath);
          console.log("Última modificación posterior:", stats.mtime.toISOString());
          console.log("Tamaño posterior:", stats.size, "bytes");
        }

        if (!reportExists) {
          return reject(new Error("No se generó el reporte"));
        }

        resolve({
          success: code === 0,
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