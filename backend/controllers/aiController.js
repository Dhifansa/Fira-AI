const aiService = require("../services/aiService");

const aiController = {
  // GET /api/ai/smart-auditor
  async getSmartAuditor(req, res) {
    try {
      const userId = req.user?.user_id || null;
      const data = await aiService.getSmartAuditor(userId);
      return res.status(200).json({
        success: true,
        message: "AI Smart Auditor report generated successfully.",
        data,
      });
    } catch (error) {
      console.error("Smart Auditor error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to generate Smart Auditor report.",
      });
    }
  },

  // POST /api/ai/smart-auditor/sync-budgets
  async syncAuditorToBudgets(req, res) {
    try {
      const userId = req.user?.user_id;
      const data = await aiService.syncAuditorToBudgets(userId);
      return res.status(200).json({
        success: true,
        message: data.message,
        data,
      });
    } catch (error) {
      console.error("Sync Auditor to Budgets error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to sync audit rules to AI Budgeting.",
      });
    }
  },

  // POST /api/ai/smart-auditor/apply-cap
  async applyAnomalyCap(req, res) {
    try {
      const userId = req.user?.user_id;
      const data = await aiService.applyAnomalyCap(userId, req.body || {});
      return res.status(200).json({
        success: true,
        message: data.message,
        data,
      });
    } catch (error) {
      console.error("Apply Anomaly Cap error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to apply spending cap.",
      });
    }
  },

  // POST /api/ai/smart-auditor/subscriptions
  async createSubscription(req, res) {
    try {
      const userId = req.user?.user_id;
      const data = await aiService.createSubscription(userId, req.body || {});
      return res.status(201).json({
        success: true,
        message: data.message,
        data,
      });
    } catch (error) {
      console.error("Create Subscription error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Gagal menambahkan langganan.",
      });
    }
  },

  // DELETE /api/ai/smart-auditor/subscriptions/:id
  async deleteSubscription(req, res) {
    try {
      const userId = req.user?.user_id;
      const data = await aiService.deleteSubscription(userId, req.params.id);
      return res.status(200).json({
        success: true,
        message: data.message,
        data,
      });
    } catch (error) {
      console.error("Delete Subscription error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Gagal menghapus langganan.",
      });
    }
  },

  // GET /api/ai/financial-twin
  async getFinancialTwin(req, res) {
    try {
      const userId = req.user?.user_id || null;
      const riskOverride = req.query.risk || null;
      const data = await aiService.getFinancialTwinProfile(userId, riskOverride);
      return res.status(200).json({
        success: true,
        message: "AI Financial Twin profile retrieved successfully.",
        data,
      });
    } catch (error) {
      console.error("Financial Twin profile error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to retrieve Financial Twin profile.",
      });
    }
  },

  // POST /api/ai/financial-twin/chat
  async chatFinancialTwin(req, res) {
    try {
      const userId = req.user?.user_id || null;
      const { message, history } = req.body || {};
      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Pesan pertanyaan wajib diisi.",
        });
      }

      const data = await aiService.chatWithFinancialTwin(userId, message, history);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Financial Twin chat error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to process chat with Financial Twin.",
      });
    }
  },

  // POST /api/ai/what-if-simulator
  async runWhatIfSimulation(req, res) {
    try {
      const userId = req.user?.user_id || null;
      const data = await aiService.runWhatIfSimulation(userId, req.body || {});
      return res.status(200).json({
        success: true,
        message: "What-If simulation calculated successfully.",
        data,
      });
    } catch (error) {
      console.error("What-If Simulator error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to calculate What-If simulation.",
      });
    }
  },

  // POST /api/ai/what-if-simulator/save-scenario
  async saveWhatIfScenario(req, res) {
    try {
      const userId = req.user?.user_id;
      const data = await aiService.saveWhatIfScenarioAsGoal(userId, req.body || {});
      return res.status(201).json({
        success: true,
        message: data.message,
        data,
      });
    } catch (error) {
      console.error("Save What-If Scenario error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to save scenario to Financial Goals.",
      });
    }
  },

  // GET /api/ai/financial-weather
  async getFinancialWeather(req, res) {
    try {
      const userId = req.user?.user_id || null;
      const data = await aiService.getFinancialWeather(userId);
      return res.status(200).json({
        success: true,
        message: "Financial Weather report generated successfully.",
        data,
      });
    } catch (error) {
      console.error("Financial Weather error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to generate Financial Weather diagnosis.",
      });
    }
  },

  // POST /api/ai/financial-weather/stress-test
  async runWeatherStressTest(req, res) {
    try {
      const userId = req.user?.user_id || null;
      const data = await aiService.runWeatherStressTest(userId, req.body || {});
      return res.status(200).json({
        success: true,
        message: "Financial Weather stress test completed.",
        data,
      });
    } catch (error) {
      console.error("Financial Weather stress test error:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to run Financial Weather stress test.",
      });
    }
  },
};

module.exports = aiController;

