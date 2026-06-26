import { ref, computed, watch } from 'vue';

// Auth State
const token = ref(localStorage.getItem('wat_token') || '');
const userId = ref(localStorage.getItem('wat_user_id') || '');
const username = ref(localStorage.getItem('wat_username') || '');
const onboarded = ref(localStorage.getItem('wat_onboarded') === '1' ? 1 : 0);

// Currency Swapper State
const activeCurrency = ref(localStorage.getItem('wat_active_currency') || 'USD');

// Navigation View State
const currentView = ref('dashboard');

// Quick Add Modal State
const showAddTxModal = ref(false);

// Database state from Server
// Caching Helpers
const getCachedJson = (key, defaultValue) => {
  const cached = localStorage.getItem(key);
  try {
    return cached ? JSON.parse(cached) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// Initialize from local cache to prevent flashing empty states on refresh
const exchangeRate = ref(getCachedJson('wat_exchange_rate', { rate: 35.0, lastUpdated: '' }));
const projectCosts = ref(getCachedJson('wat_project_costs', []));
const transactions = ref(getCachedJson('wat_transactions', []));
const newlyAddedTxId = ref('');
const savingsGoal = ref(getCachedJson('wat_savings_goal', { title: 'เงินออมเพื่อการท่องเที่ยว 🗽', targetAmount: 0.0, currency: 'USD' }));
const countdowns = ref(getCachedJson('wat_countdowns', { next_payday: '', pay_cycle: 'weekly', next_rent_day: '', rent_cycle: 'weekly', rent_amount: 150 }));
const jobs = ref(getCachedJson('wat_jobs', []));
const workLogs = ref(getCachedJson('wat_work_logs', []));

// Loading & Cache check states
const isLoading = ref(token.value ? true : false);

const isCacheEmpty = computed(() => {
  return transactions.value.length === 0 && 
         projectCosts.value.length === 0 && 
         jobs.value.length === 0 && 
         workLogs.value.length === 0;
});

// Custom Modal State
const customModal = ref({
  show: false,
  title: '',
  message: '',
  type: 'alert', // 'alert' | 'confirm'
  resolve: null
});

const showAlert = (message, title = 'แจ้งเตือน 📢') => {
  return new Promise((resolve) => {
    customModal.value = {
      show: true,
      title,
      message,
      type: 'alert',
      resolve
    };
  });
};

const showConfirm = (message, title = 'ยืนยันการทำรายการ ❓') => {
  return new Promise((resolve) => {
    customModal.value = {
      show: true,
      title,
      message,
      type: 'confirm',
      resolve
    };
  });
};

const handleModalConfirm = () => {
  const resolve = customModal.value.resolve;
  customModal.value.show = false;
  if (resolve) resolve(true);
};

const handleModalCancel = () => {
  const resolve = customModal.value.resolve;
  customModal.value.show = false;
  if (resolve) resolve(false);
};

// API helper
const apiCall = async (url, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`;
  }

  try {
    const options = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'API call failed');
    }
    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
};

// Authentication callbacks
const handleAuthSuccess = (authData) => {
  token.value = authData.token;
  userId.value = authData.userId;
  username.value = authData.username;
  onboarded.value = authData.onboarded;

  localStorage.setItem('wat_token', authData.token);
  localStorage.setItem('wat_user_id', authData.userId);
  localStorage.setItem('wat_username', authData.username);
  localStorage.setItem('wat_onboarded', authData.onboarded ? '1' : '0');

  isLoading.value = true;
  fetchDashboardData();
};

const logout = () => {
  token.value = '';
  userId.value = '';
  username.value = '';
  onboarded.value = 0;
  localStorage.removeItem('wat_token');
  localStorage.removeItem('wat_user_id');
  localStorage.removeItem('wat_username');
  localStorage.removeItem('wat_onboarded');
  
  // Clear cached database states
  localStorage.removeItem('wat_exchange_rate');
  localStorage.removeItem('wat_project_costs');
  localStorage.removeItem('wat_transactions');
  localStorage.removeItem('wat_savings_goal');
  localStorage.removeItem('wat_countdowns');
  localStorage.removeItem('wat_jobs');
  localStorage.removeItem('wat_work_logs');
  localStorage.removeItem('wat_celebrated_breakeven');
};

const handleChangeCurrency = (currency) => {
  activeCurrency.value = currency;
  localStorage.setItem('wat_active_currency', currency);
};

const handleOnboardingComplete = () => {
  onboarded.value = 1;
  localStorage.setItem('wat_onboarded', '1');
  fetchDashboardData();
};

// Helper to roll date forward on frontend
const rollDateForwardClient = (dateStr, cycle) => {
  if (!dateStr) return '';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(dateStr);
  if (isNaN(target.getTime())) return dateStr;
  
  while (target < today) {
    if (cycle === 'weekly') {
      target.setDate(target.getDate() + 7);
    } else if (cycle === 'bi-weekly') {
      target.setDate(target.getDate() + 14);
    } else if (cycle === 'monthly') {
      target.setMonth(target.getMonth() + 1);
    } else {
      break;
    }
  }
  return target.toISOString().split('T')[0];
};

const checkAndRolloverCountdowns = async () => {
  const c = countdowns.value;
  if (!c) return;
  
  const payday = c.next_payday || c.nextPayday;
  const rentDay = c.next_rent_day || c.nextRentDay;
  const payCycle = c.pay_cycle || c.payCycle || 'weekly';
  const rentCycle = c.rent_cycle || c.rentCycle || 'weekly';
  
  const rolledPayday = rollDateForwardClient(payday, payCycle);
  const rolledRentDay = rollDateForwardClient(rentDay, rentCycle);
  
  if (rolledPayday !== payday || rolledRentDay !== rentDay) {
    if (c.next_payday !== undefined) c.next_payday = rolledPayday;
    if (c.nextPayday !== undefined) c.nextPayday = rolledPayday;
    if (c.next_rent_day !== undefined) c.next_rent_day = rolledRentDay;
    if (c.nextRentDay !== undefined) c.nextRentDay = rolledRentDay;
    
    try {
      const payload = {
        nextPayday: rolledPayday,
        payCycle: payCycle,
        nextRentDay: rolledRentDay,
        rentCycle: rentCycle,
        rentAmount: c.rent_amount !== undefined ? c.rent_amount : c.rentAmount,
        weeklyExpenseTarget: c.weekly_expense_target !== undefined ? c.weekly_expense_target : c.weeklyExpenseTarget,
        projectStartDate: c.project_start_date !== undefined ? c.project_start_date : c.projectStartDate,
        projectEndDate: c.project_end_date !== undefined ? c.project_end_date : c.projectEndDate
      };
      const resultCountdowns = await apiCall('/api/countdowns', 'PUT', payload);
      countdowns.value = resultCountdowns;
    } catch (e) {
      console.error('Failed to auto-rollover countdowns:', e);
    }
  }
};

// Fetch Dashboard Data from Backend API
const fetchDashboardData = async () => {
  if (!token.value) return;
  isLoading.value = true;
  try {
    const data = await apiCall('/api/data');
    exchangeRate.value = data.exchangeRate;
    projectCosts.value = data.projectCosts;
    transactions.value = data.transactions;
    savingsGoal.value = data.savingsGoal;
    countdowns.value = data.countdowns;
    onboarded.value = data.onboarded;
    jobs.value = data.jobs || [];
    workLogs.value = data.workLogs || [];
    localStorage.setItem('wat_onboarded', data.onboarded ? '1' : '0');
    
    // Proactively check and rollover past dates if returned by server
    await checkAndRolloverCountdowns();
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  } finally {
    isLoading.value = false;
  }
};

// Convert value to Active Display Currency
const convertToActiveCurrency = (amount, originalCurrency) => {
  const amt = parseFloat(amount);
  if (isNaN(amt)) return 0;
  if (originalCurrency === activeCurrency.value) return amt;
  
  const rate = parseFloat(exchangeRate.value?.rate) || 35.0;
  
  if (originalCurrency === 'USD' && activeCurrency.value === 'THB') {
    return amt * rate;
  } else if (originalCurrency === 'THB' && activeCurrency.value === 'USD') {
    return amt / rate;
  }
  return amt;
};

// Dashboard Computations
const projectCostsTotal = computed(() => {
  return projectCosts.value.reduce((sum, item) => {
    const amt = parseFloat(item.amount);
    const validAmt = isNaN(amt) ? 0 : amt;
    return sum + convertToActiveCurrency(validAmt, item.currency);
  }, 0);
});

const totalIncome = computed(() => {
  return transactions.value.reduce((sum, tx) => {
    if (tx.type === 'income') {
      const amt = parseFloat(tx.amount);
      const validAmt = isNaN(amt) ? 0 : amt;
      return sum + convertToActiveCurrency(validAmt, tx.currency);
    }
    return sum;
  }, 0);
});

const dailyExpenses = computed(() => {
  return transactions.value.reduce((sum, tx) => {
    if (tx.type === 'expense') {
      const amt = parseFloat(tx.amount);
      const validAmt = isNaN(amt) ? 0 : amt;
      return sum + convertToActiveCurrency(validAmt, tx.currency);
    }
    return sum;
  }, 0);
});

const rentAndDepositTotal = computed(() => {
  return transactions.value.reduce((sum, tx) => {
    if (tx.type === 'expense' && (tx.category === 'rent' || tx.category === 'deposit')) {
      const amt = parseFloat(tx.amount);
      const validAmt = isNaN(amt) ? 0 : amt;
      return sum + convertToActiveCurrency(validAmt, tx.currency);
    }
    return sum;
  }, 0);
});

const otherExpensesTotal = computed(() => {
  return transactions.value.reduce((sum, tx) => {
    if (tx.type === 'expense' && tx.category !== 'rent' && tx.category !== 'deposit') {
      const amt = parseFloat(tx.amount);
      const validAmt = isNaN(amt) ? 0 : amt;
      return sum + convertToActiveCurrency(validAmt, tx.currency);
    }
    return sum;
  }, 0);
});

// Calculate actual weekly variable expense based on the last 4 weeks (excluding rent and deposit)
const actualWeeklyExpenseTotal = computed(() => {
  const expenseTx = transactions.value.filter(t => t.type === 'expense' && t.category !== 'rent' && t.category !== 'deposit');
  if (expenseTx.length === 0) return 0;
  
  const now = new Date();
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(now.getDate() - 28);
  
  // Filter transactions in last 28 days
  const recentTx = expenseTx.filter(t => new Date(t.date) >= fourWeeksAgo);
  if (recentTx.length === 0) {
    // Fall back to all history if no recent expenses
    const dates = expenseTx.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates));
    const diffDays = Math.ceil(Math.max(1, (now - minDate) / (1000 * 60 * 60 * 24)));
    const elapsedWeeks = Math.max(1, diffDays / 7);
    
    // Sum variable expenses in history
    const totalAll = expenseTx.reduce((sum, tx) => {
      const amt = parseFloat(tx.amount) || 0;
      return sum + convertToActiveCurrency(amt, tx.currency);
    }, 0);
    return totalAll / elapsedWeeks;
  }
  
  const totalRecent = recentTx.reduce((sum, tx) => {
    const amt = parseFloat(tx.amount) || 0;
    return sum + convertToActiveCurrency(amt, tx.currency);
  }, 0);
  
  const dates = recentTx.map(t => new Date(t.date));
  const minDate = new Date(Math.min(...dates));
  const diffDays = Math.ceil(Math.max(1, (now - minDate) / (1000 * 60 * 60 * 24)));
  const elapsedWeeks = Math.min(4, Math.max(1, diffDays / 7));
  
  return totalRecent / elapsedWeeks;
});

// Helper to determine the current calendar week's start (Monday) and end (Sunday) dates
const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day); // Mon = 1, Sun = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
};

// Calculate actual expenses spent strictly within this calendar week (Mon - Sun), excluding rent and deposit
const currentWeekExpenseTotal = computed(() => {
  const { monday, sunday } = getCurrentWeekRange();
  
  return transactions.value.reduce((sum, tx) => {
    if (tx.type === 'expense' && tx.category !== 'rent' && tx.category !== 'deposit') {
      const txDate = new Date(tx.date + 'T00:00:00');
      if (txDate >= monday && txDate <= sunday) {
        const amt = parseFloat(tx.amount) || 0;
        return sum + convertToActiveCurrency(amt, tx.currency);
      }
    }
    return sum;
  }, 0);
});

// Format the date range text for the current week
const currentWeekRangeText = computed(() => {
  const { monday, sunday } = getCurrentWeekRange();
  const fmt = (dt) => dt.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
});

const totalExpenses = computed(() => {
  // Total expenses include daily expenses + initial project costs
  return dailyExpenses.value + (parseFloat(projectCostsTotal.value) || 0);
});

const netBalance = computed(() => {
  const inc = parseFloat(totalIncome.value) || 0;
  const exp = parseFloat(totalExpenses.value) || 0;
  return inc - exp;
});

const roi = computed(() => {
  const costs = parseFloat(projectCostsTotal.value) || 0;
  const income = parseFloat(totalIncome.value) || 0;
  if (costs <= 0) return 0;
  const pct = (income / costs) * 100;
  return isNaN(pct) ? 0 : pct;
});

// CRUD and updates callbacks
const handleAddTransaction = async (newTx) => {
  try {
    const createdTx = await apiCall('/api/transactions', 'POST', newTx);
    transactions.value.unshift(createdTx);
    newlyAddedTxId.value = createdTx.id;
    setTimeout(() => {
      if (newlyAddedTxId.value === createdTx.id) {
        newlyAddedTxId.value = '';
      }
    }, 3000);
  } catch (err) {
    await showAlert(`ไม่สามารถเพิ่มรายการได้: ${err.message}`, 'เกิดข้อผิดพลาด ❌');
  }
};

const handleQuickAddTransaction = async (newTx) => {
  await handleAddTransaction(newTx);
  showAddTxModal.value = false;
};

const handleDeleteTransaction = async (txId) => {
  const isConfirmed = await showConfirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?', 'ยืนยันการลบรายการ 🗑️');
  if (!isConfirmed) return;
  try {
    await apiCall(`/api/transactions/${txId}`, 'DELETE');
    transactions.value = transactions.value.filter(tx => tx.id !== txId);
  } catch (err) {
    await showAlert(`ไม่สามารถลบรายการได้: ${err.message}`, 'เกิดข้อผิดพลาด ❌');
  }
};

const handleUpdateProjectCosts = async (updatedCosts) => {
  try {
    const resultCosts = await apiCall('/api/project-costs', 'PUT', updatedCosts);
    projectCosts.value = resultCosts;
  } catch (err) {
    await showAlert(`ไม่สามารถบันทึกค่าโครงการได้: ${err.message}`, 'เกิดข้อผิดพลาด ❌');
  }
};

const handleUpdateRate = async (newRate) => {
  try {
    const rateResult = await apiCall('/api/exchange-rate', 'PUT', { rate: newRate });
    exchangeRate.value = rateResult;
  } catch (err) {
    await showAlert(`ไม่สามารถอัปเดตอัตราแลกเปลี่ยนได้: ${err.message}`, 'เกิดข้อผิดพลาด ❌');
  }
};

const handleUpdateGoal = async (newGoal) => {
  try {
    const goalResult = await apiCall('/api/goals', 'PUT', newGoal);
    savingsGoal.value = goalResult;
  } catch (err) {
    await showAlert(`ไม่สามารถอัปเดตเป้าหมายได้: ${err.message}`, 'เกิดข้อผิดพลาด ❌');
  }
};

const handleUpdateCountdowns = async (newCountdowns) => {
  try {
    const resultCountdowns = await apiCall('/api/countdowns', 'PUT', newCountdowns);
    countdowns.value = resultCountdowns;
  } catch (err) {
    await showAlert(`ไม่สามารถอัปเดตการตั้งค่าการนับถอยหลังได้: ${err.message}`, 'เกิดข้อผิดพลาด ❌');
  }
};

// ---- Job Tracker Helpers ----
const JOB_LABELS = { main: 'งานหลัก', second: 'งานสอง', third: 'งานสาม', other: 'งานอื่นๆ' };
const jobTypeLabel = (t) => JOB_LABELS[t] || t;

const calcLogHours = (log) => {
  if (!log.start_time || !log.end_time) return 0;
  const [sh, sm] = log.start_time.split(':').map(Number);
  const [eh, em] = log.end_time.split(':').map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm) - (parseInt(log.break_minutes) || 0);
  return Math.max(0, totalMin / 60);
};

const getJobRate = (jobType) => {
  const job = jobs.value.find(j => j.job_type === jobType);
  return job ? parseFloat(job.hourly_rate) || 0 : 0;
};

const getJobTaxRate = (jobType) => {
  const job = jobs.value.find(j => j.job_type === jobType);
  return job ? Math.min(100, Math.max(0, parseFloat(job.tax_rate) || 0)) : 0;
};

const calcNetEarnings = (h, jobType) => {
  const gross = h * getJobRate(jobType);
  return gross * (1 - getJobTaxRate(jobType) / 100);
};

// Cumulative stats per job type
const cumulativeStats = computed(() => {
  const stats = {};
  workLogs.value.forEach(log => {
    if (!stats[log.job_type]) stats[log.job_type] = { hours: 0, earnings: 0 };
    const h = calcLogHours(log);
    stats[log.job_type].hours += h;
    stats[log.job_type].earnings += calcNetEarnings(h, log.job_type);
  });
  return stats;
});

// Weekly rows: group logs by ISO week (Mon-Sun)
const getISOWeekLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  // Get Monday of that week
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (dt) => dt.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}`;
};

const weeklyRows = computed(() => {
  const weekMap = {};
  workLogs.value.forEach(log => {
    const weekLabel = getISOWeekLabel(log.date);
    if (!weekMap[weekLabel]) weekMap[weekLabel] = { week: weekLabel, byJob: {}, totalHours: 0, totalEarnings: 0, _firstDate: log.date };
    if (!weekMap[weekLabel].byJob[log.job_type]) weekMap[weekLabel].byJob[log.job_type] = { hours: 0, earnings: 0 };
    const h = calcLogHours(log);
    const e = calcNetEarnings(h, log.job_type);
    weekMap[weekLabel].byJob[log.job_type].hours += h;
    weekMap[weekLabel].byJob[log.job_type].earnings += e;
    weekMap[weekLabel].totalHours += h;
    weekMap[weekLabel].totalEarnings += e;
  });
  return Object.values(weekMap).sort((a, b) => b._firstDate.localeCompare(a._firstDate));
});

// Job Tracker API Handlers
const handleUpdateJobs = async (updatedJobs) => {
  try {
    const result = await apiCall('/api/jobs', 'PUT', { jobs: updatedJobs });
    jobs.value = result;
  } catch (err) {
    await showAlert(`ไม่สามารถบันทึกข้อมูลงานได้: ${err.message}`, 'เกิดข้อผิดพลาด ❌');
  }
};

const handleAddWorkLog = async (logData) => {
  try {
    const newLog = await apiCall('/api/work-logs', 'POST', logData);
    workLogs.value.unshift(newLog);
  } catch (err) {
    await showAlert(`ไม่สามารถบันทึกชั่วโมงงานได้: ${err.message}`, 'เกิดข้อผิดพลาด ❌');
  }
};

const handleDeleteWorkLog = async (logId) => {
  try {
    await apiCall(`/api/work-logs/${logId}`, 'DELETE');
    workLogs.value = workLogs.value.filter(w => w.id !== logId);
  } catch (err) {
    await showAlert(`ไม่สามารถลบรายการได้: ${err.message}`, 'เกิดข้อผิดพลาด ❌');
  }
};

// Celebration state
const showCelebrateModal = ref(false);

const closeCelebrateModal = () => {
  showCelebrateModal.value = false;
  localStorage.setItem('wat_celebrated_breakeven', '1');
};

watch(roi, (newRoi) => {
  if (newRoi >= 100) {
    if (localStorage.getItem('wat_celebrated_breakeven') !== '1') {
      showCelebrateModal.value = true;
    }
  } else {
    // Reset celebration state if they drop below 100%
    localStorage.removeItem('wat_celebrated_breakeven');
  }
});

// Watch database states to automatically save changes to local storage cache
watch(exchangeRate, (newVal) => localStorage.setItem('wat_exchange_rate', JSON.stringify(newVal)), { deep: true });
watch(projectCosts, (newVal) => localStorage.setItem('wat_project_costs', JSON.stringify(newVal)), { deep: true });
watch(transactions, (newVal) => localStorage.setItem('wat_transactions', JSON.stringify(newVal)), { deep: true });
watch(savingsGoal, (newVal) => localStorage.setItem('wat_savings_goal', JSON.stringify(newVal)), { deep: true });
watch(countdowns, (newVal) => localStorage.setItem('wat_countdowns', JSON.stringify(newVal)), { deep: true });
watch(jobs, (newVal) => localStorage.setItem('wat_jobs', JSON.stringify(newVal)), { deep: true });
watch(workLogs, (newVal) => localStorage.setItem('wat_work_logs', JSON.stringify(newVal)), { deep: true });

export function useFinancials() {
  return {
    // Auth
    token,
    userId,
    username,
    onboarded,
    logout,
    handleAuthSuccess,
    handleChangeCurrency,
    handleOnboardingComplete,
    
    // UI/Nav
    currentView,
    activeCurrency,
    showAddTxModal,
    showCelebrateModal,
    closeCelebrateModal,
    isLoading,
    isCacheEmpty,
    
    // Custom Dialogs
    customModal,
    showAlert,
    showConfirm,
    handleModalConfirm,
    handleModalCancel,
    
    // DB Data
    exchangeRate,
    projectCosts,
    transactions,
    newlyAddedTxId,
    savingsGoal,
    countdowns,
    jobs,
    workLogs,
    
    // Operations
    fetchDashboardData,
    checkAndRolloverCountdowns,
    convertToActiveCurrency,
    handleAddTransaction,
    handleQuickAddTransaction,
    handleDeleteTransaction,
    handleUpdateProjectCosts,
    handleUpdateRate,
    handleUpdateGoal,
    handleUpdateCountdowns,
    
    // Job Operations & Helper
    jobTypeLabel,
    cumulativeStats,
    weeklyRows,
    handleUpdateJobs,
    handleAddWorkLog,
    handleDeleteWorkLog,
    
    // Computed Metrics
    projectCostsTotal,
    totalIncome,
    dailyExpenses,
    rentAndDepositTotal,
    otherExpensesTotal,
    actualWeeklyExpenseTotal,
    currentWeekExpenseTotal,
    currentWeekRangeText,
    totalExpenses,
    netBalance,
    roi
  };
}
