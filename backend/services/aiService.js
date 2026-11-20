const pool = require("../config/database");
const categoryService = require("./categoryService");
const transactionRepository = require("../repositories/transactionRepository");
const budgetRepository = require("../repositories/budgetRepository");
const userRepository = require("../repositories/userRepository");

function formatRupiahServer(amount) {
  const num = Math.round(Number(amount) || 0);
  const abs = Math.abs(num);
  const formatted = new Intl.NumberFormat("id-ID").format(abs);
  return num < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

function getCurrentMonthBounds() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
    monthLabel: now.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
  };
}

function getFormattedTimestamp() {
  const now = new Date();
  const datePart = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart}, ${timePart} WIB`;
}

let subscriptionsTableReady = false;
async function ensureSubscriptionsTable() {
  if (subscriptionsTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      name VARCHAR(120) NOT NULL,
      icon VARCHAR(30) NOT NULL DEFAULT 'tv',
      monthly_cost NUMERIC(18,2) NOT NULL,
      utilization_pct INTEGER NOT NULL DEFAULT 20,
      utilization_label VARCHAR(80) NOT NULL DEFAULT 'Tingkat Penggunaan',
      utilization_value VARCHAR(80) NOT NULL DEFAULT 'Jarang Digunakan',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
  subscriptionsTableReady = true;
}

function evaluateSubscriptionAuditItem(row) {
  const cost = Math.round(Number(row.monthly_cost) || 0);
  const pct = Math.max(0, Math.min(100, Number(row.utilization_pct) ?? 20));
  const isCritical = pct <= 15;

  let advice = "";
  let potentialSaving = 0;
  let actionLabel = "Evaluasi Paket";

  if (pct <= 15) {
    advice =
      "Utilisasi sangat rendah / pasif. Disarankan segera membekukan atau menghentikan langganan agar tidak membebani arus kas bulanan.";
    potentialSaving = cost;
    actionLabel = pct === 0 ? "Jeda / Bekukan" : "Hentikan Langganan";
  } else if (pct <= 45) {
    advice =
      "Penggunaan di bawah kapasitas optimal. Pertimbangkan downgrade ke paket dasar atau berbagi paket keluarga (Family Plan).";
    potentialSaving = Math.round(cost * 0.55);
    actionLabel = "Downgrade Paket";
  } else {
    advice =
      "Langganan aktif digunakan secara rutin. Anda dapat menghemat ~15% jika beralih dari tagihan bulanan ke paket tahunan.";
    potentialSaving = Math.round(cost * 0.15);
    actionLabel = "Optimasi Tahunan";
  }

  return {
    id: row.subscription_id || `sub-${row.name}`,
    icon: row.icon || "tv",
    name: row.name,
    monthlyCost: cost,
    utilizationPct: pct,
    utilizationLabel: row.utilization_label || "Tingkat Utilisasi",
    utilizationValue: row.utilization_value || `${pct}% Terpakai`,
    advice,
    potentialSaving,
    actionLabel,
    isCritical,
    isCustom: Boolean(row.subscription_id),
  };
}

async function callGeminiOptional(systemContext, userMessage, history = []) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return null;
  }

  const preferredModel = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
  const modelsToTry = Array.from(
    new Set([preferredModel, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"])
  );

  const recentHistory = Array.isArray(history) ? history.slice(-8) : [];
  const contents = [];

  for (const msg of recentHistory) {
    if (!msg || !msg.text) continue;
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: String(msg.text) }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: String(userMessage) }],
  });

  const systemInstruction = {
    parts: [
      {
        text: `${systemContext}\n\nInstruksi Peran:\n- Anda adalah "FIRA Twin Assistant", asisten & kembaran finansial pribadi pengguna di aplikasi FIRA.\n- Jawab selalu dalam Bahasa Indonesia yang ramah, cerdas, interaktif, dan mudah dipahami.\n- Gunakan data keuangan nyata pengguna dari PostgreSQL di atas sebagai referensi utama setiap kali relevan.\n- Berikan saran yang konkret, solutif, dan ringkas (sekitar 2-4 kalimat atau poin singkat agar nyaman dibaca di ruang chat).`,
      },
    ],
  };

  for (const modelName of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: systemInstruction,
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );
      clearTimeout(timeout);

      if (!response.ok) continue;
      const json = await response.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return text.trim();
      }
    } catch {
      // Try next fallback model
    }
  }

  return null;
}

async function loadUserFinancialContext(userId) {
  if (!userId) {
    return {
      user: { name: "Pengguna", email: "" },
      categories: [],
      transactions: [],
      budgets: [],
      goals: [],
      hasRealData: false,
      rawIncome: 0,
      rawExpense: 0,
      totalIncome: 0,
      totalExpense: 0,
      netCashflow: 0,
      liquidSavings: 0,
      emergencyMonths: 0,
      savingsRate: 0,
      healthScore: 0,
      categoryBreakdown: [],
    };
  }

  const [user, categories, transactions, budgets, goalsRes] = await Promise.all([
    userRepository.findById(userId),
    categoryService.getAll(userId),
    transactionRepository.findAll(userId),
    budgetRepository.findAllByUser(userId),
    pool.query(
      `SELECT financial_goal_id, user_id, name, target_amount, start_date, end_date, status, created_at
       FROM financial_goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    ),
  ]);

  const goals = goalsRes.rows || [];
  const hasRealData = transactions.length > 0;

  if (!hasRealData) {
    return {
      user: user || { name: "Pengguna", email: "" },
      categories,
      transactions: [],
      budgets,
      goals,
      hasRealData: false,
      rawIncome: 0,
      rawExpense: 0,
      totalIncome: 0,
      totalExpense: 0,
      netCashflow: 0,
      liquidSavings: 0,
      emergencyMonths: 0,
      savingsRate: 0,
      healthScore: 0,
      categoryBreakdown: [],
    };
  }

  let rawIncome = 0;
  let rawExpense = 0;
  const byCatMap = new Map();

  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    if (tx.type === "income") {
      rawIncome += amt;
    } else {
      rawExpense += amt;
      const prev = byCatMap.get(tx.category_id) || {
        category_id: tx.category_id,
        name: tx.category_name,
        amount: 0,
        count: 0,
      };
      prev.amount += amt;
      prev.count += 1;
      byCatMap.set(tx.category_id, prev);
    }
  }

  const totalIncome = rawIncome;
  const totalExpense = rawExpense;
  const netCashflow = totalIncome - totalExpense;
  const liquidSavings = Math.max(0, netCashflow);

  const emergencyMonths =
    totalExpense > 0
      ? Number(Math.min(24, Math.max(0, liquidSavings / totalExpense)).toFixed(1))
      : liquidSavings > 0
      ? 1.0
      : 0;

  const savingsRate =
    totalIncome > 0
      ? Number(Math.max(-100, Math.min(100, ((totalIncome - totalExpense) / totalIncome) * 100)).toFixed(1))
      : 0;

  let score = 70;
  if (savingsRate >= 35) score += 18;
  else if (savingsRate >= 20) score += 12;
  else if (savingsRate >= 10) score += 5;
  else if (savingsRate < 0) score -= 20;

  if (emergencyMonths >= 6) score += 6;
  else if (emergencyMonths < 1) score -= 10;

  const overBudgetCount = budgets.filter((b) => Number(b.spent) > Number(b.amount)).length;
  score -= overBudgetCount * 5;
  const healthScore = Math.max(10, Math.min(98, Math.round(score)));

  const sortedCats = Array.from(byCatMap.values())
    .sort((a, b) => b.amount - a.amount)
    .map((c) => ({
      ...c,
      pct: totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0,
    }));

  return {
    user: user || { name: "Pengguna", email: "" },
    categories,
    transactions,
    budgets,
    goals,
    hasRealData: true,
    rawIncome,
    rawExpense,
    totalIncome,
    totalExpense,
    netCashflow,
    liquidSavings,
    emergencyMonths,
    savingsRate,
    healthScore,
    categoryBreakdown: sortedCats.slice(0, 4),
  };
}

