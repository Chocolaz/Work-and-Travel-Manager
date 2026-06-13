<template>
  <div class="comic-panel break-even-planner">
    <!-- Header -->
    <div class="planner-header">
      <h2 class="heading-font planner-title">
        <span class="sticker planner-sticker">🎯</span>
        <span>วิเคราะห์การคืนทุน & แผนค่าใช้จ่าย (Break-Even & Expense Planner)</span>
      </h2>
    </div>

    <!-- Project Timeline Card -->
    <div class="neo-card timeline-section" style="margin-bottom: 24px; padding: 18px;">
      <h3 class="heading-font section-title" style="font-size: 0.95rem; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        📅 กรอบระยะเวลาโครงการ (Project Timeline)
      </h3>
      
      <div v-if="hasProjectTimeline">
        <div class="timeline-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: 700; margin-bottom: 8px;">
          <span>เริ่ม: {{ formatDate(projectStartDateVal) }}</span>
          <span>สิ้นสุด: {{ formatDate(projectEndDateVal) }}</span>
        </div>

        <!-- Progress bar -->
        <div class="neo-progress-container" style="background-color: white; border-width: 2.5px; height: 16px; margin-bottom: 8px;">
          <div 
            class="neo-progress-bar" 
            :style="{ 
              width: `${projectProgressPercent}%`, 
              backgroundColor: '#00E5FF',
              borderRightWidth: projectProgressPercent > 0 ? '2px' : '0' 
            }"
          ></div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 800; color: var(--color-muted);">
          <span>ผ่านโครงการไปแล้ว {{ projectProgressPercent.toFixed(0) }}% ({{ projectDaysElapsed }} วัน)</span>
          <span style="color: black;">เหลือเวลาอีก {{ Math.floor(projectDaysRemaining / 7) }} สัปดาห์ {{ projectDaysRemaining % 7 }} วัน</span>
        </div>
      </div>
      <div v-else style="text-align: center; padding: 12px; font-weight: 700; font-size: 0.78rem; color: var(--color-muted); background: #fcfcfc; border: 1.5px dashed #000; border-radius: 6px;">
        💡 เคล็ดลับจาก PO: ตั้งค่า <strong>วันเริ่มโครงการ</strong> และ <strong>วันจบโครงการ</strong> ในส่วนตั้งค่าเคานต์ดาวน์ (แท็บ Dashboard) 
        เพื่อให้นำกรอบเวลานี้มาประมวลผลแผนการออมเงินและคุมรายจ่ายอย่างละเอียดได้ทันที!
      </div>
    </div>

    <!-- Dual Metric Status Box -->
    <div class="metrics-container">
      <!-- MAIN METRIC: Net Break-Even -->
      <div class="planner-card main-metric-card" :class="{ 'achieved': remainingNetDebt <= 0 }">
        <div class="metric-badge">เป้าหมายหลัก (Main Metric)</div>
        <h3 class="heading-font metric-title">💰 วันคืนทุนที่แท้จริง (Net Break-Even)</h3>
        <p class="metric-desc">คำนวณจากรายรับหักลบค่าเช่าบ้านและค่ากินอยู่จริงสะสม (สะท้อนเงินเหลือจริง)</p>
        
        <div v-if="remainingNetDebt <= 0" class="achievement-banner">
          🏆 คืนทุนโครงการจริงสำเร็จแล้ว! ยินดีด้วยน้าาา! 🎉
        </div>
        <div v-else-if="weeklyNetSurplus <= 0" class="warning-banner">
          ⚠️ ไม่มีวันคืนทุนเนื่องจากรายจ่ายจำลองสูงกว่ารายรับ! กรุณาลดรายจ่ายหรือเพิ่มชั่วโมงงาน
        </div>
        <div v-else-if="isNetBreakEvenOutOfProject" class="warning-banner" style="background-color: var(--color-expense); border-color: #000; color: black;">
          🚨 คืนทุนไม่ทันช่วงโครงการ! วันคืนทุนล่าช้ากว่าวันสิ้นสุดโครงการไป <strong>{{ netOverDays }} วัน</strong> (แนะนำให้จำลองลดค่าใช้จ่าย หรือเพิ่มชั่วโมงงาน)
        </div>
        <div v-else class="metric-result">
          <div class="result-date heading-font">{{ formatDate(netBreakEvenDate) }}</div>
          <div class="result-sub">
            อีก <strong class="highlight-text">{{ netWeeksNeeded.toFixed(1) }} สัปดาห์</strong> · 
            ประมาณ <strong class="highlight-text">{{ netPaychecksNeeded }} Paychecks</strong>
          </div>
          <div class="debt-status">
            ยังขาดอีก <span class="debt-amount">{{ formatCurrency(remainingNetDebt) }}</span> จะคืนทุนสุทธิ
          </div>
        </div>
      </div>

      <!-- SECONDARY MILESTONE: Gross Break-Even -->
      <div class="planner-card milestone-card" :class="{ 'achieved': remainingGrossDebt <= 0 }">
        <div class="metric-badge">Achievement Milestone</div>
        <h3 class="heading-font metric-title">🚀 วันถอนทุนคืน (Gross Break-Even)</h3>
        <p class="metric-desc">คำนวณจากรายรับสะสมอย่างเดียวเทียบเงินต้น (ทำเงินคืนได้เท่าค่าสมัครโครงการ)</p>
        
        <div v-if="remainingGrossDebt <= 0" class="achievement-banner">
          ⭐ ถอนทุนคืนสำเร็จแล้ว! (รายรับสะสมแซงค่าโครงการเรียบร้อย)
        </div>
        <div v-else-if="weeklyNetIncome <= 0" class="warning-banner">
          ⚠️ กรุณากรอกชั่วโมงงานเฉลี่ยใน Job Settings เพื่อคำนวณ
        </div>
        <div v-else class="metric-result">
          <div class="result-date heading-font">{{ formatDate(grossBreakEvenDate) }}</div>
          <div class="result-sub">
            อีก <strong>{{ grossWeeksNeeded.toFixed(1) }} สัปดาห์</strong> · 
            ประมาณ <strong>{{ grossPaychecksNeeded }} Paychecks</strong>
          </div>
          <div class="debt-status">
            ขาดอีก <span>{{ formatCurrency(remainingGrossDebt) }}</span> (รายรับรวมสะสม)
          </div>
        </div>
      </div>
    </div>

    <!-- What-If Simulator Section -->
    <div class="neo-card simulator-section">
      <h3 class="heading-font section-title">🎛️ เครื่องจำลองสถานการณ์การเงิน (What-If Simulator)</h3>
      <p class="section-hint">ทดลองปรับค่าใช้จ่ายหรือชั่วโมงงานเพื่อเลื่อนวันคืนทุนให้เร็วขึ้นแบบเรียลไทม์</p>

      <div class="simulator-grid">
        <!-- Variable Expense Simulator -->
        <div class="sim-group">
          <div class="sim-label-row">
            <span class="sim-label">💵 งบรายจ่ายรายสัปดาห์ (Weekly Budget):</span>
            <span class="sim-value heading-font">{{ formatCurrency(simulatedWeeklyExpense) }}</span>
          </div>
          
          <input 
            type="range" 
            v-model.number="simulatedWeeklyExpense" 
            :min="minBudgetSlider" 
            :max="maxBudgetSlider" 
            step="5"
            class="neo-slider" 
          />
          
          <div class="sim-helper-row">
            <span @click="resetBudgetToActual" class="sim-helper-btn" title="คลิกเพื่อใช้ค่าเฉลี่ยจริง">
              📊 จริง: {{ formatCurrency(actualWeeklyExpenseTotal) }}/wk
            </span>
            <span v-if="weeklyExpenseTargetConverted > 0" @click="resetBudgetToTarget" class="sim-helper-btn" title="คลิกเพื่อใช้เป้าหมายที่ตั้งไว้">
              🎯 เป้า: {{ formatCurrency(weeklyExpenseTargetConverted) }}/wk
            </span>
          </div>
        </div>

        <!-- Job Hours Simulator -->
        <div class="sim-group">
          <span class="sim-label">⏱️ จำลองชั่วโมงงานต่อสัปดาห์ (Simulate Work Hours):</span>
          
          <div v-for="job in simulatedJobs" :key="job.job_type" class="job-sim-row">
            <div class="job-sim-info">
              <span class="job-sim-title">{{ job.title }}</span>
              <span class="job-sim-rate">(${{ job.hourly_rate }}/hr)</span>
            </div>
            
            <div class="job-sim-control">
              <input 
                type="range" 
                v-model.number="job.simHours" 
                min="0" 
                max="80" 
                step="1"
                class="neo-slider job-slider" 
              />
              <span class="job-hours-displayheading heading-font">{{ job.simHours }} hr</span>
            </div>
          </div>
          <div class="sim-helper-row" style="justify-content: flex-end;">
            <span @click="resetHoursToDefaults" class="sim-helper-btn">🔄 คืนค่าเริ่มต้น</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PO Insight & Strategic Advice -->
    <div class="neo-card advice-section">
      <h3 class="heading-font section-title">💡 คำแนะนำกลยุทธ์การเงินจาก Product Owner</h3>
      
      <div class="advice-content">
        <!-- Status: Infinite break-even -->
        <div v-if="weeklyNetSurplus <= 0" class="advice-box danger">
          <strong>🚨 สัญญาณเตือนภัยทางการเงิน!</strong> รายจ่ายรวมรายสัปดาห์ของคุณ (ค่ากินอยู่ {{ formatCurrency(simulatedWeeklyExpense) }} + ค่าเช่าบ้าน {{ formatCurrency(rentAmountActive) }} = {{ formatCurrency(simulatedWeeklyExpense + rentAmountActive) }}) สูงกว่าหรือเท่ากับรายรับสุทธิ ({{ formatCurrency(weeklyNetIncome) }}) 
          สถานการณ์นี้จะทำให้คุณ **ไม่มีวันคืนทุนได้เลย** ขอแนะนำให้ปรับลดงบรายจ่าย หรือขยับชั่วโมงทำงานให้รายได้มากกว่ารายจ่าย
        </div>

        <!-- Status: Healthy cash flow -->
        <div v-else class="advice-box info">
          <strong class="advice-box-title">📈 สรุปกระแสเงินสดรายสัปดาห์ (Weekly Cash Flow)</strong>
          <div class="cashflow-summary-list">
            <div class="cashflow-row">
              <span class="cf-label">รายรับสุทธิคาดการณ์:</span>
              <span class="cf-value wh-green">{{ formatCurrency(weeklyNetIncome) }}</span>
            </div>
            <div class="cashflow-row">
              <span class="cf-label">งบจำลอง (ไม่รวมค่าเช่า):</span>
              <span class="cf-value wh-red">{{ formatCurrency(simulatedWeeklyExpense) }}</span>
            </div>
            <div class="cashflow-row">
              <span class="cf-label">ค่าเช่าบ้านคงที่:</span>
              <span class="cf-value wh-red">{{ formatCurrency(rentAmountActive) }}</span>
            </div>
            <div class="cashflow-row net-savings-row">
              <span class="cf-label">กระแสเงินสดสุทธิ (Net Savings):</span>
              <span class="cf-value wh-green">{{ formatCurrency(weeklyNetSurplus) }}</span>
            </div>
          </div>

          <div v-if="remainingNetDebt > 0" class="strategy-tips" style="margin-top: 12px; border-top: 1.5px dashed #000; padding-top: 10px;">
            <strong>📋 แผนควบคุมค่าใช้จ่ายที่แนะนำ:</strong>
            <p v-if="weeklyExpenseTargetConverted > 0 && simulatedWeeklyExpense > weeklyExpenseTargetConverted">
              ⚠️ ตอนนี้งบประมาณที่คุณสมมติ ({{ formatCurrency(simulatedWeeklyExpense) }}) สูงกว่าเป้าหมายที่ตั้งไว้ ({{ formatCurrency(weeklyExpenseTargetConverted) }}) 
              <span v-if="getDiffDays(weeklyExpenseTargetConverted).status === 'sim-deficit'">
                หากคุณคุมงบให้กลับไปอยู่ในเป้าหมายได้ คุณจะ<strong>สามารถคืนทุนได้สำเร็จ!</strong> 🎉 (เนื่องจากรายจ่ายจำลองปัจจุบันสูงเกินไปจนไม่สามารถคืนทุนได้ ⚠️)
              </span>
              <span v-else-if="getDiffDays(weeklyExpenseTargetConverted).days > 0">
                หากคุมให้กลับไปอยู่ในเป้าหมายได้ คุณจะคืนทุนเร็วขึ้นอีก 
                <strong>{{ getDiffDays(weeklyExpenseTargetConverted).days }} วัน!</strong>
              </span>
              <span v-else>
                หากคุมให้กลับไปอยู่ในเป้าหมายได้ คุณจะคืนทุนในกรอบเวลาเดียวกับเป้าหมายที่ตั้งไว้
              </span>
            </p>
            <p v-else-if="simulatedWeeklyExpense < actualWeeklyExpenseTotal">
              🎯 เยี่ยมมาก! คุณจำลองค่าใช้จ่ายไว้ประหยัดกว่าพฤติกรรมจริงย้อนหลัง ถ้าคุณคุมงบไม่ให้เกิน <strong>{{ formatCurrency(simulatedWeeklyExpense) }}</strong> นี้ได้สำเร็จ 
              <span v-if="getDiffDays(actualWeeklyExpenseTotal).status === 'alt-deficit'">
                คุณจะ<strong>สามารถคืนทุนได้สำเร็จ!</strong> 🎉 (ซึ่งหากใช้จ่ายเฉลี่ยเท่าเดิม คุณจะไม่สามารถคืนทุนได้เลย ⚠️)
              </span>
              <span v-else-if="getDiffDays(actualWeeklyExpenseTotal).days > 0">
                คุณจะคืนทุนเร็วกว่าค่าเฉลี่ยปกติถึง <strong>{{ getDiffDays(actualWeeklyExpenseTotal).days }} วัน!</strong>
              </span>
              <span v-else>
                คุณจะคืนทุนได้ในเวลาที่ใกล้เคียงกับค่าเฉลี่ยปกติ
              </span>
            </p>
            <p v-else>
              💡 พยายามคุมค่าใช้จ่ายผันแปรต่อสัปดาห์ไม่ให้เกิน <strong>{{ formatCurrency(simulatedWeeklyExpense) }}</strong> (ไม่รวมค่าเช่าบ้านสัปดาห์ละ {{ formatCurrency(rentAmountActive) }}) เพื่อคงเป้าหมายวันคืนทุนนี้ไว้
            </p>

            <!-- Project end-date budget target suggestion -->
            <div v-if="hasProjectTimeline && remainingNetDebt > 0" style="margin-top: 12px; background: #FFFDE7; border: 2px solid #000; border-radius: 8px; padding: 10px; font-size: 0.78rem; box-shadow: 2px 2px 0px #000;">
              <div v-if="projectDaysRemaining > 0">
                🚀 <strong>เป้าหมายเพื่อคืนทุนให้ทันก่อนจบโครงการ (วันที่ {{ formatDate(projectEndDateVal) }}):</strong>
                <div style="margin-top: 6px; font-weight: 800; display: flex; justify-content: space-between;">
                  <span>• ต้องออมเงินสุทธิเฉลี่ย:</span>
                  <span class="wh-green">{{ formatCurrency(requiredWeeklySavings) }} / สัปดาห์</span>
                </div>
                <div style="margin-top: 4px; font-weight: 800; display: flex; justify-content: space-between;">
                  <span>• คุมค่าใช้จ่ายต่อสัปดาห์ห้ามเกิน:</span>
                  <span class="wh-red">{{ formatCurrency(recommendedMaxWeeklyExpense) }} / สัปดาห์</span>
                </div>
                <div style="margin-top: 2px; font-size: 0.7rem; color: var(--color-muted); text-align: right;">
                  (เท่ากับงบกินอยู่ไม่รวมค่าเช่าบ้านสูงสุด: {{ formatCurrency(recommendedMaxWeeklyExpense - rentAmountActive) }})
                </div>
                <p v-if="recommendedMaxWeeklyExpense < rentAmountActive" style="margin-top: 8px; color: #b30000; font-weight: 900; margin-bottom: 0; border-top: 1.5px dashed #000; padding-top: 6px;">
                  ⚠️ คำเตือน: ค่าเช่าบ้านของคุณสูงกว่างบรายสัปดาห์ที่แนะนำข้างต้น คุณจะไม่สามารถคืนทุนได้ทันกรอบโครงการด้วยชั่วโมงทำงานปัจจุบัน (จำเป็นต้องเพิ่มชั่วโมงงาน/หาจ็อบเสริม)
                </p>
              </div>
              <div v-else style="color: #b30000; font-weight: 900;">
                ⚠️ ระยะเวลาโครงการได้สิ้นสุดลงแล้ว!
              </div>
            </div>
          </div>
          <div v-else class="strategy-tips" style="margin-top: 12px; border-top: 1.5px dashed #000; padding-top: 10px; color: #0b6623; font-weight: 800;">
            🎉 ยินดีด้วย! คุณสามารถคืนทุนสำหรับโครงการนี้ได้สำเร็จแล้ว! ยอดเก็บออมหลังจากนี้ของคุณคือกำไรสะสมล้วนๆ ขอให้ใช้ชีวิตและท่องเที่ยวให้สนุกเต็มที่เลยน้า! 🗽🇺🇸
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  projectCostsTotal: {
    type: Number,
    required: true
  },
  totalIncome: {
    type: Number,
    required: true
  },
  dailyExpenses: {
    type: Number,
    required: true
  },
  countdowns: {
    type: Object,
    required: true
  },
  jobs: {
    type: Array,
    required: true
  },
  exchangeRate: {
    type: Object,
    required: true
  },
  activeCurrency: {
    type: String,
    required: true
  },
  actualWeeklyExpenseTotal: {
    type: Number,
    required: true
  }
});

