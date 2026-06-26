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
          :rent-and-deposit-total="rentAndDepositTotal"
          :other-expenses-total="otherExpensesTotal"
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
              :current-week-expense-total="currentWeekExpenseTotal"
              :current-week-range-text="currentWeekRangeText"
              :transactions="transactions"
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

      <!-- Mobile Bottom Navigation Bar -->
      <div class="mobile-bottom-nav">
        <button 
          @click="currentView = 'dashboard'" 
          :class="['bottom-nav-btn', currentView === 'dashboard' ? 'active' : '']"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">แดชบอร์ด</span>
        </button>
        <button 
          @click="currentView = 'planner'" 
          :class="['bottom-nav-btn', currentView === 'planner' ? 'active' : '']"
        >
          <span class="nav-icon">🎯</span>
          <span class="nav-text">วางแผน</span>
        </button>
        
        <!-- Central FAB Button -->
        <button 
          class="bottom-nav-fab"
          @click="showAddTxModal = true"
        >
          <span class="fab-icon">+</span>
        </button>
        
        <button 
          @click="currentView = 'transactions'" 
          :class="['bottom-nav-btn', currentView === 'transactions' ? 'active' : '']"
        >
          <span class="nav-icon">📝</span>
          <span class="nav-text">ประวัติ</span>
        </button>
        <button 
          @click="currentView = 'jobs'" 
          :class="['bottom-nav-btn', currentView === 'jobs' ? 'active' : '']"
        >
          <span class="nav-icon">🏢</span>
          <span class="nav-text">ชั่วโมงงาน</span>
        </button>
      </div>

      <!-- Mobile Quick Add Modal -->
      <div v-if="showAddTxModal" class="neo-modal-overlay" style="z-index: 9999;" @click.self="showAddTxModal = false">
        <div class="neo-modal-content" style="max-width: 450px; padding: 24px; border-width: 4px; transform: rotate(0.5deg); overflow-y: auto; max-height: 90vh;">
          <button class="neo-modal-close" @click="showAddTxModal = false">✖</button>
          
          <h2 class="heading-font" style="font-size: 1.3rem; color: black; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            💸 บันทึกรายการด่วน (Quick Add)
          </h2>
          
          <CostForm 
            :project-costs="projectCosts"
            :exchange-rate="exchangeRate"
            @add-transaction="handleQuickAddTransaction"
            @update-project-costs="handleUpdateProjectCosts"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, provide } from 'vue';
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
import { useFinancials } from './composables/useFinancials';

const {
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
} = useFinancials();

// Provide dialog helpers to sub-components
provide('showAlert', showAlert);
provide('showConfirm', showConfirm);

// Lifecycle
onMounted(() => {
  if (token.value) {
    fetchDashboardData();
    checkAndRolloverCountdowns();
  }
});
</script>
