const { Router } = require("express");
const { getHistory } = require("../controllers/test.controller");

const router = Router();

router.get("/", getHistory);

module.exports = router;