// Setup dynamic/simulated values
const simulatedWeeklyExpense = ref(0);
const simulatedJobs = ref([]);

// Convert exchange rate helpers
const rate = computed(() => parseFloat(props.exchangeRate?.rate) || 35.0);

const convertUsdToActive = (amountUsd) => {
  const amt = parseFloat(amountUsd) || 0;
  if (props.activeCurrency === 'USD') return amt;
  return amt * rate.value;
};

// Rent per week in active currency
const rentAmountActive = computed(() => {
  return convertUsdToActive(props.countdowns?.rent_amount || 0);
});

// Target weekly expense set by user in active currency
const weeklyExpenseTargetConverted = computed(() => {
  return convertUsdToActive(props.countdowns?.weekly_expense_target || 0);
});

// Sliders limit bounds
const minBudgetSlider = ref(0);
const maxBudgetSlider = computed(() => {
  const baseMax = Math.max(props.actualWeeklyExpenseTotal * 2, weeklyExpenseTargetConverted.value * 2);
  return Math.ceil(Math.max(baseMax, convertUsdToActive(300)));
});

// Sync jobs list and simulated hours
const syncSimulatedJobs = () => {
  if (props.jobs && props.jobs.length > 0) {
    simulatedJobs.value = props.jobs.map(j => ({
      ...j,
      simHours: j.avg_hours_per_week !== undefined ? j.avg_hours_per_week : 0
    }));
  }
};

