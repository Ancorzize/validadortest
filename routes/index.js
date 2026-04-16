const { Router } = require("express");
const testRoutes = require("./test.routes");
const historyRoutes = require("./history.routes");

const router = Router();

router.use("/", testRoutes);
router.use("/history", historyRoutes);

module.exports = router;
