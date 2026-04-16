const { Router } = require("express");
const { renderMainPage, runTests, getReport } = require("../controllers/test.controller");

const router = Router();

router.get("/", renderMainPage);
router.post("/run-tests", runTests);
router.get("/report", getReport);

module.exports = router;
