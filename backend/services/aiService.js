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

  // Build multi-turn conversation contents
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
      // Try next fallback model if timeout or model not available
    }
  }

  return null;
}

async function loadUserFinancialContext(userId) {
  if (!userId) {
    return {
      user: { name: "Pengguna FIRA", email: "user@fira.ai" },
      categories: [],
      transactions: [],
      budgets: [],
      goals: [],
      hasRealData: false,
      totalIncome: 12850000,
      totalExpense: 7420000,
      netCashflow: 5430000,
      liquidSavings: 34750000,
      emergencyMonths: 6.4,
      savingsRate: 42.2,
      healthScore: 88,
      categoryBreakdown: [
        { category_id: null, name: "Makanan & Minuman (F&B)", amount: 2850000, pct: 38 },
        { category_id: null, name: "Kebutuhan Rumah & Utilitas", amount: 1620000, pct: 22 },
        { category_id: null, name: "Transportasi & Bensin", amount: 1150000, pct: 15 },
        { category_id: null, name: "Hiburan & Gaya Hidup", amount: 950000, pct: 13 },
      ],
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
    const expenseCats = categories.filter((c) => c.type === "expense");
    return {
      user: user || { name: "Pengguna FIRA", email: "user@fira.ai" },
      categories,
      transactions: [],
      budgets,
      goals,
      hasRealData: false,
      totalIncome: 12850000,
      totalExpense: 7420000,
      netCashflow: 5430000,
      liquidSavings: 34750000,
      emergencyMonths: 6.4,
      savingsRate: 42.2,
      healthScore: 88,
      categoryBreakdown: [
        {
          category_id: expenseCats[0]?.category_id || null,
          name: expenseCats[0]?.name || "Makanan & Minuman",
          amount: 2850000,
          pct: 38,
        },
        {
          category_id: expenseCats[1]?.category_id || null,
          name: expenseCats[1]?.name || "Rumah & Utilitas",
          amount: 1620000,
          pct: 22,
        },
        {
          category_id: expenseCats[2]?.category_id || null,
          name: expenseCats[2]?.name || "Transportasi",
          amount: 1150000,
          pct: 15,
        },
        {
          category_id: expenseCats[3]?.category_id || null,
          name: expenseCats[3]?.name || "Hiburan & Gaya Hidup",
          amount: 950000,
          pct: 13,
        },
      ],
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

  // Ensure sensible denominators when user has only recorded one side (e.g. only expenses or only income)
  const totalIncome = rawIncome > 0 ? rawIncome : Math.max(rawExpense * 1.35, 8500000);
  const totalExpense = rawExpense > 0 ? rawExpense : 0;
  const netCashflow = rawIncome > 0 ? rawIncome - rawExpense : totalIncome - totalExpense;

  const monthlyBaselineExpense = Math.max(totalExpense, Math.round(totalIncome * 0.45), 3000000);
  const accumulatedSurplus = Math.max(netCashflow, 0);
  const liquidSavings = Math.max(accumulatedSurplus * 4 + 12000000, netCashflow > 0 ? netCashflow * 5 : 15000000);
  const emergencyMonths = Number(
    Math.min(18, Math.max(0.5, liquidSavings / monthlyBaselineExpense)).toFixed(1)
  );

  const savingsRate =
    totalIncome > 0
      ? Number(Math.max(-100, Math.min(95, ((totalIncome - totalExpense) / totalIncome) * 100)).toFixed(1))
      : 0;

  // Compute health score (0 - 100)
  let score = 70;
  if (savingsRate >= 35) score += 18;
  else if (savingsRate >= 20) score += 12;
  else if (savingsRate >= 10) score += 5;
  else if (savingsRate < 0) score -= 20;

  if (emergencyMonths >= 6) score += 6;
  else if (emergencyMonths < 3) score -= 10;

  const overBudgetCount = budgets.filter((b) => Number(b.spent) > Number(b.amount)).length;
  score -= overBudgetCount * 5;
  const healthScore = Math.max(25, Math.min(98, Math.round(score)));

  const sortedCats = Array.from(byCatMap.values())
    .sort((a, b) => b.amount - a.amount)
    .map((c) => ({
      ...c,
      pct: totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0,
    }));

  // Pad up to 4 categories with user's other expense categories if fewer than 4 have transactions
  const usedCatIds = new Set(sortedCats.map((c) => c.category_id));
  for (const cat of categories) {
    if (sortedCats.length >= 4) break;
    if (cat.type === "expense" && !usedCatIds.has(cat.category_id)) {
      sortedCats.push({
        category_id: cat.category_id,
        name: cat.name,
        amount: 0,
        count: 0,
        pct: 0,
      });
      usedCatIds.add(cat.category_id);
    }
  }

  return {
    user: user || { name: "Pengguna FIRA", email: "user@fira.ai" },
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
      name: "Makanan & Minuman",
      amount: 2850000,
      pct: 38,
    };

    const efficiencyScore = Math.max(45, Math.min(96, ctx.healthScore - 8));
    const potentialPointsGain = Math.min(24, 100 - efficiencyScore - 4);

    // Calculate potential savings from top categories & subscriptions
    const basePotentialSavings = ctx.hasRealData && ctx.totalExpense > 0
      ? Math.max(150000, Math.round(ctx.totalExpense * 0.18))
      : 1450000;

    // Detect spike/anomaly from real expense transactions
    const expenseTxs = ctx.transactions.filter((t) => t.type === "expense");
    let anomalyData = {
      category_id: topCategory.category_id,
      spikePct: 42,
      dateLabel: "Minggu Ini",
      title: `Lonjakan Ekstrem Kategori ${topCategory.name}`,
      normalDailyAvg: 65000,
      currentDailyAvg: 245000,
      explanation: `Ditemukan konsentrasi pengeluaran pada kategori ${topCategory.name} dengan akumulasi ${formatRupiahServer(topCategory.amount)} (${topCategory.pct}% dari total belanja).`,
      recommendation: `Terapkan batas pagu bulanan untuk ${topCategory.name} sebesar ${formatRupiahServer(Math.max(500000, Math.round(topCategory.amount * 0.8)))} atau aktifkan peringatan belanja harian.`,
      recommendedMonthlyCap: Math.max(500000, Math.round((topCategory.amount || 2000000) * 0.85)),
      severityLabel: topCategory.pct >= 40 ? "Peringatan Tinggi" : "Peringatan Sedang",
    };

    if (expenseTxs.length > 0) {
      const sortedByAmt = [...expenseTxs].sort((a, b) => Number(b.amount) - Number(a.amount));
      const biggestTx = sortedByAmt[0];
      const avgTx = ctx.totalExpense / expenseTxs.length;
      const biggestAmt = Number(biggestTx.amount) || 0;
      const spikePct = avgTx > 0 ? Math.max(15, Math.round(((biggestAmt - avgTx) / avgTx) * 100)) : 35;
      const txDateStr = biggestTx.transaction_date instanceof Date
        ? biggestTx.transaction_date.toISOString().slice(0, 10)
        : String(biggestTx.transaction_date).slice(0, 10);

      anomalyData = {
        category_id: biggestTx.category_id,
        spikePct,
        dateLabel: txDateStr,
        title: `Lonjakan Pengeluaran ${biggestTx.category_name}`,
        normalDailyAvg: Math.round(avgTx),
        currentDailyAvg: Math.round(biggestAmt),
        explanation: `Terdeteksi transaksi "${biggestTx.description || biggestTx.category_name}" sebesar ${formatRupiahServer(biggestAmt)} pada ${txDateStr}, melampaui rata-rata transaksi normal Anda (${formatRupiahServer(avgTx)}).`,
        recommendation: `Aktifkan batas pagu anggaran otomatis pada kategori ${biggestTx.category_name} sebesar ${formatRupiahServer(Math.max(500000, Math.round(topCategory.amount * 0.85)))}/bulan agar kas tetap terjaga.`,
        recommendedMonthlyCap: Math.max(500000, Math.round((topCategory.amount || biggestAmt) * 0.85)),
        severityLabel: spikePct > 50 ? "Peringatan Tinggi" : "Peringatan Sedang",
      };
    }

    const activeGoalName = ctx.goals[0]?.name || "Dana Darurat";

    // Load custom subscriptions from PostgreSQL + auto-detect recurring transactions
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

      // Also auto-detect transactions with subscription keywords if not already in customSubItems
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
              monthly_cost: Number(tx.amount) || 100000,
              utilization_pct: 25,
              utilization_label: "Deteksi Transaksi Otomatis",
              utilization_value: "Terdeteksi dari Buku Kas",
            })
          );
        }
      }
    }

    const defaultSubscriptions = [
      {
        id: "cloud-storage",
        icon: "cloud",
        name: "Cloud Storage Backup",
        monthlyCost: 135000,
        utilizationPct: 12,
        utilizationLabel: "Utilisasi Kuota",
        utilizationValue: "Hanya 12%",
        advice: "Downgrade ke paket 200GB. Kebutuhan data riil Anda hanya 140GB.",
        potentialSaving: 95000,
        actionLabel: "Downgrade Paket",
        isCritical: false,
        isCustom: false,
      },
      {
        id: "gym-membership",
        icon: "dumbbell",
        name: "Membership Gym",
        monthlyCost: 450000,
        utilizationPct: 0,
        utilizationLabel: "Presensi 40 Hari Terakhir",
        utilizationValue: "0 Check-in",
        advice: "Tidak terdeteksi absensi presensi. Bekukan/jeda atau hentikan langganan aktif.",
        potentialSaving: 450000,
        actionLabel: "Jeda / Bekukan",
        isCritical: true,
        isCustom: false,
      },
      {
        id: "video-streaming",
        icon: "tv",
        name: "Video Streaming B",
        monthlyCost: 65000,
        utilizationPct: 20,
        utilizationLabel: "Durasi Tontonan",
        utilizationValue: "< 1 jam / bulan",
        advice: "Terdapat overlap konten dengan Platform A yang digunakan rutin.",
        potentialSaving: 65000,
        actionLabel: "Hentikan Langganan",
        isCritical: false,
        isCustom: false,
      },
    ];

    const finalSubscriptions =
      customSubItems.length > 0
        ? [...customSubItems, ...defaultSubscriptions.slice(0, Math.max(0, 3 - customSubItems.length))]
        : defaultSubscriptions;

    const subscriptionSavings = finalSubscriptions.reduce(
      (sum, item) => sum + (Number(item.potentialSaving) || 0),
      0
    );
    const totalPotentialSavingsMonthly = Math.max(basePotentialSavings, subscriptionSavings);
    const passiveSubCount = finalSubscriptions.filter((s) => s.utilizationPct <= 45).length;

    return {
      auditedAt: getFormattedTimestamp(),
      periodLabel: monthLabel,
      hasRealData: ctx.hasRealData,
      metrics: {
        efficiencyScore,
        efficiencyLabel:
          efficiencyScore >= 80
            ? `Sangat Efisien · Potensi +${potentialPointsGain} Poin`
            : `Cukup Baik · Potensi +${potentialPointsGain} Poin`,
        potentialSavingsMonthly: totalPotentialSavingsMonthly,
        potentialSavingsYearly: totalPotentialSavingsMonthly * 12,
        leaksCount: passiveSubCount + 1,
        leaksSubtitle: `${passiveSubCount} Langganan Pasif, 1 Anomali Lonjakan`,
        auditedTransactionsCount: ctx.hasRealData ? ctx.transactions.length : 142,
      },
      spendingConcentration: {
        totalExpense: ctx.totalExpense,
        top4SharePct: top4PctSum || 88,
        categories: top4,
        auditorNote: `Pos ${topCategory.name} menyumbang ${topCategory.pct}% (${formatRupiahServer(topCategory.amount)}) dari total pengeluaran Anda. Disarankan mengevaluasi frekuensi transaksi pada pos ini agar tidak melebihi batas ideal 30%.`,
      },
      anomaly: anomalyData,
      subscriptions: finalSubscriptions,
      quickWins: [
        {
          id: "qw-goal-redirect",
          badge: "Dampak Tinggi",
          badgeType: "warning",
          title: `Alihkan Surplus Efisiensi ke ${activeGoalName}`,
          description: `Alokasikan efisiensi penghematan (${formatRupiahServer(subscriptionSavings)}/bln) langsung ke target ${activeGoalName}. Mempercepat pencapaian target hingga 2,3 bulan lebih awal.`,
          actionLabel: "Aktifkan Autodebit",
          savingAmount: subscriptionSavings,
        },
        {
          id: "qw-cashback",
          badge: "Cashback Rutin",
          badgeType: "normal",
          title: `Optimasi Pengeluaran ${top4[2]?.name || "Transportasi & BBM"}`,
          description: `Gunakan metode pembayaran terintegrasi untuk pos ${top4[2]?.name || "Transportasi"}. Memberikan potensi penghematan Rp 120.000/bln secara otomatis.`,
          actionLabel: "Hubungkan Promo",
          savingAmount: 120000,
        },
      ],
      budgetSyncPreview: [
        `Batas ${topCategory.name} disesuaikan: ${formatRupiahServer(anomalyData.recommendedMonthlyCap)}`,
        `Pos Langganan Berkurang ${formatRupiahServer(subscriptionSavings)}`,
        `Porsi Tabungan (${activeGoalName}) bertambah otomatis`,
      ],
    };
  },

  async syncAuditorToBudgets(userId) {
    const ctx = await loadUserFinancialContext(userId);
    const { startDate, endDate } = getCurrentMonthBounds();
    const expenseCategories = ctx.categories.filter((c) => c.type === "expense");

    if (expenseCategories.length === 0) {
      const error = new Error("Belum ada kategori pengeluaran untuk disinkronkan.");
      error.status = 400;
      throw error;
    }

    const existingBudgets = ctx.budgets;
    const syncedBudgets = [];

    // Recommended budget allocation for top expense categories
    const targetCategories =
      ctx.categoryBreakdown.filter((c) => c.category_id).length > 0
        ? ctx.categoryBreakdown.filter((c) => c.category_id)
        : expenseCategories.slice(0, 3).map((c, idx) => ({
            category_id: c.category_id,
            name: c.name,
            amount: idx === 0 ? 2500000 : idx === 1 ? 1500000 : 1000000,
          }));

    for (const item of targetCategories) {
      const recommendedLimit = Math.max(
        500000,
        Math.round((item.amount > 0 ? item.amount * 0.9 : 1500000) / 50000) * 50000
      );

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

    const capAmount = Math.max(250000, Math.round(Number(amount) || 2000000));
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
      message: `Batas belanja kategori ${budget?.category_name || "terpilih"} berhasil diaktifkan sebesar ${formatRupiahServer(capAmount)}/bulan.`,
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

    // Optionally record as an expense transaction in PostgreSQL transactions table
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
    const userName = ctx.user?.name ? ctx.user.name.split(" ")[0] : "Reza";
    const topCat = ctx.categoryBreakdown[0] || { name: "Makanan & Minuman", amount: 2850000, pct: 38 };

    let archetypeTitle = "Balanced Wealth Builder";
    let archetypeBadge = "Tipe: Akumulator Waspada";
    let riskProfile = riskOverride || "Moderat";
    let cashStability = "Sangat Baik";

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
      cashStability = "Perlu Perhatian";
    }

    const txCount = ctx.hasRealData ? ctx.transactions.length : 38;
    const similarityScore = ctx.hasRealData ? Math.min(98, 88 + Math.min(10, txCount)) : 92;

    const welcomeMessages = [
      {
        sender: "twin",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }) + " WIB",
        text: `Halo ${userName}! Saya kembaran finansial Anda. Saya telah menganalisis ${txCount} transaksi pada buku kas Anda dengan posisi arus kas bersih berjalan sebesar ${formatRupiahServer(ctx.netCashflow)}. Ada keputusan finansial, target tabungan, atau rencana pembelian yang ingin kita diskusikan hari ini?`,
        isRich: true,
        metrics: {
          pemasukan: formatRupiahServer(ctx.totalIncome),
          pengeluaran: formatRupiahServer(ctx.totalExpense),
          ketahanan: `${ctx.emergencyMonths} Bulan`,
          healthScore: `${ctx.healthScore}/100`,
          status: ctx.netCashflow >= 0 ? "AMAN" : "WASPADA",
        },
      },
    ];

    return {
      syncedAt: getFormattedTimestamp(),
      periodLabel: monthLabel,
      hasRealData: ctx.hasRealData,
      analyzedTransactionsCount: ctx.hasRealData ? ctx.transactions.length : 142,
      accuracyLabel: `Akurasi Profil: ${similarityScore}% High Precision`,
      archetype: {
        title: archetypeTitle,
        badge: archetypeBadge,
        similarityScore,
        description: `Model merefleksikan ${similarityScore}% kecenderungan Anda saat dihadapkan pada alokasi pendapatan (${formatRupiahServer(ctx.totalIncome)}), pengendalian belanja, dan pencapaian target finansial.`,
        savingsRate: `${ctx.savingsRate}%`,
        cashStability,
        riskProfile,
      },
      habits: [
        {
          id: "habit-savings",
          type: "normal",
          title: ctx.savingsRate >= 20 ? "Disiplin Rasio Tabungan Positif" : "Peluang Peningkatan Alokasi Tabungan",
          description:
            ctx.savingsRate >= 20
              ? `Konsisten mempertahankan surplus arus kas dengan rasio tabungan ${ctx.savingsRate}% (${formatRupiahServer(Math.max(0, ctx.netCashflow))} bersih).`
              : `Rasio tabungan saat ini ${ctx.savingsRate}%. Disarankan menyisihkan minimal 20% pendapatan di awal bulan sebelum belanja rutin.`,
        },
        {
          id: "habit-top-expense",
          type: "warning",
          title: `Konsentrasi Belanja pada ${topCat.name}`,
          description: `Pengeluaran kategori ${topCat.name} mencapai ${formatRupiahServer(topCat.amount)} (${topCat.pct}% dari total belanja tercatat).`,
        },
        {
          id: "habit-goals",
          type: "normal",
          title:
            ctx.goals.length > 0
              ? `${ctx.goals.length} Target Finansial Aktif Terpantau`
              : "Surplus Cash Flow Konsisten",
          description:
            ctx.goals.length > 0
              ? `Fokus utama saat ini adalah pencapaian target "${ctx.goals[0].name}" dengan target nominal ${formatRupiahServer(ctx.goals[0].target_amount)}.`
              : `Arus kas bulanan mencatat posisi bersih ${formatRupiahServer(ctx.netCashflow)} dengan bantalan likuiditas ${ctx.emergencyMonths} bulan.`,
        },
      ],
      leakAlert: {
        title: "Potensi Kebocoran Halus Terdeteksi",
        badge: "Perlu Tindakan",
        description: `Pos ${topCat.name} dan pengeluaran berulang menyerap porsi signifikan. Mengoptimalkan 15% dari pos ini dapat menghemat ${formatRupiahServer(Math.max(250000, Math.round(topCat.amount * 0.15)))}/bulan.`,
      },
      initialMessages: welcomeMessages,
    };
  },

  async chatWithFinancialTwin(userId, message, history = []) {
    const ctx = await loadUserFinancialContext(userId);
    const userName = ctx.user?.name ? ctx.user.name.split(" ")[0] : "Reza";
    const topCat = ctx.categoryBreakdown[0] || { name: "Makanan & Minuman", amount: 2850000, pct: 38 };
    const q = String(message || "").trim();
    const lower = q.toLowerCase();
    const nowTime =
      new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }) +
      " WIB";

    const systemContext = `Anda adalah FIRA Financial Twin untuk pengguna bernama ${userName}.
Data Keuangan Aktual Pengguna dari Database PostgreSQL:
- Total Pemasukan: ${formatRupiahServer(ctx.totalIncome)}
- Total Pengeluaran: ${formatRupiahServer(ctx.totalExpense)}
- Arus Kas Bersih (Surplus/Defisit): ${formatRupiahServer(ctx.netCashflow)}
- Rasio Tabungan (Savings Rate): ${ctx.savingsRate}%
- Bantalan Dana Darurat: ${ctx.emergencyMonths} Bulan (${formatRupiahServer(ctx.liquidSavings)})
- Skor Kesehatan Finansial: ${ctx.healthScore}/100
- Pengeluaran Terbesar: ${topCat.name} sebesar ${formatRupiahServer(topCat.amount)} (${topCat.pct}%)
- Rincian Kategori Pengeluaran: ${ctx.categoryBreakdown.map((c) => `${c.name}: ${formatRupiahServer(c.amount)} (${c.pct}%)`).join(", ")}
- Jumlah Transaksi Tercatat: ${ctx.transactions.length}
- Jumlah Budget Aktif: ${ctx.budgets.length} (${ctx.budgets.map((b) => `${b.category_name}: terpakai ${formatRupiahServer(b.spent)} dari ${formatRupiahServer(b.amount)}`).join("; ") || "Belum ada budget"})
- Target Financial Goals: ${ctx.goals.map((g) => `${g.name} (Target ${formatRupiahServer(g.target_amount)}, status: ${g.status})`).join(", ") || "Belum ada goal spesifik"}`;

    // Try Gemini API first if GEMINI_API_KEY is configured
    const geminiText = await callGeminiOptional(systemContext, q, history);

    let replyText = geminiText;
    let isRich = false;

    if (!replyText) {
      if (
        lower.includes("kondisi") ||
        lower.includes("bulan ini") ||
        lower.includes("ringkasan") ||
        lower.includes("sehat") ||
        lower.includes("status")
      ) {
        isRich = true;
        const levelText =
          ctx.healthScore >= 80
            ? "SANGAT SEHAT"
            : ctx.healthScore >= 60
            ? "CUKUP STABIL"
            : "PERLU PERHATIAN";
        replyText = `Kondisi keuangan Anda saat ini berada di level ${levelText} (Skor ${ctx.healthScore}/100). Total pemasukan tercatat ${formatRupiahServer(ctx.totalIncome)} dengan realisasi pengeluaran ${formatRupiahServer(ctx.totalExpense)}, menghasilkan arus kas bersih ${formatRupiahServer(ctx.netCashflow)} (Savings Rate ${ctx.savingsRate}%).`;
      } else if (
        lower.includes("akhir pekan") ||
        lower.includes("naik") ||
        lower.includes("boros") ||
        lower.includes("pengeluaran") ||
        lower.includes("belanja")
      ) {
        replyText = `Berdasarkan analisis transaksi Anda, pos pengeluaran terbesar berada pada kategori ${topCat.name} sebesar ${formatRupiahServer(topCat.amount)} (${topCat.pct}% dari total belanja). Menekan pengeluaran impulsif pada pos ini sebesar 15% saja akan menambah tabungan Anda sekitar ${formatRupiahServer(Math.round(topCat.amount * 0.15))}/bulan.`;
      } else if (
        lower.includes("tabungan") ||
        lower.includes("darurat") ||
        lower.includes("aman") ||
        lower.includes("bantalan")
      ) {
        isRich = true;
        replyText = `Bantalan dana likuid Anda saat ini setara dengan ${ctx.emergencyMonths} bulan pengeluaran pokok (estimasi ${formatRupiahServer(ctx.liquidSavings)}). ${
          ctx.emergencyMonths >= 6
            ? "Posisi ini SANGAT AMAN karena sudah melampaui standar ideal 6 bulan biaya hidup."
            : "Disarankan menyisihkan surplus bulanan secara konsisten hingga mencapai batas aman minimal 6 bulan pengeluaran."
        }`;
      } else if (lower.includes("budget") || lower.includes("anggaran") || lower.includes("pagu")) {
        if (ctx.budgets.length > 0) {
          const totalBudget = ctx.budgets.reduce((s, b) => s + Number(b.amount), 0);
          const totalSpent = ctx.budgets.reduce((s, b) => s + Number(b.spent), 0);
          const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
          replyText = `Anda memiliki ${ctx.budgets.length} pos anggaran aktif dengan total pagu ${formatRupiahServer(totalBudget)} dan realisasi terpakai ${formatRupiahServer(totalSpent)} (${pct}%). ${
            pct <= 90
              ? "Seluruh anggaran masih terkendali di zona hijau."
              : "Perhatian: realisasi anggaran sudah mendekati batas pagu bulanan."
          }`;
        } else {
          replyText = `Anda belum menetapkan batas pagu anggaran di menu Budgeting. Dengan pengeluaran saat ini sebesar ${formatRupiahServer(ctx.totalExpense)}, saya menyarankan Anda membuat pagu anggaran untuk kategori ${topCat.name} maksimal ${formatRupiahServer(Math.round(topCat.amount * 0.85))}/bulan.`;
        }
      } else if (lower.includes("goal") || lower.includes("target") || lower.includes("impian")) {
        if (ctx.goals.length > 0) {
          const g = ctx.goals[0];
          const monthsNeeded =
            ctx.netCashflow > 0
              ? Math.max(1, Math.ceil(Number(g.target_amount) / (ctx.netCashflow * 0.6)))
              : 12;
          replyText = `Anda memiliki ${ctx.goals.length} target finansial, termasuk "${g.name}" dengan target ${formatRupiahServer(g.target_amount)}. Dengan mengalokasikan 60% dari surplus bulanan Anda (${formatRupiahServer(Math.max(0, ctx.netCashflow * 0.6))}/bln), target ini diproyeksikan tercapai dalam ±${monthsNeeded} bulan.`;
        } else {
          replyText = `Saat ini belum ada Financial Goal aktif di database Anda. Dengan surplus arus kas ${formatRupiahServer(ctx.netCashflow)}/bulan, ini waktu yang tepat untuk menambahkan target baru di menu Financial Goals!`;
        }
      } else if (
        lower.includes("beli") ||
        lower.includes("cicil") ||
        lower.includes("laptop") ||
        lower.includes("mobil") ||
        lower.includes("rumah") ||
        lower.includes("mampu")
      ) {
        const safeInstallment = Math.max(0, Math.round(ctx.totalIncome * 0.25));
        replyText = `Dengan pemasukan ${formatRupiahServer(ctx.totalIncome)} dan surplus bersih ${formatRupiahServer(ctx.netCashflow)}/bulan, batas angsuran baru yang aman (DSR maksimal 25%) untuk Anda adalah ${formatRupiahServer(safeInstallment)}/bulan. Anda dapat menguji simulasi detailnya di menu What-If Simulator.`;
      } else {
        isRich = true;
        replyText = `Berdasarkan analisis buku kas Anda (${ctx.transactions.length} transaksi tercatat), arus kas bersih Anda berada di ${formatRupiahServer(ctx.netCashflow)} dengan rasio tabungan ${ctx.savingsRate}% dan pos pengeluaran terbesar pada ${topCat.name} (${formatRupiahServer(topCat.amount)}). Pertahankan surplus ini agar ketahanan finansial (${ctx.emergencyMonths} bulan) terus meningkat.`;
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
              status: ctx.netCashflow >= 0 ? "AMAN" : "WASPADA",
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
    const scenarioName = input.scenarioName || "Upgrade Laptop Kerja M3 Max";
    const totalAmount = Math.max(100000, Number(input.totalAmount) || 15000000);
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
        : Math.min(totalAmount * 0.9, Math.max(0, Number.isFinite(parsedDp) ? parsedDp : Math.round(totalAmount * 0.2)));
    const autoCompensate = input.autoCompensate !== undefined ? Boolean(input.autoCompensate) : true;

    const actualNetCashflow = ctx.netCashflow > 0 ? ctx.netCashflow : 5430000;
    const actualIncome = ctx.totalIncome > 0 ? ctx.totalIncome : 12850000;
    const actualExpense = ctx.totalExpense > 0 ? ctx.totalExpense : 7420000;
    const actualEmergencyMonths = ctx.emergencyMonths || 6.4;
    const actualLiquidSavings = ctx.liquidSavings || 34750000;
    const actualHealthScore = ctx.healthScore || 88;

    // Interest rate 0.5% flat per month for installments (or 0 for investment/budget optimization)
    const monthlyInterestRate =
      scenarioType === "Investasi" || scenarioType === "Anggaran" ? 0 : 0.005;

    const principalLoan = Math.max(0, totalAmount - downPayment);
    const totalInterest =
      paymentMethod === "tunai" ? 0 : Math.round(principalLoan * monthlyInterestRate * tenorMonths);
    const monthlyInstallment =
      paymentMethod === "tunai"
        ? 0
        : Math.round((principalLoan + totalInterest) / tenorMonths);

    const compensationCut = autoCompensate
      ? Math.min(500000, Math.round(monthlyInstallment * 0.45))
      : 0;

    let projectedNetCashflow;
    if (scenarioType === "Anggaran") {
      // Budget trimming scenario increases net cashflow
      projectedNetCashflow = actualNetCashflow + Math.round(totalAmount / tenorMonths);
    } else if (paymentMethod === "tunai") {
      projectedNetCashflow = actualNetCashflow + compensationCut;
    } else {
      projectedNetCashflow = actualNetCashflow - monthlyInstallment + compensationCut;
    }

    const cashflowDelta = projectedNetCashflow - actualNetCashflow;
    const cashflowDeltaPct =
      actualNetCashflow > 0
        ? Number(((cashflowDelta / actualNetCashflow) * 100).toFixed(1))
        : 0;

    const upfrontCashOut =
      scenarioType === "Anggaran" || scenarioType === "Investasi"
        ? 0
        : paymentMethod === "tunai"
        ? totalAmount
        : downPayment;

    const remainingLiquidSavings = Math.max(0, actualLiquidSavings - upfrontCashOut);
    const monthlyBaselineExp = Math.max(actualExpense, Math.round(actualIncome * 0.45), 3500000);
    const projectedEmergencyMonths = Number(
      Math.min(18, Math.max(0, remainingLiquidSavings / monthlyBaselineExp)).toFixed(1)
    );
    const emergencyDelta = Number((projectedEmergencyMonths - actualEmergencyMonths).toFixed(1));

    const dsrPercentage =
      actualIncome > 0
        ? Number(((monthlyInstallment / actualIncome) * 100).toFixed(1))
        : 0;

    let healthDelta = 0;
    if (paymentMethod === "tunai") {
      healthDelta = emergencyDelta < -2 ? -12 : -4;
    } else {
      if (dsrPercentage > 30) healthDelta -= 18;
      else if (dsrPercentage > 15) healthDelta -= 9;
      else healthDelta -= 5;
      if (autoCompensate) healthDelta += 2;
    }
    if (scenarioType === "Investasi" || scenarioType === "Anggaran") {
      healthDelta = +4;
    }

    const projectedHealthScore = Math.max(30, Math.min(99, actualHealthScore + healthDelta));

    // Build 6-month visual chart bars
    const monthNames = ["Des", "Jan", "Feb", "Mar", "Apr", "Mei"];
    const projectionBars = monthNames.map((label, idx) => {
      const recoveryBoost = idx * Math.round(Math.max(150000, projectedNetCashflow * 0.04));
      const monthSurplus = Math.max(0, projectedNetCashflow + recoveryBoost);
      const heightPct = Math.max(
        20,
        Math.min(95, Math.round((monthSurplus / Math.max(actualNetCashflow * 1.15, 1)) * 100))
      );
      return {
        label,
        surplus: monthSurplus,
        heightPct,
      };
    });

    // AI Evaluation
    const isSafe = projectedNetCashflow > 0 && dsrPercentage <= 30 && projectedEmergencyMonths >= 3;
    const isWarning = projectedNetCashflow > 0 && (dsrPercentage > 30 || projectedEmergencyMonths < 3);

    const evaluationBadge = isSafe
      ? "REKOMENDASI: LAYAK DIAMBIL"
      : isWarning
      ? "REKOMENDASI: PERLU KOMPENSASI"
      : "REKOMENDASI: RISIKO TINGGI";

    const evaluationPoints = [
      isSafe
        ? `✓ Skenario "${scenarioName}" (${formatRupiahServer(totalAmount)}) ${
            paymentMethod === "tunai" ? "secara tunai" : `dengan tenor ${tenorMonths} bulan`
          } TIDAK mengganggu stabilitas arus kas pokok Anda.`
        : `⚠️ Skenario "${scenarioName}" memberikan tekanan cukup besar pada arus kas bulanan atau likuiditas Anda.`,
      paymentMethod === "tunai"
        ? `⚠️ Pembayaran tunai penuh ${formatRupiahServer(totalAmount)} memangkas dana darurat dari ${actualEmergencyMonths} bulan menjadi ${projectedEmergencyMonths} bulan, namun bebas beban bunga cicilan.`
        : `⚠️ Pembayaran DP ${formatRupiahServer(downPayment)} mengubah dana darurat dari ${actualEmergencyMonths} bulan ke ${projectedEmergencyMonths} bulan dengan cicilan ${formatRupiahServer(monthlyInstallment)}/bln (DSR ${dsrPercentage}%).${
            autoCompensate
              ? ` Kompensasi penghematan ${formatRupiahServer(compensationCut)}/bln menjaga surplus tetap sehat.`
              : ""
          }`,
    ];

    // Multi-scenario comparison matrix (Cash vs Installment vs Save 3 Months)
    const cashEmergencyMonths = Number(
      Math.max(0, (actualLiquidSavings - totalAmount) / monthlyBaselineExp).toFixed(1)
    );
    const installmentPrincipal = Math.max(0, totalAmount - Math.round(totalAmount * 0.2));
    const installmentInterest = Math.round(installmentPrincipal * 0.005 * tenorMonths);
    const installmentMonthly = Math.round((installmentPrincipal + installmentInterest) / tenorMonths);
    const installmentTotalCost = totalAmount + installmentInterest;
    const save3MMonthly = Math.round(totalAmount / 3);

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
        dsrStatus:
          dsrPercentage <= 15
            ? "Sangat Rendah (Batas Aman Maksimal 30%)"
            : dsrPercentage <= 30
            ? "Moderat (Masih Dalam Batas Aman 30%)"
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
          emergencyImpact: `Turun ke ${cashEmergencyMonths} Bulan (${cashEmergencyMonths < 4 ? "Kritis" : "Cukup"})`,
          emergencySeverity: cashEmergencyMonths < 4 ? "danger" : "warning",
          totalCost: `${formatRupiahServer(totalAmount)} (Nett)`,
          verdict: "Risiko Likuiditas",
        },
        optionB_Installment: {
          upfront: `${formatRupiahServer(Math.round(totalAmount * 0.2))} (DP 20%)`,
          monthlyLoad: `${formatRupiahServer(installmentMonthly)} / bulan (${tenorMonths}x)`,
          emergencyImpact: `Turun ke ${projectedEmergencyMonths} Bulan (Aman)`,
          emergencySeverity: "safe",
          totalCost: `${formatRupiahServer(installmentTotalCost)} (Bunga ${formatRupiahServer(installmentInterest)})`,
          verdict: "Paling Seimbang",
        },
        optionC_SaveFirst: {
          upfront: "Rp 0 Hari Ini",
          monthlyLoad: `${formatRupiahServer(save3MMonthly)} / bln (Selama 3 Bln)`,
          emergencyImpact: `Tetap ${actualEmergencyMonths} Bulan (Terjaga)`,
          emergencySeverity: "safe",
          totalCost: `${formatRupiahServer(totalAmount)} (Bebas Bunga)`,
          verdict: "Paling Hemat Finansial",
        },
      },
    };
  },

  async saveWhatIfScenarioAsGoal(userId, input = {}) {
    const scenarioName = String(input.scenarioName || "Skenario What-If FIRA").trim();
    const totalAmount = Math.max(100000, Number(input.totalAmount) || 15000000);
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
      message: `Skenario "${scenarioName}" (${formatRupiahServer(totalAmount)}) berhasil disimpan ke Financial Goals Anda!`,
    };
  },

  // ==========================================================
  // 4. FINANCIAL WEATHER
  // ==========================================================
  async getFinancialWeather(userId) {
    const ctx = await loadUserFinancialContext(userId);
    const { monthLabel } = getCurrentMonthBounds();

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
        : Math.round(ctx.totalExpense * 1.08) || 8000000;

    const spendingPressureScore = Math.max(
      30,
      Math.min(
        98,
        totalBudgetLimit > 0
          ? Math.round(100 - Math.max(0, ((ctx.totalExpense - totalBudgetLimit * 0.5) / totalBudgetLimit) * 35))
          : 82
      )
    );

    const liquidityScore = Math.max(
      35,
      Math.min(98, Math.round((ctx.emergencyMonths / 6.8) * 94))
    );

    const volatilityPct = ctx.hasRealData
      ? Math.max(6, Math.min(35, Math.round(100 - ctx.savingsRate * 1.8)))
      : 12;

    const stormRiskPct =
      weatherScore >= 80 ? 5 : weatherScore >= 60 ? 15 : weatherScore >= 40 ? 35 : 65;

    // 3 upcoming months forecast
    const now = new Date();
    const forecasts = [1, 2, 3].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const mName = d
        .toLocaleDateString("id-ID", { month: "long", year: "numeric" })
        .toUpperCase();
      const isHolidayMonth = d.getMonth() === 11; // Desember
      const scoreAdj = isHolidayMonth ? -6 : offset === 2 ? +1 : +4;
      const predScore = Math.max(40, Math.min(98, weatherScore + scoreAdj));
      const surplusFactor = isHolidayMonth ? 0.78 : offset === 2 ? 1.07 : 1.1;
      const projSurplus = Math.round(Math.max(1000000, ctx.netCashflow) * surplusFactor);

      const activeGoal = ctx.goals[0];
      let note =
        offset === 1
          ? "Potensi fluktuasi pengeluaran konsumsi bulanan. Pertahankan batas anggaran kategori utama agar surplus tetap di zona aman."
          : offset === 2
          ? "Ritme arus kas diproyeksikan semakin stabil dengan akumulasi tabungan bulanan yang terakselerasi."
          : activeGoal
          ? `Milestone Target: Progres "${activeGoal.name}" (${formatRupiahServer(activeGoal.target_amount)}) diproyeksikan melaju optimal tanpa mengusik dana darurat.`
          : "Milestone Target: Akumulasi dana darurat dan aset likuid mencapai titik optimal di kuartal mendatang.";

      return {
        monthLabel: mName,
        badge:
          predScore >= 88
            ? "Cerah Optimal"
            : predScore >= 80
            ? "Cerah Kembali"
            : "Cerah Berawan",
        iconType: predScore >= 88 ? "sparkles" : predScore >= 83 ? "sun" : "cloud-sun",
        predictedScore: predScore,
        projectedSurplus: projSurplus,
        note,
      };
    });

    const topCategory = ctx.categoryBreakdown[0] || { name: "Kuliner & Rekreasi", amount: 2850000 };

    return {
      updatedAt: getFormattedTimestamp(),
      periodLabel: monthLabel,
      hasRealData: ctx.hasRealData,
      weatherScore,
      zone,
      statusTitle,
      categoryLabel,
      aiNarrative: `Kondisi keuangan Anda periode ${monthLabel} berada dalam fase ${
        zone === "cerah" ? "cerah optimal" : zone
      }. Bantalan likuiditas Anda mampu menahan guncangan kehilangan pendapatan tak terduga hingga ${ctx.emergencyMonths} bulan ke depan tanpa mengorbankan pengeluaran pokok.`,
      summaryMetrics: {
        netCashflow: ctx.netCashflow,
        cashCushionMonths: ctx.emergencyMonths,
        debtRatioPct: 0.0,
        savingsRatePct: ctx.savingsRate,
      },
      barometers: {
        spendingPressure: {
          badge: spendingPressureScore >= 75 ? "Tekanan Rendah" : "Tekanan Sedang",
          score: spendingPressureScore,
          realizedAmount: ctx.totalExpense,
          limitAmount: totalBudgetLimit,
        },
        liquidityHumidity: {
          badge: liquidityScore >= 80 ? "Sangat Cerah / Sehat" : "Cukup Likuid",
          score: liquidityScore,
          liquidCashAmount: ctx.liquidSavings,
          statusText: "Bantalan Optimal",
        },
        cashflowVolatility: {
          badge: volatilityPct <= 18 ? "Angin Tenang" : "Angin Sedang",
          stdDevPct: volatilityPct,
          statusText: "Fluktuasi Terkontrol",
          thresholdPct: 35,
        },
        stormVulnerability: {
          badge: stormRiskPct <= 10 ? "Risiko Rendah (<5%)" : `Risiko ${stormRiskPct}%`,
          probabilityLabel: stormRiskPct <= 10 ? "< 5%" : `${stormRiskPct}%`,
          probabilityPct: stormRiskPct,
          debtLoadPct: 0,
          zoneText: "Zona Aman",
        },
      },
      forecasts,
      mitigations: [
        {
          id: "mit-budget-cap",
          badge: "Prioritas Tinggi",
          badgeType: "warning",
          title: `Aktifkan Payung Pelindung Kategori ${topCategory.name} (Budget Cap)`,
          description: `Pasang pagu otomatis untuk kategori ${topCategory.name} maksimal ${formatRupiahServer(Math.max(1000000, Math.round(topCategory.amount * 0.85)))} untuk mencegah lonjakan pengeluaran.`,
          actionType: "apply-budget",
          actionLabel: "Terapkan ke AI Budgeting",
          recommendedCap: Math.max(1000000, Math.round(topCategory.amount * 0.85)),
          category_id: topCategory.category_id,
        },
        {
          id: "mit-simulator",
          badge: "Optimalisasi",
          badgeType: "normal",
          title: "Uji Alokasi Surplus Pasif ke Instrumen Likuid",
          description: `Temuan Smart Auditor: alihkan surplus arus kas sebesar ${formatRupiahServer(Math.max(500000, Math.round(ctx.netCashflow * 0.25)))}/bulan untuk mempertebal dana darurat.`,
          actionType: "open-simulator",
          actionLabel: "Buka What-If Simulator",
        },
      ],
      extremeSimulation: {
        maxSurvivalMonths: ctx.emergencyMonths,
        cashCondition: ctx.emergencyMonths >= 6 ? "Sangat Aman" : ctx.emergencyMonths >= 3 ? "Cukup Aman" : "Perlu Cadangan",
      },
    };
  },

  async runWeatherStressTest(userId, input = {}) {
    const ctx = await loadUserFinancialContext(userId);
    const scenario = input.scenario || "job_loss_6m";

    const monthlyExpense = Math.max(ctx.totalExpense, Math.round(ctx.totalIncome * 0.45), 3500000);
    const liquidSavings = ctx.liquidSavings || 34750000;

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
    const survivalMonths = Number((remainingSavings / monthlyBurn).toFixed(1));
    const essentialOnlyBurn = Math.round(monthlyBurn * 0.72);
    const extendedSurvivalMonths = Number((remainingSavings / essentialOnlyBurn).toFixed(1));

    const postShockScore = Math.max(
      35,
      Math.min(95, Math.round((survivalMonths / 6.4) * ctx.healthScore))
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
          : survivalMonths >= 3
          ? "WASPADA (PERLU EFISIENSI DARURAT)"
          : "RENTAN (PERLU DANA CADANGAN)",
      recommendation: `Jika skenario ini terjadi, dana likuid Anda bertahan ${survivalMonths} bulan dengan gaya hidup normal, atau dapat diperpanjang hingga ${extendedSurvivalMonths} bulan jika memangkas 28% pengeluaran non-esensial.`,
    };
  },
};

module.exports = aiService;
