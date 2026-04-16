const path = require("path");
const fs = require("fs");
const config = require("../config");

const collectionUtil = require("../utils/collection.util");
const { executeTests } = require("../services/newman.service");
const reportService = require("../services/report.service");

async function renderMainPage(req, res) {
  console.log("========== GET / ==========");
  try {
    const testNames = collectionUtil.getTestNames();
    console.log("Tests encontrados para renderizar:", testNames);

    const html = await collectionUtil.renderMainView(testNames);
    res.send(html);
  } catch (err) {
    console.error("ERROR en renderMainPage:");
    console.error(err);
    console.error(err.stack);
    res.status(500).send("Error cargando la página principal");
  }
}

async function runTests(req, res) {
  console.log("========== POST /run-tests ==========");
  console.log("Fecha:", new Date().toISOString());
  console.log("Body recibido:", JSON.stringify(req.body, null, 2));

  let selectedTests = Array.isArray(req.body.tests) ? [...req.body.tests] : [];

  console.log("selectedTests inicial:", selectedTests);

  if (!selectedTests.includes("IniciarSesion")) {
    selectedTests.unshift("IniciarSesion");
  }

  console.log("selectedTests final:", selectedTests);

  try {
    const result = await executeTests(selectedTests);
    console.log("Resultado executeTests:", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (err) {
    console.error("ERROR en runTests:");
    console.error(err);
    if (err && err.stack) {
      console.error(err.stack);
    }

    res.status(500).json({
      success: false,
      error: "Error ejecutando pruebas",
      message: err.message || String(err),
      reportFile: null
    });
  }
}

function getReport(req, res) {
  console.log("========== GET /report ==========");
  const file = req.query.file;
  console.log("Archivo solicitado:", file);

  const reportPath = reportService.getReportPath(file);
  console.log("Ruta de reporte resuelta:", reportPath);

  const exists = reportService.exists(reportPath);
  console.log("¿Existe reporte?:", exists);

  if (!exists) {
    console.log("Reporte no encontrado");
    return res.status(404).send("Reporte no encontrado");
  }

  console.log("Enviando reporte:", reportPath);
  res.sendFile(reportPath);
}

function getHistory(req, res) {
  console.log("========== GET /history ==========");
  console.log("reportsDir:", config.reportsDir);

  let reports = [];

  if (fs.existsSync(config.reportsDir)) {
    reports = fs.readdirSync(config.reportsDir).filter(f => f.endsWith(".html"));

    reports.sort((a, b) => {
      const aT = fs.statSync(path.join(config.reportsDir, a)).mtime;
      const bT = fs.statSync(path.join(config.reportsDir, b)).mtime;
      return bT - aT;
    });
  }

  console.log("Reportes encontrados:", reports);

  const templatePath = path.join(__dirname, "../public/views/history.html");
  console.log("templatePath:", templatePath);

  if (!fs.existsSync(templatePath)) {
    console.log("No se encontró history.html");
    return res.send("ERROR: No se encontró history.html");
  }

  const html = fs.readFileSync(templatePath, "utf8");

  const links = reports.length
    ? reports
        .map(f => {
          return `
          <li>
            <a class="file-link" href="/reports/${f}" target="_blank">${f}</a>
          </li>`;
        })
        .join("")
    : `<p class="empty">No hay reportes generados todavía</p>`;

  const finalHtml = html.replace("{{links}}", links);

  return res.send(finalHtml);
}

module.exports = {
  renderMainPage,
  runTests,
  getReport,
  getHistory
};