watch(() => props.jobs, () => {
  syncSimulatedJobs();
}, { deep: true, immediate: true });

// Initialize weekly expense budget (variable expenses only)
const initWeeklyExpenseBudget = () => {
  if (weeklyExpenseTargetConverted.value > 0) {
    simulatedWeeklyExpense.value = weeklyExpenseTargetConverted.value;
  } else if (props.actualWeeklyExpenseTotal > 0) {
    simulatedWeeklyExpense.value = props.actualWeeklyExpenseTotal;
  } else {
    // Default fallback: some variable expenses
    simulatedWeeklyExpense.value = convertUsdToActive(100);
  }
};

// Watch triggers to initialize budget
watch(() => props.actualWeeklyExpenseTotal, (newVal) => {
  if (simulatedWeeklyExpense.value === 0) {
    initWeeklyExpenseBudget();
  }
});

watch(() => props.countdowns.weekly_expense_target, () => {
  initWeeklyExpenseBudget();
});

// Watch active currency to convert simulated weekly expense budget
watch(() => props.activeCurrency, (newCurrency, oldCurrency) => {
  const r = rate.value;
  if (oldCurrency && oldCurrency !== newCurrency) {
    if (newCurrency === 'THB') {
      simulatedWeeklyExpense.value = parseFloat((simulatedWeeklyExpense.value * r).toFixed(2));
    } else if (newCurrency === 'USD') {
      simulatedWeeklyExpense.value = parseFloat((simulatedWeeklyExpense.value / r).toFixed(2));
    }
  }
});