const aiService = {
  // ==========================================================
  // 1. AI SMART AUDITOR
  // ==========================================================
  async getSmartAuditor(userId) {
    const ctx = await loadUserFinancialContext(userId);
    const { monthLabel } = getCurrentMonthBounds();
    const top4 = ctx.categoryBreakdown;
    const top4PctSum = top4.reduce((acc, c) => acc + c.pct, 0);
    const topCategory = top4[0] || {
      category_id: null,
      name: "Belum Ada Pengeluaran",
      amount: 0,
      pct: 0,
    };

    const expenseTxs = ctx.transactions.filter((t) => t.type === "expense");

    // Load user's saved subscriptions + auto-detected subscription transactions
    let customSubItems = [];
    if (userId) {
      await ensureSubscriptionsTable();
      const subRes = await pool.query(
        `SELECT subscription_id, name, icon, monthly_cost, utilization_pct, utilization_label, utilization_value
         FROM subscriptions
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );
      customSubItems = subRes.rows.map(evaluateSubscriptionAuditItem);

      const subKeywords = [
        "langganan",
        "netflix",
        "spotify",
        "youtube",
        "gym",
        "fitness",
        "cloud",
        "icloud",
        "google one",
        "chatgpt",
        "canva",
        "disney",
        "vidio",
        "wifi",
        "indihome",
        "biznet",
      ];
      const existingNames = new Set(customSubItems.map((s) => s.name.toLowerCase()));

      for (const tx of expenseTxs) {
        const desc = (tx.description || "").toLowerCase();
        const matchedKw = subKeywords.find((kw) => desc.includes(kw));
        if (matchedKw && !existingNames.has(desc)) {
          existingNames.add(desc);
          const icon =
            desc.includes("gym") || desc.includes("fitness")
              ? "dumbbell"
              : desc.includes("cloud") || desc.includes("icloud") || desc.includes("google")
              ? "cloud"
              : "tv";
          customSubItems.push(
            evaluateSubscriptionAuditItem({
              subscription_id: null,
              name: tx.description || `Langganan ${tx.category_name}`,
              icon,
              monthly_cost: Number(tx.amount) || 0,
              utilization_pct: 25,
              utilization_label: "Deteksi Transaksi Otomatis",
              utilization_value: "Terdeteksi dari Buku Kas",
            })
          );
        }
      }
    }

    const subscriptionSavings = customSubItems.reduce(
      (sum, item) => sum + (Number(item.potentialSaving) || 0),
      0
    );
    const basePotentialSavings =
      ctx.totalExpense > 0 ? Math.round(ctx.totalExpense * 0.15) : 0;
    const totalPotentialSavingsMonthly = basePotentialSavings + subscriptionSavings;

    const efficiencyScore = ctx.hasRealData
      ? Math.max(30, Math.min(98, ctx.healthScore))
      : 0;
    const potentialPointsGain = ctx.hasRealData
      ? Math.max(0, 100 - efficiencyScore)
      : 0;

    let anomalyData = {
      category_id: null,
      spikePct: 0,
      dateLabel: "-",
      title: "Belum Ada Anomali Pengeluaran",
      normalDailyAvg: 0,
      currentDailyAvg: 0,
      explanation:
        "Belum ada transaksi pengeluaran yang tercatat. Catat transaksi Anda agar AI Smart Auditor dapat memindai lonjakan belanja.",
      recommendation:
        "Tambahkan transaksi pemasukan dan pengeluaran terlebih dahulu untuk mendapatkan rekomendasi batas belanja otomatis.",
      recommendedMonthlyCap: 0,
      severityLabel: "Belum Ada Data",
    };

    if (expenseTxs.length > 0) {
      const sortedByAmt = [...expenseTxs].sort((a, b) => Number(b.amount) - Number(a.amount));
      const biggestTx = sortedByAmt[0];
      const avgTx = ctx.totalExpense / expenseTxs.length;
      const biggestAmt = Number(biggestTx.amount) || 0;
      const spikePct =
        avgTx > 0 && biggestAmt > avgTx
          ? Math.round(((biggestAmt - avgTx) / avgTx) * 100)
          : 0;
      const txDateStr =
        biggestTx.transaction_date instanceof Date
          ? biggestTx.transaction_date.toISOString().slice(0, 10)
          : String(biggestTx.transaction_date).slice(0, 10);

      anomalyData = {
        category_id: biggestTx.category_id,
        spikePct,
        dateLabel: txDateStr,
        title: `Pengeluaran Tertinggi: ${biggestTx.category_name}`,
        normalDailyAvg: Math.round(avgTx),
        currentDailyAvg: Math.round(biggestAmt),
        explanation: `Transaksi terbesar tercatat pada "${
          biggestTx.description || biggestTx.category_name
        }" sebesar ${formatRupiahServer(biggestAmt)} (${txDateStr}) dibanding rata-rata transaksi ${formatRupiahServer(avgTx)}.`,
        recommendation: `Tetapkan batas pagu anggaran pada kategori ${
          biggestTx.category_name
        } sebesar ${formatRupiahServer(Math.round(topCategory.amount * 0.85))}/bulan.`,
        recommendedMonthlyCap: Math.round(topCategory.amount * 0.85),
        severityLabel: spikePct > 50 ? "Peringatan Tinggi" : "Terpantau",
      };
    }

    const passiveSubCount = customSubItems.filter((s) => s.utilizationPct <= 45).length;
    const anomalyCount = expenseTxs.length > 0 ? 1 : 0;
    const totalLeaks = passiveSubCount + anomalyCount;
    const activeGoalName = ctx.goals[0]?.name || "Dana Darurat";

    return {
      auditedAt: getFormattedTimestamp(),
      periodLabel: monthLabel,
      hasRealData: ctx.hasRealData,
      metrics: {
        efficiencyScore,
        efficiencyLabel: ctx.hasRealData
          ? `Skor Aktual · Potensi +${potentialPointsGain} Poin`
          : "Belum ada transaksi untuk diaudit",
        potentialSavingsMonthly: totalPotentialSavingsMonthly,
        potentialSavingsYearly: totalPotentialSavingsMonthly * 12,
        leaksCount: totalLeaks,
        leaksSubtitle:
          totalLeaks > 0
            ? `${passiveSubCount} Langganan, ${anomalyCount} Pos Pengeluaran`
            : "0 Kebocoran Terdeteksi",
        auditedTransactionsCount: ctx.transactions.length,
      },
      spendingConcentration: {
        totalExpense: ctx.totalExpense,
        top4SharePct: top4PctSum,
        categories: top4,
        auditorNote:
          ctx.totalExpense > 0
            ? `Pos ${topCategory.name} menyumbang ${topCategory.pct}% (${formatRupiahServer(
                topCategory.amount
              )}) dari total pengeluaran Anda.`
            : "Belum ada pengeluaran tercatat pada periode ini.",
      },
      anomaly: anomalyData,
      subscriptions: customSubItems,
      quickWins: [
        {
          id: "qw-goal-redirect",
          badge: "Dampak Tinggi",
          badgeType: "warning",
          title: `Alihkan Efisiensi ke ${activeGoalName}`,
          description:
            totalPotentialSavingsMonthly > 0
              ? `Alokasikan potensi penghematan (${formatRupiahServer(
                  totalPotentialSavingsMonthly
                )}/bln) langsung ke target ${activeGoalName}.`
              : "Catat transaksi atau daftar langganan Anda untuk menghitung potensi penghematan bulanan.",
          actionLabel: "Aktifkan Autodebit",
          savingAmount: totalPotentialSavingsMonthly,
        },
        {
          id: "qw-cashback",
          badge: "Optimasi Rutin",
          badgeType: "normal",
          title:
            top4.length > 0
              ? `Pengendalian Kategori ${topCategory.name}`
              : "Pengendalian Anggaran Bulanan",
          description:
            ctx.totalExpense > 0
              ? `Efisiensi 15% pada pos ${topCategory.name} dapat menghemat ${formatRupiahServer(
                  basePotentialSavings
                )}/bln.`
              : "Potensi penghematan Rp 0/bln (belum ada pengeluaran tercatat).",
          actionLabel: "Aktifkan Optimasi",
          savingAmount: basePotentialSavings,
        },
      ],
      budgetSyncPreview:
        ctx.totalExpense > 0
          ? [
              `Batas ${topCategory.name}: ${formatRupiahServer(anomalyData.recommendedMonthlyCap)}`,
              `Potensi Hemat Langganan: ${formatRupiahServer(subscriptionSavings)}`,
              `Target Tabungan: ${activeGoalName}`,
            ]
          : [
              "Batas Kategori: Rp 0 (Belum ada transaksi)",
              "Pos Langganan: Rp 0",
              "Target Tabungan: Rp 0",
            ],
    };
  },

  async syncAuditorToBudgets(userId) {
    const ctx = await loadUserFinancialContext(userId);
    const { startDate, endDate } = getCurrentMonthBounds();

    if (ctx.categoryBreakdown.length === 0) {
      const error = new Error(
        "Belum ada transaksi pengeluaran untuk disinkronkan ke AI Budgeting."
      );
      error.status = 400;
      throw error;
    }

    const existingBudgets = ctx.budgets;
    const syncedBudgets = [];

    for (const item of ctx.categoryBreakdown) {
      if (!item.category_id || item.amount <= 0) continue;
      const recommendedLimit = Math.max(10000, Math.round(item.amount * 0.9));

      const existing = existingBudgets.find((b) => b.category_id === item.category_id);
      if (existing) {
        await budgetRepository.update(existing.budget_id, userId, {
          category_id: item.category_id,
          amount: String(recommendedLimit),
          start_date: startDate,
          end_date: endDate,
        });
        const updated = await budgetRepository.findByIdAndUser(existing.budget_id, userId);
        syncedBudgets.push(updated);
      } else {
        const created = await budgetRepository.create(userId, {
          category_id: item.category_id,
          amount: String(recommendedLimit),
          start_date: startDate,
          end_date: endDate,
        });
        const full = await budgetRepository.findByIdAndUser(created.budget_id, userId);
        syncedBudgets.push(full);
      }
    }

    return {
      syncedCount: syncedBudgets.length,
      budgets: syncedBudgets,
      message: `${syncedBudgets.length} aturan batas anggaran berhasil diterapkan ke AI Budgeting.`,
    };
  },

  async applyAnomalyCap(userId, { category_id, amount }) {
    const ctx = await loadUserFinancialContext(userId);
    const { startDate, endDate } = getCurrentMonthBounds();
    const expenseCategories = ctx.categories.filter((c) => c.type === "expense");

    const targetCategoryId =
      category_id ||
      ctx.categoryBreakdown[0]?.category_id ||
      expenseCategories[0]?.category_id;

    if (!targetCategoryId) {
      const error = new Error("Kategori pengeluaran tidak ditemukan.");
      error.status = 404;
      throw error;
    }

    const capAmount = Math.round(Number(amount) || 0);
    if (capAmount <= 0) {
      const error = new Error(
        "Nominal batas belanja harus lebih dari Rp 0. Catat transaksi terlebih dahulu."
      );
      error.status = 400;
      throw error;
    }

    const existing = ctx.budgets.find((b) => b.category_id === targetCategoryId);

    let budget;
    if (existing) {
      await budgetRepository.update(existing.budget_id, userId, {
        category_id: targetCategoryId,
        amount: String(capAmount),
        start_date: startDate,
        end_date: endDate,
      });
      budget = await budgetRepository.findByIdAndUser(existing.budget_id, userId);
    } else {
      const created = await budgetRepository.create(userId, {
        category_id: targetCategoryId,
        amount: String(capAmount),
        start_date: startDate,
        end_date: endDate,
      });
      budget = await budgetRepository.findByIdAndUser(created.budget_id, userId);
    }

    return {
      budget,
      message: `Batas belanja kategori ${
        budget?.category_name || "terpilih"
      } berhasil diaktifkan sebesar ${formatRupiahServer(capAmount)}/bulan.`,
    };
  },

  async createSubscription(userId, payload = {}) {
    await ensureSubscriptionsTable();
    const name = String(payload.name || "").trim();
    const monthlyCost = Math.round(Number(payload.monthlyCost) || 0);
    const icon = ["cloud", "dumbbell", "tv"].includes(payload.icon) ? payload.icon : "tv";
    const utilizationPct = Math.max(0, Math.min(100, Number(payload.utilizationPct) ?? 20));
    const recordAsTransaction = Boolean(payload.recordAsTransaction);

    if (!name) {
      const error = new Error("Nama layanan langganan wajib diisi.");
      error.status = 400;
      throw error;
    }
    if (monthlyCost <= 0) {
      const error = new Error("Biaya langganan bulanan harus lebih dari Rp 0.");
      error.status = 400;
      throw error;
    }

    let utilizationLabel = "Tingkat Penggunaan";
    let utilizationValue = `${utilizationPct}% Terpakai`;
    if (utilizationPct === 0) {
      utilizationLabel = "Aktivitas 30 Hari Terakhir";
      utilizationValue = "Tidak Pernah Dipakai (0%)";
    } else if (utilizationPct <= 15) {
      utilizationLabel = "Frekuensi Penggunaan";
      utilizationValue = `Sangat Jarang (${utilizationPct}%)`;
    } else if (utilizationPct <= 45) {
      utilizationLabel = "Utilisasi Layanan";
      utilizationValue = `Jarang (${utilizationPct}%)`;
    } else {
      utilizationLabel = "Utilisasi Layanan";
      utilizationValue = `Rutin (${utilizationPct}%)`;
    }

    const insertRes = await pool.query(
      `INSERT INTO subscriptions (user_id, name, icon, monthly_cost, utilization_pct, utilization_label, utilization_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING subscription_id, name, icon, monthly_cost, utilization_pct, utilization_label, utilization_value`,
      [userId, name.slice(0, 120), icon, String(monthlyCost), utilizationPct, utilizationLabel, utilizationValue]
    );

    if (recordAsTransaction) {
      const categories = await categoryService.getAll(userId);
      const expenseCats = categories.filter((c) => c.type === "expense");
      const preferredCat =
        expenseCats.find((c) =>
          icon === "dumbbell"
            ? c.name.toLowerCase().includes("kesehatan")
            : icon === "cloud"
            ? c.name.toLowerCase().includes("utilitas") || c.name.toLowerCase().includes("tagihan")
            : c.name.toLowerCase().includes("hiburan")
        ) || expenseCats[0];

      if (preferredCat) {
        const today = new Date().toISOString().slice(0, 10);
        await transactionRepository.create(userId, {
          category_id: preferredCat.category_id,
          type: "expense",
          amount: String(monthlyCost),
          description: `Langganan ${name}`,
          transaction_date: today,
        });
      }
    }

    const item = evaluateSubscriptionAuditItem(insertRes.rows[0]);
    return {
      subscription: item,
      message: `Langganan "${name}" (${formatRupiahServer(monthlyCost)}/bln) berhasil ditambahkan ke AI Smart Auditor${
        recordAsTransaction ? " dan dicatat ke Buku Kas Transaksi" : ""
      }!`,
    };
  },

  async deleteSubscription(userId, subscriptionId) {
    await ensureSubscriptionsTable();
    const res = await pool.query(
      `DELETE FROM subscriptions WHERE subscription_id = $1 AND user_id = $2 RETURNING subscription_id`,
      [subscriptionId, userId]
    );
    if (res.rows.length === 0) {
      const error = new Error("Data langganan tidak ditemukan.");
      error.status = 404;
      throw error;
    }
    return {
      subscription_id: subscriptionId,
      message: "Daftar langganan berhasil dihapus dari AI Smart Auditor.",
    };
  },

  // ==========================================================
  // 2. AI FINANCIAL TWIN
  // ==========================================================
  async getFinancialTwinProfile(userId, riskOverride) {
    const ctx = await loadUserFinancialContext(userId);
    const { monthLabel } = getCurrentMonthBounds();
    const userName = ctx.user?.name ? ctx.user.name.split(" ")[0] : "Pengguna";
    const topCat = ctx.categoryBreakdown[0] || {
      name: "Belum Ada Pengeluaran",
      amount: 0,
      pct: 0,
    };

    let archetypeTitle = "Belum Terbentuk (Data Kosong)";
    let archetypeBadge = "Tipe: Menunggu Data";
    let riskProfile = riskOverride || "Moderat";
    let cashStability = "Belum Ada Data";

    if (ctx.hasRealData) {
      if (ctx.savingsRate >= 40) {
        archetypeTitle = "Balanced Wealth Builder";
        archetypeBadge = "Tipe: Akumulator Waspada";
        cashStability = "Sangat Baik";
      } else if (ctx.savingsRate >= 20) {
        archetypeTitle = "Mindful Cashflow Manager";
        archetypeBadge = "Tipe: Perencana Stabil";
        cashStability = "Stabil";
      } else if (ctx.savingsRate >= 0) {
        archetypeTitle = "Dynamic Lifestyle Optimizer";
        archetypeBadge = "Tipe: Konsumen Aktif";
        cashStability = "Cukup";
      } else {
        archetypeTitle = "Cashflow Recovery Seeker";
        archetypeBadge = "Tipe: Perlu Restrukturisasi";
        cashStability = "Defisit";
      }
    }

    const txCount = ctx.transactions.length;
    const similarityScore = ctx.hasRealData ? Math.min(98, 85 + Math.min(13, txCount)) : 0;

    const welcomeMessages = [
      {
        sender: "twin",
        time:
          new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }) + " WIB",
        text: ctx.hasRealData
          ? `Halo ${userName}! Saya kembaran finansial Anda. Saya telah menganalisis ${txCount} transaksi pada buku kas Anda dengan posisi arus kas bersih sebesar ${formatRupiahServer(
              ctx.netCashflow
            )}. Ada keputusan finansial yang ingin kita diskusikan hari ini?`
          : `Halo ${userName}! Saat ini saldo dan transaksi Anda masih Rp 0 (0 transaksi tercatat). Silakan tambahkan transaksi pemasukan atau pengeluaran Anda terlebih dahulu, atau tanyakan apa saja seputar perencanaan keuangan kepada saya!`,
        isRich: true,
        metrics: {
          pemasukan: formatRupiahServer(ctx.totalIncome),
          pengeluaran: formatRupiahServer(ctx.totalExpense),
          ketahanan: `${ctx.emergencyMonths} Bulan`,
          healthScore: `${ctx.healthScore}/100`,
          status: ctx.hasRealData ? (ctx.netCashflow >= 0 ? "AMAN" : "WASPADA") : "DATA KOSONG",
        },
      },
    ];

    return {
      syncedAt: getFormattedTimestamp(),
      periodLabel: monthLabel,
      hasRealData: ctx.hasRealData,
      analyzedTransactionsCount: txCount,
      accuracyLabel: ctx.hasRealData
        ? `Akurasi Profil: ${similarityScore}% High Precision`
        : "Akurasi Profil: 0% (Menunggu Input Transaksi)",
      archetype: {
        title: archetypeTitle,
        badge: archetypeBadge,
        similarityScore,
        description: ctx.hasRealData
          ? `Model merefleksikan ${similarityScore}% pola keuangan Anda berdasarkan pemasukan ${formatRupiahServer(
              ctx.totalIncome
            )} dan pengeluaran ${formatRupiahServer(ctx.totalExpense)}.`
          : "Belum ada histori transaksi untuk membentuk model kembaran finansial. Semua indikator dimulai dari Rp 0.",
        savingsRate: `${ctx.savingsRate}%`,
        cashStability,
        riskProfile,
      },
      habits: ctx.hasRealData
        ? [
            {
              id: "habit-savings",
              type: "normal",
              title:
                ctx.savingsRate >= 20
                  ? "Disiplin Rasio Tabungan Positif"
                  : "Peluang Peningkatan Alokasi Tabungan",
              description: `Arus kas bersih tercatat ${formatRupiahServer(
                ctx.netCashflow
              )} dengan rasio tabungan ${ctx.savingsRate}%.`,
            },
            {
              id: "habit-top-expense",
              type: "warning",
              title: `Pos Pengeluaran Utama: ${topCat.name}`,
              description: `Kategori ${topCat.name} mencatat pengeluaran ${formatRupiahServer(
                topCat.amount
              )} (${topCat.pct}% dari total belanja).`,
            },
            {
              id: "habit-goals",
              type: "normal",
              title: `${ctx.goals.length} Target Finansial Terdaftar`,
              description:
                ctx.goals.length > 0
                  ? `Target aktif utama: "${ctx.goals[0].name}" (${formatRupiahServer(
                      ctx.goals[0].target_amount
                    )}).`
                  : "Belum ada target finansial yang ditambahkan di menu Financial Goals.",
            },
          ]
        : [
            {
              id: "habit-empty",
              type: "normal",
              title: "Belum Ada Pola Transaksi",
              description:
                "Pemasukan Rp 0 dan Pengeluaran Rp 0. Pola kebiasaan finansial akan muncul otomatis setelah Anda mengisi transaksi.",
            },
          ],
      leakAlert: {
        title: ctx.totalExpense > 0 ? "Evaluasi Pos Pengeluaran" : "Belum Ada Kebocoran Kas",
        badge: ctx.totalExpense > 0 ? "Terpantau" : "Rp 0",
        description:
          ctx.totalExpense > 0
            ? `Pos ${topCat.name} sebesar ${formatRupiahServer(
                topCat.amount
              )} adalah pengeluaran terbesar Anda saat ini.`
            : "Total pengeluaran masih Rp 0. Tidak ada kebocoran kas yang terdeteksi.",
      },
      initialMessages: welcomeMessages,
    };
  },

  async chatWithFinancialTwin(userId, message, history = []) {
    const ctx = await loadUserFinancialContext(userId);
    const userName = ctx.user?.name ? ctx.user.name.split(" ")[0] : "Pengguna";
    const topCat = ctx.categoryBreakdown[0] || {
      name: "Belum Ada Pengeluaran",
      amount: 0,
      pct: 0,
    };
    const q = String(message || "").trim();
    const lower = q.toLowerCase();
    const nowTime =
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " WIB";

    const systemContext = `Anda adalah FIRA Financial Twin untuk pengguna bernama ${userName}.
Data Keuangan Aktual Pengguna dari Database PostgreSQL:
- Status Login / Data: ${ctx.hasRealData ? "Sudah memiliki data transaksi" : "Belum ada transaksi (Semua saldo masih Rp 0)"}
- Total Pemasukan: ${formatRupiahServer(ctx.totalIncome)}
- Total Pengeluaran: ${formatRupiahServer(ctx.totalExpense)}
- Arus Kas Bersih (Surplus/Defisit): ${formatRupiahServer(ctx.netCashflow)}
- Rasio Tabungan (Savings Rate): ${ctx.savingsRate}%
- Bantalan Dana Darurat: ${ctx.emergencyMonths} Bulan (${formatRupiahServer(ctx.liquidSavings)})
- Skor Kesehatan Finansial: ${ctx.healthScore}/100
- Pengeluaran Terbesar: ${topCat.name} sebesar ${formatRupiahServer(topCat.amount)} (${topCat.pct}%)
- Rincian Kategori Pengeluaran: ${
      ctx.categoryBreakdown.map((c) => `${c.name}: ${formatRupiahServer(c.amount)} (${c.pct}%)`).join(", ") ||
      "Rp 0"
    }
- Jumlah Transaksi Tercatat: ${ctx.transactions.length}
- Jumlah Budget Aktif: ${ctx.budgets.length} (${
      ctx.budgets
        .map((b) => `${b.category_name}: terpakai ${formatRupiahServer(b.spent)} dari ${formatRupiahServer(b.amount)}`)
        .join("; ") || "Belum ada budget (Rp 0)"
    })
- Target Financial Goals: ${
      ctx.goals
        .map((g) => `${g.name} (Target ${formatRupiahServer(g.target_amount)}, status: ${g.status})`)
        .join(", ") || "Belum ada goal (Rp 0)"
    }`;

    const geminiText = await callGeminiOptional(systemContext, q, history);

    let replyText = geminiText;
    let isRich = false;

    if (!replyText) {
      if (!ctx.hasRealData) {
        isRich = true;
        replyText = `Saat ini catatan keuangan Anda masih Rp 0 (Pemasukan Rp 0, Pengeluaran Rp 0). Silakan login dan tambahkan transaksi pertama Anda di menu Transaksi atau Dashboard agar saya dapat menganalisis kondisi finansial Anda secara akurat!`;
      } else if (
        lower.includes("kondisi") ||
        lower.includes("bulan ini") ||
        lower.includes("ringkasan") ||
        lower.includes("sehat")
      ) {
        isRich = true;
        replyText = `Berdasarkan data yang Anda isi, total pemasukan Anda adalah ${formatRupiahServer(
          ctx.totalIncome
        )} dan total pengeluaran ${formatRupiahServer(
          ctx.totalExpense
        )}, sehingga arus kas bersih Anda ${formatRupiahServer(ctx.netCashflow)} (Savings Rate ${
          ctx.savingsRate
        }%).`;
      } else {
        isRich = true;
        replyText = `Dari ${ctx.transactions.length} transaksi yang Anda catat, arus kas bersih Anda saat ini ${formatRupiahServer(
          ctx.netCashflow
        )} dengan pengeluaran terbesar pada ${topCat.name} (${formatRupiahServer(topCat.amount)}).`;
      }
    } else {
      isRich =
        lower.includes("kondisi") ||
        lower.includes("bulan ini") ||
        lower.includes("tabungan") ||
        lower.includes("aman");
    }

    return {
      reply: {
        sender: "twin",
        time: nowTime,
        text: replyText,
        isRich,
        metrics: isRich
          ? {
              pemasukan: formatRupiahServer(ctx.totalIncome),
              pengeluaran: formatRupiahServer(ctx.totalExpense),
              ketahanan: `${ctx.emergencyMonths} Bulan`,
              healthScore: `${ctx.healthScore}/100`,
              status: ctx.hasRealData
                ? ctx.netCashflow >= 0
                  ? "AMAN"
                  : "WASPADA"
                : "RP 0",
            }
          : null,
      },
    };
  },

  // ==========================================================
  // 3. WHAT-IF SIMULATOR
  // ==========================================================
  async runWhatIfSimulation(userId, input = {}) {
    const ctx = await loadUserFinancialContext(userId);

    const scenarioType = input.scenarioType || "Pengeluaran Besar";
    const scenarioName = input.scenarioName || "Simulasi Skenario Baru";
    const totalAmount = Math.max(0, Number(input.totalAmount) || 0);
    const paymentMethod = input.paymentMethod === "tunai" ? "tunai" : "cicilan12";
    const tenorMonths = [6, 12, 24, 36].includes(Number(input.tenorMonths))
      ? Number(input.tenorMonths)
      : 12;

    const parsedDp =
      input.downPayment !== undefined && input.downPayment !== null && input.downPayment !== ""
        ? Number(input.downPayment)
        : Math.round(totalAmount * 0.2);
    const downPayment =
      paymentMethod === "tunai"
        ? totalAmount
        : Math.min(
            totalAmount * 0.9,
            Math.max(0, Number.isFinite(parsedDp) ? parsedDp : 0)
          );
    const autoCompensate = input.autoCompensate !== undefined ? Boolean(input.autoCompensate) : false;

    const actualNetCashflow = ctx.netCashflow;
    const actualIncome = ctx.totalIncome;
    const actualExpense = ctx.totalExpense;
    const actualEmergencyMonths = ctx.emergencyMonths;
    const actualLiquidSavings = ctx.liquidSavings;
    const actualHealthScore = ctx.healthScore;

    const monthlyInterestRate =
      scenarioType === "Investasi" || scenarioType === "Anggaran" ? 0 : 0.005;

    const principalLoan = Math.max(0, totalAmount - downPayment);
    const totalInterest =
      paymentMethod === "tunai" || totalAmount === 0
        ? 0
        : Math.round(principalLoan * monthlyInterestRate * tenorMonths);
    const monthlyInstallment =
      paymentMethod === "tunai" || totalAmount === 0
        ? 0
        : Math.round((principalLoan + totalInterest) / tenorMonths);

    const compensationCut =
      autoCompensate && monthlyInstallment > 0
        ? Math.min(500000, Math.round(monthlyInstallment * 0.45))
        : 0;

    let projectedNetCashflow = actualNetCashflow;
    if (totalAmount > 0) {
      if (scenarioType === "Anggaran") {
        projectedNetCashflow = actualNetCashflow + Math.round(totalAmount / tenorMonths);
      } else if (paymentMethod === "tunai") {
        projectedNetCashflow = actualNetCashflow + compensationCut;
      } else {
        projectedNetCashflow = actualNetCashflow - monthlyInstallment + compensationCut;
      }
    }

    const cashflowDelta = projectedNetCashflow - actualNetCashflow;
    const cashflowDeltaPct =
      actualNetCashflow > 0
        ? Number(((cashflowDelta / actualNetCashflow) * 100).toFixed(1))
        : 0;

    const upfrontCashOut =
      totalAmount === 0 || scenarioType === "Anggaran" || scenarioType === "Investasi"
        ? 0
        : paymentMethod === "tunai"
        ? totalAmount
        : downPayment;

    const remainingLiquidSavings = Math.max(0, actualLiquidSavings - upfrontCashOut);
    const projectedEmergencyMonths =
      actualExpense > 0
        ? Number(Math.min(24, Math.max(0, remainingLiquidSavings / actualExpense)).toFixed(1))
        : remainingLiquidSavings > 0
        ? 1.0
        : 0;
    const emergencyDelta = Number((projectedEmergencyMonths - actualEmergencyMonths).toFixed(1));

    const dsrPercentage =
      actualIncome > 0
        ? Number(((monthlyInstallment / actualIncome) * 100).toFixed(1))
        : 0;

    let projectedHealthScore = actualHealthScore;
    if (ctx.hasRealData && totalAmount > 0) {
      let healthDelta = 0;
      if (paymentMethod === "tunai") {
        healthDelta = remainingLiquidSavings === 0 ? -15 : -4;
      } else {
        if (dsrPercentage > 30) healthDelta -= 18;
        else if (dsrPercentage > 15) healthDelta -= 9;
        else healthDelta -= 4;
        if (autoCompensate) healthDelta += 2;
      }
      projectedHealthScore = Math.max(10, Math.min(99, actualHealthScore + healthDelta));
    }
    const healthDelta = projectedHealthScore - actualHealthScore;

    const monthNames = ["Bln 1", "Bln 2", "Bln 3", "Bln 4", "Bln 5", "Bln 6"];
    const projectionBars = monthNames.map((label, idx) => {
      if (!ctx.hasRealData && totalAmount === 0) {
        return { label, surplus: 0, heightPct: 5 };
      }
      const monthSurplus = Math.max(0, projectedNetCashflow);
      const denom = Math.max(actualNetCashflow, projectedNetCashflow, 1);
      const heightPct =
        monthSurplus > 0
          ? Math.max(15, Math.min(95, Math.round((monthSurplus / denom) * 80) + idx * 2))
          : 5;
      return {
        label,
        surplus: monthSurplus,
        heightPct,
      };
    });

    const isSafe =
      ctx.hasRealData && projectedNetCashflow >= 0 && dsrPercentage <= 30;
    const isWarning =
      ctx.hasRealData && projectedNetCashflow >= 0 && dsrPercentage > 30;

    const evaluationBadge = !ctx.hasRealData
      ? "MENUNGGU DATA TRANSAKSI (RP 0)"
      : totalAmount === 0
      ? "MASUKKAN NILAI SIMULASI"
      : isSafe
      ? "REKOMENDASI: LAYAK DIAMBIL"
      : isWarning
      ? "REKOMENDASI: PERLU KOMPENSASI"
      : "REKOMENDASI: RISIKO DEFISIT";

    const evaluationPoints = !ctx.hasRealData
      ? [
          "ℹ️ Saldo dan arus kas aktual Anda saat ini masih Rp 0 (belum ada transaksi tercatat).",
          "ℹ️ Silakan login dan catat pemasukan/pengeluaran Anda terlebih dahulu, atau pilih preset di atas untuk mencoba kalkulator simulasi.",
        ]
      : totalAmount === 0
      ? [
          `✓ Arus kas aktual Anda saat ini adalah ${formatRupiahServer(actualNetCashflow)}/bulan.`,
          "ℹ️ Pilih salah satu Preset Skenario di atas atau masukkan Total Nilai Transaksi untuk melihat dampak simulasi.",
        ]
      : [
          isSafe
            ? `✓ Skenario "${scenarioName}" (${formatRupiahServer(
                totalAmount
              )}) masih dapat ditampung oleh arus kas Anda (${formatRupiahServer(
                projectedNetCashflow
              )}/bln setelah simulasi).`
            : `⚠️ Skenario "${scenarioName}" membuat arus kas bersih Anda menjadi ${formatRupiahServer(
                projectedNetCashflow
              )}/bln.`,
          paymentMethod === "tunai"
            ? `Pembayaran tunai membutuhkan kas ${formatRupiahServer(totalAmount)} sekaligus.`
            : `Angsuran bulanan sebesar ${formatRupiahServer(
                monthlyInstallment
              )}/bln selama ${tenorMonths} bulan (DSR ${dsrPercentage}%).`,
        ];

    const cashEmergencyMonths =
      actualExpense > 0
        ? Number(Math.max(0, (actualLiquidSavings - totalAmount) / actualExpense).toFixed(1))
        : 0;
    const installmentPrincipal = Math.max(0, totalAmount - Math.round(totalAmount * 0.2));
    const installmentInterest = Math.round(installmentPrincipal * 0.005 * tenorMonths);
    const installmentMonthly =
      totalAmount > 0
        ? Math.round((installmentPrincipal + installmentInterest) / tenorMonths)
        : 0;
    const installmentTotalCost = totalAmount + installmentInterest;
    const save3MMonthly = totalAmount > 0 ? Math.round(totalAmount / 3) : 0;

    return {
      hasRealData: ctx.hasRealData,
      parameters: {
        scenarioType,
        scenarioName,
        totalAmount,
        paymentMethod,
        downPayment,
        tenorMonths,
        autoCompensate,
        monthlyInstallment,
        compensationCut,
      },
      baseline: {
        actualNetCashflow,
        actualIncome,
        actualExpense,
        actualEmergencyMonths,
        actualHealthScore,
      },
      impact: {
        projectedNetCashflow,
        cashflowDelta,
        cashflowDeltaPct,
        projectedEmergencyMonths,
        emergencyDelta,
        dsrPercentage,
        dsrStatus: !ctx.hasRealData
          ? "Belum ada data pemasukan (Rp 0)"
          : dsrPercentage <= 30
          ? "Dalam Batas Aman (Maksimal 30%)"
          : "Tinggi (Melewati Ambang Aman 30%)",
        projectedHealthScore,
        healthDelta,
      },
      projectionBars,
      evaluation: {
        badge: evaluationBadge,
        level: isSafe ? "safe" : isWarning ? "warning" : "danger",
        points: evaluationPoints,
      },
      comparisonMatrix: {
        optionA_Cash: {
          upfront: `${formatRupiahServer(totalAmount)} (Tunai)`,
          monthlyLoad: "Rp 0 / bulan",
          emergencyImpact: `${cashEmergencyMonths} Bulan`,
          emergencySeverity: cashEmergencyMonths < 3 ? "danger" : "safe",
          totalCost: `${formatRupiahServer(totalAmount)} (Nett)`,
          verdict: totalAmount > 0 ? "Bayar Penuh" : "Rp 0",
        },
        optionB_Installment: {
          upfront: `${formatRupiahServer(Math.round(totalAmount * 0.2))} (DP 20%)`,
          monthlyLoad: `${formatRupiahServer(installmentMonthly)} / bulan (${tenorMonths}x)`,
          emergencyImpact: `${projectedEmergencyMonths} Bulan`,
          emergencySeverity: "safe",
          totalCost: `${formatRupiahServer(installmentTotalCost)} (Bunga ${formatRupiahServer(
            installmentInterest
          )})`,
          verdict: totalAmount > 0 ? "Cicilan Bertahap" : "Rp 0",
        },
        optionC_SaveFirst: {
          upfront: "Rp 0 Hari Ini",
          monthlyLoad: `${formatRupiahServer(save3MMonthly)} / bln (Selama 3 Bln)`,
          emergencyImpact: `Tetap ${actualEmergencyMonths} Bulan`,
          emergencySeverity: "safe",
          totalCost: `${formatRupiahServer(totalAmount)} (Bebas Bunga)`,
          verdict: totalAmount > 0 ? "Paling Hemat" : "Rp 0",
        },
      },
    };
  },

  async saveWhatIfScenarioAsGoal(userId, input = {}) {
    const scenarioName = String(input.scenarioName || "Skenario What-If FIRA").trim();
    const totalAmount = Math.round(Number(input.totalAmount) || 0);
    if (totalAmount <= 0) {
      const error = new Error("Total nilai skenario harus lebih besar dari Rp 0.");
      error.status = 400;
      throw error;
    }
    const tenorMonths = Math.max(1, Number(input.tenorMonths) || 12);

    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + tenorMonths);

    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);

    const result = await pool.query(
      `INSERT INTO financial_goals (user_id, name, target_amount, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING financial_goal_id, user_id, name, target_amount, start_date, end_date, status, created_at`,
      [userId, scenarioName.slice(0, 150), String(totalAmount), startDate, endDate]
    );

    return {
      goal: result.rows[0],
      message: `Skenario "${scenarioName}" (${formatRupiahServer(
        totalAmount
      )}) berhasil disimpan ke Financial Goals Anda!`,
    };
  },

  // ==========================================================
  // 4. FINANCIAL WEATHER
  // ==========================================================
  async getFinancialWeather(userId) {
    const ctx = await loadUserFinancialContext(userId);
    const { monthLabel } = getCurrentMonthBounds();

    if (!ctx.hasRealData) {
      const now = new Date();
      const emptyForecasts = [1, 2, 3].map((offset) => {
        const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const mName = d
          .toLocaleDateString("id-ID", { month: "long", year: "numeric" })
          .toUpperCase();
        return {
          monthLabel: mName,
          badge: "Belum Ada Data",
          iconType: "cloud-sun",
          predictedScore: 0,
          projectedSurplus: 0,
          note: "Catat pemasukan dan pengeluaran Anda agar AI dapat memproyeksikan cuaca finansial bulan ini.",
        };
      });

      return {
        updatedAt: getFormattedTimestamp(),
        periodLabel: monthLabel,
        hasRealData: false,
        weatherScore: 0,
        zone: "berawan",
        statusTitle: "BELUM ADA DATA TRANSAKSI (RP 0)",
        categoryLabel: "Silakan catat transaksi untuk melihat diagnosis cuaca keuangan",
        aiNarrative:
          "Saat ini saldo pemasukan dan pengeluaran Anda masih Rp 0. Tambahkan data transaksi Anda agar radar meteorologi finansial FIRA dapat menghitung ketahanan kas dan proyeksi 3 bulan ke depan.",
        summaryMetrics: {
          netCashflow: 0,
          cashCushionMonths: 0,
          debtRatioPct: 0,
          savingsRatePct: 0,
        },
        barometers: {
          spendingPressure: {
            badge: "Belum Ada Data",
            score: 0,
            realizedAmount: 0,
            limitAmount: 0,
          },
          liquidityHumidity: {
            badge: "Belum Ada Data",
            score: 0,
            liquidCashAmount: 0,
            statusText: "Rp 0",
          },
          cashflowVolatility: {
            badge: "Belum Ada Data",
            stdDevPct: 0,
            statusText: "Rp 0",
            thresholdPct: 0,
          },
          stormVulnerability: {
            badge: "Belum Ada Data",
            probabilityLabel: "0%",
            probabilityPct: 0,
            debtLoadPct: 0,
            zoneText: "Rp 0",
          },
        },
        forecasts: emptyForecasts,
        mitigations: [
          {
            id: "mit-budget-cap",
            badge: "Langkah Awal",
            badgeType: "normal",
            title: "Mulai Catat Transaksi & Anggaran Pertama Anda",
            description:
              "Semua indikator saat ini dimulai dari Rp 0. Buat anggaran di menu AI Budgeting setelah mencatat transaksi.",
            actionType: "apply-budget",
            actionLabel: "Terapkan ke AI Budgeting",
            recommendedCap: 0,
            category_id: null,
          },
          {
            id: "mit-simulator",
            badge: "Simulasi",
            badgeType: "normal",
            title: "Uji Rencana Keuangan di What-If Simulator",
            description:
              "Gunakan simulator untuk menghitung rencana pembelian atau tabungan Anda.",
            actionType: "open-simulator",
            actionLabel: "Buka What-If Simulator",
          },
        ],
        extremeSimulation: {
          maxSurvivalMonths: 0,
          cashCondition: "Rp 0 (Belum Ada Data)",
        },
      };
    }

    const weatherScore = ctx.healthScore;
    let zone = "cerah";
    let statusTitle = "CERAH (AMAN & RESILIEN)";
    let categoryLabel = "Sangat Baik & Bantalan Tahan Tinggi";

    if (weatherScore >= 80) {
      zone = "cerah";
      statusTitle = "CERAH (AMAN & RESILIEN)";
      categoryLabel = "Sangat Baik & Bantalan Tahan Tinggi";
    } else if (weatherScore >= 60) {
      zone = "berawan";
      statusTitle = "BERAWAN (STABIL NAMUN WASPADA)";
      categoryLabel = "Cukup Baik & Perlu Disiplin Anggaran";
    } else if (weatherScore >= 40) {
      zone = "hujan";
      statusTitle = "HUJAN RINGAN (TEKANAN ARUS KAS)";
      categoryLabel = "Likuiditas Menipis & Perlu Efisiensi";
    } else {
      zone = "badai";
      statusTitle = "BADAI FINANSIAL (KRITIS)";
      categoryLabel = "Defisit Arus Kas & Risiko Likuiditas";
    }

    const totalBudgetLimit =
      ctx.budgets.length > 0
        ? ctx.budgets.reduce((s, b) => s + Number(b.amount), 0)
        : ctx.totalExpense;

    const spendingPressureScore =
      totalBudgetLimit > 0
        ? Math.max(
            10,
            Math.min(
              98,
              Math.round(100 - Math.max(0, (ctx.totalExpense / totalBudgetLimit) * 50))
            )
          )
        : 80;

    const liquidityScore = Math.max(
      10,
      Math.min(98, Math.round((ctx.emergencyMonths / 6) * 90))
    );

    const volatilityPct = Math.max(
      5,
      Math.min(45, Math.round(100 - Math.max(0, ctx.savingsRate)))
    );

    const stormRiskPct =
      weatherScore >= 80 ? 5 : weatherScore >= 60 ? 15 : weatherScore >= 40 ? 35 : 65;

    const now = new Date();
    const forecasts = [1, 2, 3].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const mName = d
        .toLocaleDateString("id-ID", { month: "long", year: "numeric" })
        .toUpperCase();
      const predScore = Math.max(20, Math.min(98, weatherScore + offset * 2 - 2));
      const projSurplus = Math.round(ctx.netCashflow);

      const activeGoal = ctx.goals[0];
      const note =
        activeGoal && offset === 3
          ? `Milestone Target: Progres "${activeGoal.name}" (${formatRupiahServer(
              activeGoal.target_amount
            )}) diproyeksikan berlanjut sesuai surplus aktual.`
          : `Proyeksi berdasarkan arus kas bersih aktual Anda (${formatRupiahServer(
              ctx.netCashflow
            )}/bulan).`;

      return {
        monthLabel: mName,
        badge:
          predScore >= 80
            ? "Cerah"
            : predScore >= 60
            ? "Berawan"
            : "Perlu Waspada",
        iconType: predScore >= 85 ? "sparkles" : predScore >= 75 ? "sun" : "cloud-sun",
        predictedScore: predScore,
        projectedSurplus: projSurplus,
        note,
      };
    });

    const topCategory = ctx.categoryBreakdown[0] || {
      category_id: null,
      name: "Pengeluaran Utama",
      amount: 0,
    };

    return {
      updatedAt: getFormattedTimestamp(),
      periodLabel: monthLabel,
      hasRealData: true,
      weatherScore,
      zone,
      statusTitle,
      categoryLabel,
      aiNarrative: `Berdasarkan data transaksi Anda pada periode ${monthLabel}, arus kas bersih Anda tercatat ${formatRupiahServer(
        ctx.netCashflow
      )} dengan bantalan kas ${ctx.emergencyMonths} bulan.`,
      summaryMetrics: {
        netCashflow: ctx.netCashflow,
        cashCushionMonths: ctx.emergencyMonths,
        debtRatioPct: 0.0,
        savingsRatePct: ctx.savingsRate,
      },
      barometers: {
        spendingPressure: {
          badge: spendingPressureScore >= 70 ? "Tekanan Rendah" : "Tekanan Sedang",
          score: spendingPressureScore,
          realizedAmount: ctx.totalExpense,
          limitAmount: totalBudgetLimit,
        },
        liquidityHumidity: {
          badge: liquidityScore >= 70 ? "Likuiditas Sehat" : "Perlu Ditambah",
          score: liquidityScore,
          liquidCashAmount: ctx.liquidSavings,
          statusText: `${ctx.emergencyMonths} Bulan`,
        },
        cashflowVolatility: {
          badge: volatilityPct <= 25 ? "Terkendali" : "Fluktuatif",
          stdDevPct: volatilityPct,
          statusText: "Dari Transaksi Aktual",
          thresholdPct: 35,
        },
        stormVulnerability: {
          badge: `Risiko ${stormRiskPct}%`,
          probabilityLabel: `${stormRiskPct}%`,
          probabilityPct: stormRiskPct,
          debtLoadPct: 0,
          zoneText: weatherScore >= 60 ? "Zona Aman" : "Perlu Perhatian",
        },
      },
      forecasts,
      mitigations: [
        {
          id: "mit-budget-cap",
          badge: "Rekomendasi Anggaran",
          badgeType: "warning",
          title: `Atur Batas Pagu Kategori ${topCategory.name}`,
          description:
            topCategory.amount > 0
              ? `Pengeluaran kategori ${topCategory.name} tercatat ${formatRupiahServer(
                  topCategory.amount
                )}. Pasang batas anggaran ${formatRupiahServer(
                  Math.round(topCategory.amount * 0.9)
                )}.`
              : "Belum ada pengeluaran kategori untuk diberikan batas pagu.",
          actionType: "apply-budget",
          actionLabel: "Terapkan ke AI Budgeting",
          recommendedCap: Math.round(topCategory.amount * 0.9),
          category_id: topCategory.category_id,
        },
        {
          id: "mit-simulator",
          badge: "Optimalisasi",
          badgeType: "normal",
          title: "Simulasikan Alokasi Surplus Kas",
          description: `Surplus kas bersih Anda saat ini ${formatRupiahServer(
            ctx.netCashflow
          )}. Uji rencana keuangan Anda di What-If Simulator.`,
          actionType: "open-simulator",
          actionLabel: "Buka What-If Simulator",
        },
      ],
      extremeSimulation: {
        maxSurvivalMonths: ctx.emergencyMonths,
        cashCondition:
          ctx.emergencyMonths >= 6
            ? "Sangat Aman"
            : ctx.emergencyMonths > 0
            ? "Cukup"
            : "Rp 0",
      },
    };
  },

  async runWeatherStressTest(userId, input = {}) {
    const ctx = await loadUserFinancialContext(userId);
    const scenario = input.scenario || "job_loss_6m";

    if (!ctx.hasRealData) {
      return {
        scenario,
        title: "Belum Ada Data Kas (Rp 0)",
        survivalMonths: 0,
        extendedSurvivalMonths: 0,
        postShockScore: 0,
        status: "BELUM ADA DATA",
        recommendation:
          "Saldo kas Anda masih Rp 0. Silakan catat transaksi pemasukan dan pengeluaran terlebih dahulu untuk menjalankan Stress-Test.",
      };
    }

    const monthlyExpense = ctx.totalExpense > 0 ? ctx.totalExpense : 0;
    const liquidSavings = ctx.liquidSavings;

    let title = "Simulasi Kehilangan Pendapatan Utama (6 Bulan)";
    let shockAmount = 0;
    let monthlyBurn = monthlyExpense;

    if (scenario === "emergency_10m") {
      title = "Simulasi Darurat Medis / Kerusakan Aset Rp 10.000.000";
      shockAmount = 10000000;
    } else if (scenario === "inflation_25") {
      title = "Simulasi Lonjakan Biaya Hidup / Inflasi +25%";
      monthlyBurn = Math.round(monthlyExpense * 1.25);
    }

    const remainingSavings = Math.max(0, liquidSavings - shockAmount);
    const survivalMonths =
      monthlyBurn > 0
        ? Number((remainingSavings / monthlyBurn).toFixed(1))
        : remainingSavings > 0
        ? 1.0
        : 0;
    const essentialOnlyBurn = Math.round(monthlyBurn * 0.72);
    const extendedSurvivalMonths =
      essentialOnlyBurn > 0
        ? Number((remainingSavings / essentialOnlyBurn).toFixed(1))
        : survivalMonths;

    const postShockScore = Math.max(
      10,
      Math.min(95, Math.round((survivalMonths / 6) * ctx.healthScore))
    );

    return {
      scenario,
      title,
      survivalMonths,
      extendedSurvivalMonths,
      postShockScore,
      status:
        survivalMonths >= 5
          ? "TAHAN BADAI (RESILIEN)"
          : survivalMonths >= 2
          ? "WASPADA"
          : "PERLU CADANGAN KAS",
      recommendation: `Berdasarkan saldo bersih Anda (${formatRupiahServer(
        liquidSavings
      )}), dana Anda mampu bertahan ${survivalMonths} bulan (atau ${extendedSurvivalMonths} bulan dalam mode hemat).`,
    };
  },
};

module.exports = aiService;
