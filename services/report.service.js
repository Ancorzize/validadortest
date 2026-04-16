const fs = require("fs");
const path = require("path");
const config = require("../config");

function getReportPath(file) {
  return path.join(config.reportsDir, file);
}

function exists(reportPath) {
  return fs.existsSync(reportPath);
}

function getReportFiles() {
  return fs.readdirSync(config.reportsDir).filter((f) => f.endsWith(".html"));
}

function buildHistoryPage() {
  const files = getReportFiles();

  if (!files.length) {
    return "<h2>No hay reportes generados todavía</h2>";
  }

  const sorted = files.sort((a, b) => {
    return fs.statSync(getReportPath(b)).mtime - fs.statSync(getReportPath(a)).mtime;
  });

  const links = sorted
    .map((f) => `<li><a href="/reports/${f}" target="_blank">${f}</a></li>`)
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Histórico de reportes</h1>
        <ul>${links}</ul>
      </body>
    </html>
  `;
}

module.exports = {
  getReportPath,
  exists,
  buildHistoryPage,
};