onMounted(() => {
  syncSimulatedJobs();
  initWeeklyExpenseBudget();
});

// Reset helpers
const resetBudgetToActual = () => {
  simulatedWeeklyExpense.value = props.actualWeeklyExpenseTotal;
};

const resetBudgetToTarget = () => {
  if (weeklyExpenseTargetConverted.value > 0) {
    simulatedWeeklyExpense.value = weeklyExpenseTargetConverted.value;
  }
};

const resetHoursToDefaults = () => {
  syncSimulatedJobs();
};

// Core calculations
const remainingGrossDebt = computed(() => {
  return Math.max(0, props.projectCostsTotal - props.totalIncome);
});

const remainingNetDebt = computed(() => {
  // net debt = costs + variable expenses logged - total income logged
  return Math.max(0, props.projectCostsTotal + props.dailyExpenses - props.totalIncome);
});

// Weekly Net Income from simulated hours (after taxes)
const weeklyNetIncome = computed(() => {
  return simulatedJobs.value.reduce((sum, job) => {
    // rate is stored in USD, convert to active currency
    const jobRateActive = convertUsdToActive(job.hourly_rate);
    const taxRate = parseFloat(job.tax_rate) || 0;
    const hours = parseFloat(job.simHours) || 0;
    const gross = hours * jobRateActive;
    const net = gross * (1 - taxRate / 100);
    return sum + net;
  }, 0);
});

