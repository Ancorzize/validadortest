const express = require("express");
const routes = require("./routes");
const config = require("./config");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/reports", express.static(config.reportsDir));

app.use("/", routes);

app.listen(config.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${config.PORT}`);
});
