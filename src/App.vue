<template>
  <div class="container">
    <!-- Unauthenticated View -->
    <LoginRegister v-if="!token" @auth-success="handleAuthSuccess" />

    <!-- Loading View (No cache available yet) -->
    <div v-else-if="isLoading && isCacheEmpty" class="neo-card" style="text-align: center; margin: 80px auto; max-width: 500px; padding: 40px; background-color: #FFE135; border-width: 4px; box-shadow: 8px 8px 0px #000; border-style: solid; border-color: #000;">
      <h2 class="heading-font" style="margin-bottom: 20px;">กำลังโหลดข้อมูลการเงินของคุณ... ✈️</h2>
      <div style="font-size: 3.5rem; margin: 20px 0; animation: celebrateBounce 0.6s infinite alternate ease-in-out; display: inline-block;">💼</div>
      <p style="margin-top: 20px; font-weight: bold;">กรุณารอคู่หู J-1 ดึงข้อมูลจากคลาวด์สักครู่</p>
    </div>

    <!-- Onboarding View -->
    <OnboardingWizard 
      v-else-if="onboarded !== 1" 
      :token="token" 
      @onboarding-complete="handleOnboardingComplete" 
      @change-currency="handleChangeCurrency" 
    />

    <!-- Authenticated View -->
    <div v-else>
      <!-- Header -->
      <header>
        <div class="logo-section">
          <h1 class="heading-font">Work And Travel EXPENSE TRACKER ✈️</h1>
        </div>
        
        <div class="user-controls">
          <span class="username-tag">👤 ผู้ใช้: {{ username }}</span>
          <button @click="logout" class="neo-btn danger-btn" style="padding: 6px 12px; font-size: 0.75rem; box-shadow: 2px 2px 0px #000; border-width: 2px;">
            ออกจากระบบ 🚪
          </button>
        </div>
      </header>

      <!-- Settings Exchange Rate / Currency selector -->
      <ExchangeRate 
        :exchange-rate="exchangeRate"
        :active-currency="activeCurrency"
        @update-rate="handleUpdateRate"
        @change-currency="handleChangeCurrency"
      />

      <!-- Navigation Tabs -->
      <div class="neo-tabs" style="margin-bottom: 24px; justify-content: flex-start; gap: 12px; flex-wrap: wrap;">
        <button 
          @click="currentView = 'dashboard'" 
          :class="['neo-tab-btn', currentView === 'dashboard' ? 'active' : '']"
          style="padding: 10px 20px; font-size: 0.85rem; border-width: 3px; box-shadow: 3px 3px 0px #000;"
        >
          📊 แดชบอร์ด & เป้าหมาย (Dashboard)
        </button>
        <button 
          @click="currentView = 'planner'" 
          :class="['neo-tab-btn', currentView === 'planner' ? 'active' : '']"
          style="padding: 10px 20px; font-size: 0.85rem; border-width: 3px; box-shadow: 3px 3px 0px #000;"
        >
          🎯 วางแผนคืนทุน (Planner)
        </button>
        <button 
          @click="currentView = 'transactions'" 
          :class="['neo-tab-btn', currentView === 'transactions' ? 'active' : '']"
          style="padding: 10px 20px; font-size: 0.85rem; border-width: 3px; box-shadow: 3px 3px 0px #000;"
        >
          💸 บันทึกรายวัน & ประวัติ (Transactions)
        </button>
        <button 
          @click="currentView = 'jobs'" 
          :class="['neo-tab-btn', currentView === 'jobs' ? 'active' : '']"
          style="padding: 10px 20px; font-size: 0.85rem; border-width: 3px; box-shadow: 3px 3px 0px #000;"
        >
          🏢 บันทึกชั่วโมงงาน (Work Hours)
        </button>
      </div>

      <!-- Tab 1: Dashboard View -->
      <div v-if="currentView === 'dashboard'">
        <!-- Quick Statistics Summary cards -->
        <DashboardCard 
          :total-income="totalIncome"
          :total-expenses="totalExpenses"
          :daily-expenses="dailyExpenses"
          :net-balance="netBalance"
          :roi="roi"
          :project-costs-total="projectCostsTotal"
          :active-currency="activeCurrency"
        />

        <div class="main-grid">
          <!-- Left Column: Goals and Countdowns -->
          <div>
            <GoalTracker 
              :savings-goal="savingsGoal"
              :net-balance="netBalance"
              :exchange-rate="exchangeRate"
              :active-currency="activeCurrency"
              @update-goal="handleUpdateGoal"
            />

            <CountdownCards 
              :countdowns="countdowns"
              :exchange-rate="exchangeRate"
              :active-currency="activeCurrency"
              :actual-weekly-expense-total="actualWeeklyExpenseTotal"
              @update-countdowns="handleUpdateCountdowns"
            />

            <WeeklyBudgetCard 
              :countdowns="countdowns"
              :exchange-rate="exchangeRate"
              :active-currency="activeCurrency"
              :actual-weekly-expense-total="actualWeeklyExpenseTotal"
              @update-countdowns="handleUpdateCountdowns"
            />
          </div>

          <!-- Right Column: Badges & J-1 Mascot -->
          <div>
            <BadgesContainer 
              :transactions="transactions"
              :net-balance="netBalance"
              :savings-goal="savingsGoal"
              :exchange-rate="exchangeRate"
              :active-currency="activeCurrency"
              :roi="roi"
            />
            <J1Mascot 
              :transactions="transactions"
              :net-balance="netBalance"
              :savings-goal="savingsGoal"
              :exchange-rate="exchangeRate"
              :active-currency="activeCurrency"
              :roi="roi"
            />
          </div>
        </div>
      </div>

      <!-- Tab 2: Transactions View -->
      <div v-else-if="currentView === 'transactions'">
        <div class="transactions-grid">
          <!-- Left Column: Cost Form (Add daily + edit project costs) -->
          <div>
            <CostForm 
              :project-costs="projectCosts"
              :exchange-rate="exchangeRate"
              @add-transaction="handleAddTransaction"
              @update-project-costs="handleUpdateProjectCosts"
            />
          </div>

          <!-- Right Column: Transactions List -->
          <div>
            <TransactionList 
              :transactions="transactions"
              :exchange-rate="exchangeRate"
              :active-currency="activeCurrency"
              :newly-added-tx-id="newlyAddedTxId"
              @delete-transaction="handleDeleteTransaction"
            />
          </div>
        </div>
      </div>

      <!-- Tab 3: Work Hours / Job Tracker View -->
      <div v-else-if="currentView === 'jobs'">

        <!-- Work Hours Summary Dashboard -->
        <div class="neo-card" style="margin-bottom: 24px; padding: 24px;">
          <h2 class="heading-font" style="font-size: 1.1rem; margin-bottom: 16px;">📈 สรุปชั่วโมงงานสะสม (Cumulative Summary)</h2>
          <div class="wh-summary-grid">
            <div v-for="(job, idx) in jobs" :key="job.job_type" class="wh-summary-card" :class="`wh-card-${idx < 3 ? ['main','second','third'][idx] : 'other'}`">
              <div class="wh-type-label">{{ jobTypeLabel(job.job_type) }}</div>
              <div class="wh-card-title">{{ job.title }}</div>
              <div class="wh-stat-row">
                <span class="wh-stat-label">ชั่วโมงสะสม</span>
                <span class="wh-stat-value">{{ cumulativeStats[job.job_type]?.hours.toFixed(2) ?? '0.00' }} hr</span>
              </div>
              <div class="wh-stat-row">
                <span class="wh-stat-label">รายได้ (est.)</span>
                <span class="wh-stat-value wh-green">${{ cumulativeStats[job.job_type]?.earnings.toFixed(2) ?? '0.00' }}</span>
              </div>
              <div class="wh-stat-row">
                <span class="wh-stat-label">เรต</span>
                <span class="wh-stat-value">${{ job.hourly_rate.toFixed(2) }}/hr</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Breakdown -->
        <div class="neo-card" style="margin-bottom: 24px; padding: 24px;">
          <h2 class="heading-font" style="font-size: 1.1rem; margin-bottom: 4px;">📅 สรุปรายสัปดาห์ (Weekly Breakdown)</h2>
          <p style="font-size: 0.78rem; font-weight: 700; color: var(--color-muted); margin-bottom: 16px;">
            สัปดาห์ = จันทร์ – อาทิตย์ · คำนวณแบบประมาณการณ์เท่านั้น ไม่ได้บันทึกรายได้
          </p>
          <div v-if="weeklyRows.length === 0" style="text-align: center; padding: 24px; font-weight: 700; color: var(--color-muted);">
            ยังไม่มีข้อมูล เริ่มบันทึกชั่วโมงงานด้านล่างได้เลย!
          </div>
          <div v-else class="wh-weekly-table-wrap">
            <table class="wh-weekly-table">
              <thead>
                <tr>
                  <th>สัปดาห์</th>
                  <th v-for="(job, idx) in jobs" :key="job.job_type">{{ jobTypeLabel(job.job_type) }}</th>
                  <th>รวมชั่วโมง</th>
                  <th>รายได้ (est.)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in weeklyRows" :key="row.week" class="wh-weekly-row">
                  <td class="wh-week-label">{{ row.week }}</td>
                  <td v-for="(job, idx) in jobs" :key="job.job_type" class="wh-weekly-cell">
                    <span v-if="row.byJob[job.job_type]">{{ row.byJob[job.job_type].hours.toFixed(1) }}hr</span>
                    <span v-else class="wh-dash">–</span>
                  </td>
                  <td class="wh-td-bold">{{ row.totalHours.toFixed(2) }} hr</td>
                  <td class="wh-td-green">${{ row.totalEarnings.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Job Manager Component -->
        <JobManager
          :jobs="jobs"
          :work-logs="workLogs"
          @update-jobs="handleUpdateJobs"
          @add-work-log="handleAddWorkLog"
          @delete-work-log="handleDeleteWorkLog"
        />
      </div>

      <!-- Tab 4: Planner View -->
      <div v-else-if="currentView === 'planner'">
        <BreakEvenPlanner
          :project-costs-total="projectCostsTotal"
          :total-income="totalIncome"
          :daily-expenses="dailyExpenses"
          :countdowns="countdowns"
          :jobs="jobs"
          :exchange-rate="exchangeRate"
          :active-currency="activeCurrency"
          :actual-weekly-expense-total="actualWeeklyExpenseTotal"
        />
      </div>

      <!-- Celebration Modal -->
      <div v-if="showCelebrateModal" class="neo-modal-overlay" style="z-index: 9999;" @click.self="closeCelebrateModal">
        <div class="neo-modal-content celebrate-modal-content" style="text-align: center; max-width: 500px; padding: 32px; border-width: 4px; transform: rotate(1deg);">
          <button class="neo-modal-close" @click="closeCelebrateModal">✖</button>
          
          <div class="celebrate-bounce" style="font-size: 4rem; margin-bottom: 16px;">🏆</div>
          
          <h2 class="heading-font" style="font-size: 1.8rem; color: black; margin-bottom: 8px;">
            🎉 คืนทุนโครงการแล้ว! 🎉
          </h2>
          <h3 class="heading-font" style="font-size: 1.1rem; color: var(--color-balance); background-color: black; display: inline-block; padding: 4px 12px; margin-bottom: 16px;">
            BREAK-EVEN ACHIEVED!
          </h3>
          
          <p style="font-weight: 700; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; color: var(--color-muted);">
            ยินดีด้วยน้าาา! คุณทำยอดรายรับสะสมได้มากกว่าค่าธรรมเนียมและค่าโครงการทั้งหมดแล้ว ตอนนี้เงินทุกบาทที่คุณหาได้จะเริ่มสะสมเข้ากระเป๋าออมเงินโดยตรงแล้ว!
          </p>

          <div style="display: flex; justify-content: center; gap: 8px; font-size: 2rem; margin-bottom: 24px;">
            <span>🇺🇸</span><span class="celebrate-bounce">✨</span><span>💰</span><span class="celebrate-bounce">✨</span><span>✈️</span>
          </div>

          <button 
            class="neo-btn income-btn" 
            style="width: 100%; padding: 12px; font-size: 1rem; box-shadow: 4px 4px 0px #000;"
            @click="closeCelebrateModal"
          >
            ลุยต่อเลยเพื่อฝัน! 🚀
          </button>
        </div>
      </div>
      <!-- Custom Confirmation Modal -->
      <div v-if="customModal.show" class="neo-modal-overlay" style="z-index: 10000;" @click.self="handleModalCancel">
        <div class="neo-modal-content" style="max-width: 450px; padding: 28px; border-width: 4px; transform: rotate(-0.5deg);">
          <button class="neo-modal-close" @click="handleModalCancel">✖</button>
          
          <h2 class="heading-font" style="font-size: 1.4rem; color: black; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            {{ customModal.title }}
          </h2>
          
          <p style="font-weight: 700; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; color: black;">
            {{ customModal.message }}
          </p>

          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button 
              v-if="customModal.type === 'confirm'" 
              class="neo-btn danger-btn" 
              style="padding: 8px 16px; font-size: 0.85rem; box-shadow: 3px 3px 0px #000;"
              @click="handleModalCancel"
            >
              ยกเลิก ❌
            </button>
            <button 
              class="neo-btn income-btn" 
              style="padding: 8px 16px; font-size: 0.85rem; box-shadow: 3px 3px 0px #000;"
              @click="handleModalConfirm"
            >
              {{ customModal.type === 'confirm' ? 'ยืนยัน' : 'ตกลง' }} 
              {{ customModal.type === 'confirm' ? '✔️' : '👍' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, provide } from 'vue';
import LoginRegister from './components/LoginRegister.vue';
import OnboardingWizard from './components/OnboardingWizard.vue';
import ExchangeRate from './components/ExchangeRate.vue';
import DashboardCard from './components/DashboardCard.vue';
import CostForm from './components/CostForm.vue';
import TransactionList from './components/TransactionList.vue';
import GoalTracker from './components/GoalTracker.vue';
import CountdownCards from './components/CountdownCards.vue';
import WeeklyBudgetCard from './components/WeeklyBudgetCard.vue';
import BadgesContainer from './components/BadgesContainer.vue';
import J1Mascot from './components/J1Mascot.vue';
import JobManager from './components/JobManager.vue';
import BreakEvenPlanner from './components/BreakEvenPlanner.vue';

// Auth State
const token = ref(localStorage.getItem('wat_token') || '');
const userId = ref(localStorage.getItem('wat_user_id') || '');
const username = ref(localStorage.getItem('wat_username') || '');
const onboarded = ref(localStorage.getItem('wat_onboarded') === '1' ? 1 : 0);

// Currency Swapper State
const activeCurrency = ref(localStorage.getItem('wat_active_currency') || 'USD');

// Navigation View State
const currentView = ref('dashboard');

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
const countdowns = ref(getCachedJson('wat_countdowns', { next_payday: '', pay_cycle: 'weekly', next_rent_day: '', rent_amount: 150 }));
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

provide('showAlert', showAlert);
provide('showConfirm', showConfirm);

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

// Calculate actual weekly variable expense based on the last 4 weeks
const actualWeeklyExpenseTotal = computed(() => {
  const expenseTx = transactions.value.filter(t => t.type === 'expense');
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
    return dailyExpenses.value / elapsedWeeks;
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

// Lifecycle
onMounted(() => {
  if (token.value) {
    fetchDashboardData();
  }
});
</script>