// surplus cash flow (subtracting both simulated variable expense and fixed rent)
const weeklyNetSurplus = computed(() => {
  return weeklyNetIncome.value - simulatedWeeklyExpense.value - rentAmountActive.value;
});

// Weeks needed to break-even
const netWeeksNeeded = computed(() => {
  if (remainingNetDebt.value <= 0) return 0;
  if (weeklyNetSurplus.value <= 0) return Infinity;
  return remainingNetDebt.value / weeklyNetSurplus.value;
});

const grossWeeksNeeded = computed(() => {
  if (remainingGrossDebt.value <= 0) return 0;
  if (weeklyNetIncome.value <= 0) return Infinity;
  return remainingGrossDebt.value / weeklyNetIncome.value;
});

// Paychecks needed to break-even based on pay_cycle
const weeksPerPayCycle = computed(() => {
  const cycle = props.countdowns?.pay_cycle || 'weekly';
  if (cycle === 'bi-weekly') return 2;
  if (cycle === 'monthly') return 4.33;
  return 1; // weekly
});

const netPaychecksNeeded = computed(() => {
  if (netWeeksNeeded.value === Infinity) return '∞';
  return Math.ceil(netWeeksNeeded.value / weeksPerPayCycle.value);
});

const grossPaychecksNeeded = computed(() => {
  if (grossWeeksNeeded.value === Infinity) return '∞';
  return Math.ceil(grossWeeksNeeded.value / weeksPerPayCycle.value);
});

