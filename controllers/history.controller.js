const reportService = require("../services/report.service");

function getHistory(req, res) {
  const html = reportService.buildHistoryPage();
  res.send(html);
}

module.exports = { getHistory };
