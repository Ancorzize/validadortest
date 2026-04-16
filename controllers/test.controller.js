const path = require("path");
const fs = require("fs");
const config = require("../config");

const collectionUtil = require("../utils/collection.util");
const { executeTests } = require("../services/newman.service");
const reportService = require("../services/report.service");

async function renderMainPage(req, res) {
  const testNames = collectionUtil.getTestNames();
  const html = await collectionUtil.renderMainView(testNames);
  res.send(html);
}

async function runTests(req, res) {
  const selectedTests = req.body.tests || [];

  if (!selectedTests.includes("IniciarSesion")) {
    selectedTests.unshift("IniciarSesion");
  }

  try {
    const result = await executeTests(selectedTests);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error ejecutando pruebas" });
  }
}

function getReport(req, res) {
  const file = req.query.file;
  const reportPath = reportService.getReportPath(file);

  if (!reportService.exists(reportPath)) {
    return res.status(404).send("Reporte no encontrado");
  }
  res.sendFile(reportPath);
}

function getHistory(req, res) {

  let reports = [];

  if (fs.existsSync(config.reportsDir)) {
    reports = fs.readdirSync(config.reportsDir).filter(f => f.endsWith(".html"));

    reports.sort((a, b) => {
      const aT = fs.statSync(path.join(config.reportsDir, a)).mtime;
      const bT = fs.statSync(path.join(config.reportsDir, b)).mtime;
      return bT - aT;
    });
  }

  const templatePath = path.join(__dirname, "../public/views/history.html");

  if (!fs.existsSync(templatePath)) {

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
