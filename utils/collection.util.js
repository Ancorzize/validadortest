const fs = require("fs");
const config = require("../config");
const path = require("path");

function getTestNames() {
  const raw = JSON.parse(fs.readFileSync(config.collectionPath));
  return raw.item.map((i) => i.name);
}


async function renderMainView(testNames) {
  
  testNames = testNames.filter(f => f !== 'Casos de uso');
  testNames = testNames.filter(f => f !== 'IniciarSesion');

  const html = fs.readFileSync(path.join(__dirname, "../public/views/index.html"), "utf8");
  return html.replace("{{tests}}", testNames.map(n => `
    <label>
      <input type="checkbox" name="tests" value="${n}"> ${n}
    </label>
  `).join(""));
}

module.exports = {
  getTestNames,
  renderMainView,
};