// Dates of break-even
const netBreakEvenDate = computed(() => {
  if (netWeeksNeeded.value === Infinity || remainingNetDebt.value <= 0) return null;
  const d = new Date();
  d.setDate(d.getDate() + Math.ceil(netWeeksNeeded.value * 7));
  return d;
});

const grossBreakEvenDate = computed(() => {
  if (grossWeeksNeeded.value === Infinity || remainingGrossDebt.value <= 0) return null;
  const d = new Date();
  d.setDate(d.getDate() + Math.ceil(grossWeeksNeeded.value * 7));
  return d;
});

// Date formatting helpers
const formatDate = (date) => {
  if (!date) return 'ไม่มีเป้าหมายคืนทุน';
  return date.toLocaleDateString('th-TH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatCurrency = (value) => {
  const decimals = props.activeCurrency === 'THB' ? 0 : 2;
  const formatted = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  const sign = value < 0 ? '-' : '';
  if (props.activeCurrency === 'USD') {
    return `${sign}$${formatted}`;
  } else {
    return `${sign}${formatted} ฿`;
  }
};

// Compare simulated budget vs alternative budget (helps calculate days difference)
const getDiffDays = (alternativeBudget) => {
  if (remainingNetDebt.value <= 0 || weeklyNetIncome.value <= 0) {
    return { days: 0, status: 'no-debt' };
  }
  
  const currentSurplus = weeklyNetIncome.value - simulatedWeeklyExpense.value - rentAmountActive.value;
  const altSurplus = weeklyNetIncome.value - alternativeBudget - rentAmountActive.value;
  
  if (currentSurplus <= 0) {
    return { days: 0, status: 'sim-deficit' };
  }
  if (altSurplus <= 0) {
    return { days: 0, status: 'alt-deficit' };
  }
  
  const currentWeeks = remainingNetDebt.value / currentSurplus;
  const altWeeks = remainingNetDebt.value / altSurplus;
  const diffDays = Math.round((altWeeks - currentWeeks) * 7);
  return { days: Math.abs(diffDays), status: 'ok' };
};

const hasProjectTimeline = computed(() => {
  return !!(props.countdowns?.project_start_date && props.countdowns?.project_end_date);
});

const projectStartDateVal = computed(() => {
  if (!hasProjectTimeline.value) return null;
  return new Date(props.countdowns.project_start_date + 'T00:00:00');
});

const projectEndDateVal = computed(() => {
  if (!hasProjectTimeline.value) return null;
  return new Date(props.countdowns.project_end_date + 'T23:59:59');
});

const projectDurationDays = computed(() => {
  if (!hasProjectTimeline.value) return 0;
  const diffTime = projectEndDateVal.value.getTime() - projectStartDateVal.value.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const projectDaysElapsed = computed(() => {
  if (!hasProjectTimeline.value) return 0;
  const today = new Date();
  const diffTime = today.getTime() - projectStartDateVal.value.getTime();
  return Math.min(projectDurationDays.value, Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));
});

const projectDaysRemaining = computed(() => {
  if (!hasProjectTimeline.value) return 0;
  const today = new Date();
  const diffTime = projectEndDateVal.value.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

const projectProgressPercent = computed(() => {
  if (projectDurationDays.value <= 0) return 0;
  return Math.min(100, Math.max(0, (projectDaysElapsed.value / projectDurationDays.value) * 100));
});

const requiredWeeklySavings = computed(() => {
  if (remainingNetDebt.value <= 0 || projectDaysRemaining.value <= 0) return 0;
  const weeksRemaining = projectDaysRemaining.value / 7;
  return remainingNetDebt.value / weeksRemaining;
});

const recommendedMaxWeeklyExpense = computed(() => {
  if (remainingNetDebt.value <= 0 || projectDaysRemaining.value <= 0) return 0;
  return weeklyNetIncome.value - requiredWeeklySavings.value;
});

const isNetBreakEvenOutOfProject = computed(() => {
  if (!hasProjectTimeline.value || !netBreakEvenDate.value) return false;
  return netBreakEvenDate.value.getTime() > projectEndDateVal.value.getTime();
});

const netOverDays = computed(() => {
  if (!isNetBreakEvenOutOfProject.value) return 0;
  const diffTime = netBreakEvenDate.value.getTime() - projectEndDateVal.value.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});
</script>

<style scoped>
.break-even-planner {
  margin-bottom: 24px;
}

.planner-header {
  margin-bottom: 18px;
}

.planner-title {
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.planner-sticker {
  background-color: var(--color-accent);
  color: black;
  font-size: 1.1rem;
  width: 30px;
  height: 30px;
}

.metrics-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .metrics-container {
    grid-template-columns: 1fr;
  }
}

.planner-card {
  border: 3px solid #000;
  border-radius: 12px;
  padding: 20px;
  background-color: var(--color-card-bg);
  box-shadow: 4px 4px 0px #000;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.main-metric-card {
  background-color: #FFF9E6; /* Light warm yellow */
}

.milestone-card {
  background-color: #EBF8FF; /* Light sky blue */
}

.planner-card.achieved {
  background-color: #E6FFFA; /* Light teal */
}

.metric-badge {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1.5px solid #000;
  border-radius: 4px;
  padding: 2px 6px;
  background: black;
  color: white;
  margin-bottom: 10px;
  width: fit-content;
}

.metric-title {
  font-size: 1.05rem;
  color: #000;
  margin-bottom: 6px;
}

.metric-desc {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-muted);
  line-height: 1.4;
  margin-bottom: 16px;
}

.metric-result {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-date {
  font-size: 1.25rem;
  color: black;
  text-decoration: underline;
  text-decoration-thickness: 2.5px;
}

.result-sub {
  font-size: 0.82rem;
  font-weight: 800;
  color: black;
}

.highlight-text {
  color: #e65c00;
}

.job-hours-displayheading {
  font-size: 0.85rem;
  font-weight: 900;
  background: black;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 45px;
  text-align: center;
}

.debt-status {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-muted);
  margin-top: 8px;
}

.debt-amount {
  font-weight: 900;
  color: #c20000;
  font-size: 0.8rem;
}

.achievement-banner {
  padding: 12px;
  background: var(--color-balance);
  border: 2px solid #000;
  border-radius: 8px;
  font-weight: 900;
  color: black;
  text-align: center;
  font-size: 0.85rem;
}

.warning-banner {
  padding: 12px;
  background: var(--color-expense);
  border: 2px solid #000;
  border-radius: 8px;
  font-weight: 900;
  color: black;
  text-align: center;
  font-size: 0.8rem;
}

/* Simulator styles */
.simulator-section {
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1rem;
  color: black;
  margin-bottom: 4px;
}

.section-hint {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-muted);
  margin-bottom: 20px;
}

.simulator-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .simulator-grid {
    grid-template-columns: 1fr;
  }
}

.sim-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sim-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sim-label {
  font-size: 0.8rem;
  font-weight: 900;
}

.sim-value {
  font-size: 1.1rem;
  color: #000;
  background-color: var(--color-accent);
  padding: 2px 8px;
  border: 2px solid #000;
  border-radius: 6px;
  box-shadow: 1.5px 1.5px 0px #000;
}

.neo-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border: 2px solid #000;
  border-radius: 4px;
  background: white;
  outline: none;
}

