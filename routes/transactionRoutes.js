
const express = require("express");

const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All transaction endpoints require authentication
router.use(authMiddleware);

router.get("/", transactionController.getAll);
router.get("/:id", transactionController.getById);
router.post("/", transactionController.create);
router.patch("/:id", transactionController.update);
router.delete("/:id", transactionController.delete);

module.exports = router;
