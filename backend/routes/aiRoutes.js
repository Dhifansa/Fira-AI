const express = require("express");
const jwt = require("jsonwebtoken");
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Optional auth middleware: attaches req.user if a valid Bearer token is provided,
// otherwise continues as guest so AI pages work seamlessly before & after login.
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { user_id: decoded.user_id };
    }
  } catch {
    // Proceed without req.user if token is missing or expired on read/simulation endpoints
  }
  next();
};

// 1. AI Smart Auditor
router.get("/smart-auditor", optionalAuthMiddleware, aiController.getSmartAuditor);
router.post("/smart-auditor/sync-budgets", authMiddleware, aiController.syncAuditorToBudgets);
router.post("/smart-auditor/apply-cap", authMiddleware, aiController.applyAnomalyCap);
router.post("/smart-auditor/subscriptions", authMiddleware, aiController.createSubscription);
router.delete("/smart-auditor/subscriptions/:id", authMiddleware, aiController.deleteSubscription);

// 2. AI Financial Twin
router.get("/financial-twin", optionalAuthMiddleware, aiController.getFinancialTwin);
router.post("/financial-twin/chat", optionalAuthMiddleware, aiController.chatFinancialTwin);

// 3. What-If Simulator
router.post("/what-if-simulator", optionalAuthMiddleware, aiController.runWhatIfSimulation);
router.post("/what-if-simulator/save-scenario", authMiddleware, aiController.saveWhatIfScenario);

// 4. Financial Weather
router.get("/financial-weather", optionalAuthMiddleware, aiController.getFinancialWeather);
router.post("/financial-weather/stress-test", optionalAuthMiddleware, aiController.runWeatherStressTest);

module.exports = router;