.neo-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2.5px solid #000;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0px #000;
}

.neo-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 2.5px solid #000;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0px #000;
}

.sim-helper-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-muted);
}

.sim-helper-btn {
  cursor: pointer;
  text-decoration: underline;
  color: var(--color-text);
  font-weight: 900;
  background: #f0f0f0;
  padding: 2px 6px;
  border: 1.5px solid #000;
  border-radius: 4px;
}
.sim-helper-btn:hover {
  background: var(--color-accent);
}

/* Job sim slider list */
.job-sim-row {
  background: #f7f7f7;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 2px 2px 0px #000;
}

.job-sim-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 900;
}

.job-sim-title {
  color: black;
}

.job-sim-rate {
  color: var(--color-muted);
}

.job-sim-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.job-slider {
  flex: 1;
}

/* Advice Box */
.advice-section {
  padding: 24px;
}

.advice-content {
  margin-top: 14px;
}

.advice-box {
  border: 2.5px solid #000;
  border-radius: 8px;
  padding: 14px;
  font-size: 0.82rem;
  line-height: 1.6;
  font-weight: 700;
  box-shadow: 3px 3px 0px #000;
  word-break: normal !important;
  overflow-wrap: break-word !important;
}

.advice-box.danger {
  background-color: var(--color-expense);
  color: black;
}

.advice-box.info {
  background-color: #E8F5E9; /* Soft green */
  color: black;
}

.advice-box-title {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.cashflow-summary-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  background: #ffffff;
  border: 2px solid #000;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 2px 2px 0px #000;
}

.cashflow-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  padding-bottom: 4px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.cashflow-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.net-savings-row {
  font-weight: 900;
  font-size: 0.82rem;
  border-top: 1.5px solid #000;
  padding-top: 6px;
  margin-top: 2px;
}

.cf-label {
  color: var(--color-muted);
}

.cf-value {
  font-weight: 900;
}

@media (max-width: 600px) {
  .advice-section {
    padding: 12px 14px !important;
  }
  
  .advice-box {
    padding: 10px !important;
    font-size: 0.78rem !important;
  }
  
  .cashflow-summary-list {
    padding: 6px 10px !important;
    margin-top: 8px !important;
  }
  
  .cashflow-row {
    font-size: 0.72rem !important;
  }
  
  .net-savings-row {
    font-size: 0.76rem !important;
  }
}

.wh-green {
  color: #0b6623;
  font-weight: 900;
}

.wh-red {
  color: #b30000;
  font-weight: 900;
}
</style>
