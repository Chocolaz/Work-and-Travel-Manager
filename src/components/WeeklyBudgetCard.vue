<template>
  <div class="comic-panel">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h2 class="heading-font" style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
        <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: var(--color-accent); color: black;">🎯</span>
        <span>งบค่าใช้จ่ายประจำสัปดาห์</span>
      </h2>
      
      <button 
        type="button" 
        class="neo-btn secondary-btn" 
        style="padding: 4px 8px; font-size: 0.75rem; box-shadow: 2px 2px 0px #000; border-width: 2px;"
        @click="isEditing = !isEditing"
      >
        {{ isEditing ? 'ยกเลิก ❌' : 'ตั้งค่า ⚙️' }}
      </button>
    </div>

    <!-- Tabs Switcher (Visible in Display Mode only) -->
    <div v-if="!isEditing" style="display: flex; gap: 8px; margin-bottom: 12px;">
      <button 
        type="button" 
        :class="['neo-tab-btn', activeTab === 'current' ? 'active' : '']" 
        style="padding: 6px 12px; font-size: 0.8rem; font-weight: 800; border-width: 2px; box-shadow: 2px 2px 0px #000;"
        @click="activeTab = 'current'"
      >
        🎯 สัปดาห์นี้
      </button>
      <button 
        type="button" 
        :class="['neo-tab-btn', activeTab === 'history' ? 'active' : '']" 
        style="padding: 6px 12px; font-size: 0.8rem; font-weight: 800; border-width: 2px; box-shadow: 2px 2px 0px #000;"
        @click="activeTab = 'history'"
      >
        ⏳ ประวัติรายสัปดาห์
      </button>
    </div>

    <!-- Edit Settings Mode -->
    <div v-if="isEditing" class="neo-card" style="padding: 16px; margin-bottom: 16px; border-width: 2px; box-shadow: 2px 2px 0px #000;">
      <form @submit.prevent="saveSettings">
        <h3 class="heading-font" style="font-size: 0.8rem; margin-bottom: 8px; color: var(--color-muted);">🎯 ตั้งค่าเป้าหมายค่าใช้จ่าย</h3>
        <div class="form-group" style="margin-bottom: 12px;">
          <label style="font-size: 0.65rem; display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>เป้าหมายค่าใช้จ่ายต่อสัปดาห์ ({{ activeCurrency }})</span>
            <span style="font-weight: 800; color: var(--color-muted);">ขีดจำกัด: 0 - {{ maxLimit }}</span>
          </label>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <input 
              type="range" 
              v-model.number="editWeeklyExpenseTarget" 
              min="0" 
              :max="maxLimit" 
              step="1"
              style="width: 100%; accent-color: var(--color-accent); cursor: pointer;"
            />
            <input 
              type="number" 
              v-model.number="editWeeklyExpenseTarget" 
              min="0" 
              :max="maxLimit" 
              required 
              style="padding: 6px 10px; border-width: 2px; width: 100%; box-sizing: border-box;" 
              placeholder="0" 
              step="any"
            />
          </div>
        </div>
        <button type="submit" class="neo-btn" style="width: 100%; padding: 6px; font-size: 0.8rem; box-shadow: 2px 2px 0px #000; border-width: 2px;">
          บันทึกการตั้งค่า 💾
        </button>
      </form>
    </div>

    <!-- Current Week Display Mode -->
    <div v-else-if="activeTab === 'current'" class="neo-card" style="padding: 16px; border-width: 2px; box-shadow: 2px 2px 0px #000; background-color: #FFF9C4;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-weight: 800; font-size: 0.8rem; text-transform: uppercase; color: var(--color-muted);">
            เป้าหมายงบประมาณสัปดาห์นี้
          </div>
          <div style="font-size: 0.72rem; font-weight: 800; color: #555; margin-top: 2px;">
            ({{ currentWeekRangeText }})
          </div>
          <div style="font-size: 1.8rem; font-family: var(--font-display); font-weight: 900; margin: 6px 0; color: black;">
            <template v-if="countdowns.weekly_expense_target > 0">
              {{ formatCurrency(weeklyExpenseTargetConverted) }}
            </template>
            <template v-else>ยังไม่ระบุเป้าหมาย</template>
          </div>
        </div>

        <div v-if="countdowns.weekly_expense_target > 0" style="text-align: right;">
          <div style="font-weight: 800; font-size: 0.8rem; text-transform: uppercase; color: var(--color-muted);">
            งบประมาณคงเหลือ
          </div>
          <div 
            style="font-size: 1.4rem; font-family: var(--font-display); font-weight: 900; margin: 6px 0; display: inline-block; padding: 4px 10px; border: 2.5px solid #000; box-shadow: 2px 2px 0px #000; transform: rotate(1deg);"
            :style="{
              backgroundColor: isBudgetExceeded ? '#FFB3C6' : '#B9F7CA',
              color: 'black'
            }"
          >
            {{ isBudgetExceeded ? '-' : '' }}{{ formatCurrency(Math.abs(remainingBudget)) }}
          </div>
        </div>
      </div>
      
      <!-- Budget Comparison Progress Bar -->
      <div v-if="countdowns.weekly_expense_target > 0" class="neo-progress-container" style="background-color: #ffffff; border: 2px solid #000; height: 16px; margin-top: 10px; margin-bottom: 10px;">
        <div 
          class="neo-progress-bar" 
          :style="{ 
            width: `${Math.min(100, progressPercent)}%`,
            backgroundColor: currentWeekExpenseTotal <= weeklyExpenseTargetConverted ? 'var(--color-income)' : 'var(--color-error)'
          }"
          style="height: 100%; transition: width 0.3s ease;"
        ></div>
      </div>

      <!-- Stats Footer -->
      <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 0.8rem; color: black;">
          <span>ใช้จ่ายจริงสัปดาห์นี้: {{ formatCurrency(currentWeekExpenseTotal) }}</span>
          
          <span 
            v-if="countdowns.weekly_expense_target > 0" 
            class="badge-wrap"
            :style="{
              backgroundColor: currentWeekExpenseTotal <= weeklyExpenseTargetConverted ? '#B9F7CA' : '#FFB3C6',
              border: '1.5px solid #000',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.65rem',
              fontWeight: '900',
              color: 'black'
            }"
          >
            {{ currentWeekExpenseTotal <= weeklyExpenseTargetConverted ? 'คุมงบได้ดีเยี่ยม 👍' : 'ใช้จ่ายเกินงบแล้ว ⚠️' }}
          </span>
        </div>

        <div style="font-weight: 700; font-size: 0.72rem; color: var(--color-muted);">
          ค่าเฉลี่ยรายสัปดาห์ (ประวัติ): {{ formatCurrency(actualWeeklyExpenseTotal) }}
        </div>
        <div style="font-weight: 700; font-size: 0.68rem; color: #7f8c8d; display: flex; align-items: center; gap: 4px; margin-top: 2px;">
          <span>* ไม่รวมค่าเช่าบ้าน 🏠 และเงินมัดจำ 🔑</span>
        </div>

        <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-muted); margin-top: 4px;">
          <template v-if="countdowns.weekly_expense_target <= 0">
            ⚠️ กรุณาตั้งงบเป้าหมายประจำสัปดาห์เพื่อให้ Mascot คอยเตือนความคุมงบ
          </template>
          <template v-else-if="currentWeekExpenseTotal <= weeklyExpenseTargetConverted">
            🎉 ยอดเยี่ยม! ใช้จ่ายสัปดาห์นี้ต่ำกว่าเป้าหมาย รักษาเกณฑ์นี้ไว้เพื่อคืนทุนตามแผนน้า
          </template>
          <template v-else>
            ⚠️ ยอดใช้จ่ายเกินเป้าหมาย! แนะนำให้ปรับลดค่าใช้จ่ายสัปดาห์นี้เพื่อรักษาเสถียรภาพการคืนทุน
          </template>
        </div>
      </div>
    </div>

    <!-- Weekly History Display Mode -->
    <div v-else class="neo-card" style="padding: 16px; border-width: 2px; box-shadow: 2px 2px 0px #000; background-color: #E8F5E9; max-height: 500px; display: flex; flex-direction: column;">
      <h3 class="heading-font" style="font-size: 0.85rem; margin-bottom: 12px; color: black; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 6px;">
        <span>📊 ประวัติงบประจำสัปดาห์</span>
        <span style="font-size: 0.65rem; background-color: var(--color-accent); color: black; padding: 2px 6px; border: 1.5px solid #000; border-radius: 4px; font-weight: 800;">
          ทั้งหมด {{ weeklyHistory.length }} สัปดาห์
        </span>
      </h3>

      <!-- Period guidance alert -->
      <div v-if="formattedProjectPeriodText" style="font-size: 0.7rem; font-weight: 700; color: #4b5563; background-color: #FFF9C4; border: 2px solid #000; padding: 6px 10px; border-radius: 4px; margin-bottom: 10px; box-shadow: 1.5px 1.5px 0px #000; line-height: 1.3;">
        ℹ️ ประวัตินี้คำนวณ<strong>เฉพาะรายการใช้จ่ายภายในระยะเวลาโครงการ</strong>: <span style="text-decoration: underline;">{{ formattedProjectPeriodText }}</span>
        <div style="margin-top: 4px; color: #6b7280; font-size: 0.65rem;">* ไม่รวมค่าเช่าบ้าน 🏠 และเงินมัดจำ 🔑 ในผลรวมรายสัปดาห์</div>
      </div>

      <!-- Spending Chart Box -->
      <div v-if="weeklyHistory.length > 0" style="position: relative; border: 2.5px solid #000; box-shadow: 3px 3px 0px #000; background-color: #ffffff; padding: 8px; margin-bottom: 12px; border-radius: 4px;">
        <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--color-muted); margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span>📈 แนวโน้มการใช้จ่ายรายสัปดาห์</span>
          <span style="font-size: 0.62rem; color: #555;">(ชี้ที่แท่งเพื่อดูรายละเอียด)</span>
        </div>

        <svg viewBox="0 0 500 200" width="100%" height="160" style="display: block; overflow: visible;">
          <!-- Grid lines -->
          <line x1="10" y1="20" x2="490" y2="20" stroke="#f0f0f0" stroke-width="1.5" />
          <line x1="10" y1="95" x2="490" y2="95" stroke="#f0f0f0" stroke-width="1.5" />
          <line x1="10" y1="170" x2="490" y2="170" stroke="#000000" stroke-width="2.5" />

          <!-- Y-axis max label (top-left) -->
          <text x="12" y="16" font-size="9" font-weight="900" fill="#7f8c8d" font-family="var(--font-display)">
            {{ formatCurrency(chartMaxVal) }}
          </text>

          <!-- Budget Target dashed line -->
          <line 
            v-if="weeklyExpenseTargetConverted > 0" 
            x1="10" 
            :y1="targetLineY" 
            x2="490" 
            :y2="targetLineY" 
            stroke="var(--color-error)" 
            stroke-width="2" 
            stroke-dasharray="4,4" 
          />
          <text 
            v-if="weeklyExpenseTargetConverted > 0" 
            x="485" 
            :y="targetLineY - 4" 
            text-anchor="end" 
            font-size="8" 
            font-weight="900" 
            fill="var(--color-error)"
            font-family="var(--font-display)"
          >
            งบเป้าหมาย ({{ formatCurrency(weeklyExpenseTargetConverted) }})
          </text>

          <!-- Bars -->
          <g v-for="bar in chartBars" :key="bar.key">
            <!-- Shadow for Brutalism effect -->
            <rect 
              :x="bar.x + 2" 
              :y="bar.y + 2" 
              :width="bar.width" 
              :height="bar.height" 
              fill="#000000" 
              rx="2"
            />
            <!-- Main Bar -->
            <rect 
              :x="bar.x" 
              :y="bar.y" 
              :width="bar.width" 
              :height="bar.height" 
              :fill="bar.color" 
              stroke="#000000" 
              stroke-width="2" 
              rx="2"
              style="cursor: pointer; transition: transform 0.1s ease, fill 0.1s ease;"
              @mouseover="hoveredWeek = bar"
              @mouseleave="hoveredWeek = null"
              @touchstart="hoveredWeek = bar"
            />
            
            <!-- X-axis week label -->
            <text 
              :x="bar.x + bar.width / 2" 
              y="185" 
              text-anchor="middle" 
              font-size="8.5" 
              font-weight="900" 
              fill="#2c3e50"
              font-family="var(--font-display)"
            >
              {{ bar.xLabel }}
            </text>
          </g>
        </svg>

        <!-- Chart Tooltip Card inside Chart Box -->
        <div 
          v-if="hoveredWeek" 
          class="neo-card" 
          style="position: absolute; top: 6px; right: 6px; padding: 6px 10px; border-width: 2px; box-shadow: 2px 2px 0px #000; background-color: #ffffff; z-index: 10; font-size: 0.68rem; font-weight: 800; width: 150px; line-height: 1.35; pointer-events: none;"
        >
          <div style="font-size: 0.7rem; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 3px; font-weight: 900;">
            📅 {{ hoveredWeek.rangeText }}
          </div>
          <div>ใช้: <span :style="{ color: hoveredWeek.isExceeded ? 'var(--color-error)' : '#2E7D32' }">{{ formatCurrency(hoveredWeek.spent) }}</span></div>
          <div :style="{ color: hoveredWeek.isExceeded ? 'var(--color-error)' : '#2E7D32' }">
            {{ hoveredWeek.isExceeded ? 'เกินงบ: ' : 'เหลือ: ' }} <strong>{{ formatCurrency(Math.abs(hoveredWeek.remaining)) }}</strong>
          </div>
          <div style="color: var(--color-muted); font-size: 0.58rem; margin-top: 1px;">({{ hoveredWeek.txCount }} รายการ)</div>
        </div>
      </div>

      <div v-if="weeklyHistory.length === 0" style="text-align: center; padding: 24px 8px; color: var(--color-muted); font-weight: 700; font-size: 0.8rem;">
        📭 ยังไม่มีประวัติการใช้จ่ายรายสัปดาห์
      </div>

      <div v-else style="overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px; flex-grow: 1;">
        <div 
          v-for="week in weeklyHistory" 
          :key="week.key" 
          class="neo-card" 
          style="padding: 10px; border-width: 2px; box-shadow: 1.5px 1.5px 0px #000; background-color: #ffffff; display: flex; flex-direction: column; gap: 6px;"
        >
          <!-- Date range & Status Badge -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <div style="font-weight: 800; font-size: 0.78rem; color: black;">
              📅 {{ week.rangeText }}
            </div>
            
            <span 
              v-if="week.target > 0" 
              :style="{
                backgroundColor: week.isExceeded ? '#FFB3C6' : '#B9F7CA',
                border: '1.5px solid #000',
                borderRadius: '4px',
                padding: '1px 6px',
                fontSize: '0.62rem',
                fontWeight: '900',
                color: 'black'
              }"
            >
              {{ week.isExceeded ? 'เกินงบ ⚠️' : 'คุมงบได้ 👍' }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div v-if="week.target > 0" class="neo-progress-container" style="background-color: #ffffff; border: 1.5px solid #000; height: 10px; margin: 2px 0;">
            <div 
              class="neo-progress-bar" 
              :style="{ 
                width: `${Math.min(100, week.percent)}%`,
                backgroundColor: week.spent <= week.target ? 'var(--color-income)' : 'var(--color-error)'
              }"
              style="height: 100%; transition: width 0.3s ease;"
            ></div>
          </div>

          <!-- Spending summary details -->
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; font-weight: 800; color: black;">
            <span>ใช้: {{ formatCurrency(week.spent) }}</span>
            <span v-if="week.target > 0" style="color: var(--color-muted); font-size: 0.68rem;">
              งบเป้าหมาย: {{ formatCurrency(week.target) }}
            </span>
            <span v-else style="color: var(--color-error); font-size: 0.68rem; font-weight: 800;">
              ยังไม่ตั้งเป้าหมาย
            </span>
          </div>

          <!-- Remaining or Exceeded indicators -->
          <div v-if="week.target > 0" style="font-size: 0.68rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
            <span :style="{ color: week.isExceeded ? 'var(--color-error)' : '#2E7D32' }">
              {{ week.isExceeded ? 'ใช้เกินงบไป: ' : 'คงเหลือ: ' }} 
              <strong>{{ formatCurrency(Math.abs(week.remaining)) }}</strong>
            </span>
            <span style="color: var(--color-muted); font-size: 0.62rem;">({{ week.txCount }} รายการ)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';

const showAlert = inject('showAlert');

const props = defineProps({
  countdowns: {
    type: Object,
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
    default: 0
  },
  currentWeekExpenseTotal: {
    type: Number,
    default: 0
  },
  currentWeekRangeText: {
    type: String,
    default: ''
  },
  transactions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update-countdowns']);

const isEditing = ref(false);
const editWeeklyExpenseTarget = ref(0);
const activeTab = ref('current');

// Convert value to Active Display Currency inside component
const convertToActiveCurrency = (amount, originalCurrency) => {
  const amt = parseFloat(amount);
  if (isNaN(amt)) return 0;
  if (originalCurrency === props.activeCurrency) return amt;
  
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  
  if (originalCurrency === 'USD' && props.activeCurrency === 'THB') {
    return amt * rate;
  } else if (originalCurrency === 'THB' && props.activeCurrency === 'USD') {
    return amt / rate;
  }
  return amt;
};

// Format project period text for UI guidance
const formattedProjectPeriodText = computed(() => {
  const start = props.countdowns?.project_start_date;
  const end = props.countdowns?.project_end_date;
  if (!start || !end) return '';
  const startDt = new Date(start + 'T00:00:00');
  const endDt = new Date(end + 'T00:00:00');
  const fmt = (dt) => dt.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  return `${fmt(startDt)} – ${fmt(endDt)}`;
});

// Compute weekly history from transactions
const weeklyHistory = computed(() => {
  if (!props.transactions || props.transactions.length === 0) return [];

  const groups = {};

  props.transactions.forEach(tx => {
    if (tx.type !== 'expense' || tx.category === 'rent' || tx.category === 'deposit') return;

    const txDate = new Date(tx.date + 'T00:00:00');
    if (isNaN(txDate.getTime())) return;

    // Filter by project start and end dates if defined
    if (props.countdowns?.project_start_date) {
      const projectStart = new Date(props.countdowns.project_start_date + 'T00:00:00');
      if (txDate < projectStart) return;
    }
    if (props.countdowns?.project_end_date) {
      const projectEnd = new Date(props.countdowns.project_end_date + 'T23:59:59');
      if (txDate > projectEnd) return;
    }

    // Get Monday of this date
    const day = txDate.getDay();
    const diff = (day === 0 ? -6 : 1 - day); // Mon = 1, Sun = 0
    const monday = new Date(txDate);
    monday.setDate(txDate.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const key = monday.toISOString().split('T')[0];

    if (!groups[key]) {
      groups[key] = {
        monday,
        sunday,
        spent: 0,
        txs: []
      };
    }

    const amt = parseFloat(tx.amount) || 0;
    const amountInActiveCurrency = convertToActiveCurrency(amt, tx.currency);
    groups[key].spent += amountInActiveCurrency;
    groups[key].txs.push(tx);
  });

  const historyList = Object.keys(groups).map(key => {
    const group = groups[key];
    const fmt = (dt) => dt.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    const rangeText = `${fmt(group.monday)} – ${fmt(group.sunday)}`;

    const target = weeklyExpenseTargetConverted.value;
    const isExceeded = group.spent > target;
    const remaining = target - group.spent;
    const percent = target > 0 ? (group.spent / target) * 100 : 0;

    return {
      key,
      monday: group.monday,
      sunday: group.sunday,
      rangeText,
      spent: group.spent,
      target,
      isExceeded,
      remaining,
      percent,
      txCount: group.txs.length
    };
  });

  return historyList.sort((a, b) => b.monday - a.monday);
});

const hoveredWeek = ref(null);

const weeklyHistoryChartData = computed(() => {
  // Sort ascending (oldest first) for left-to-right timeline
  return weeklyHistory.value.slice().reverse();
});

const chartMaxVal = computed(() => {
  const target = weeklyExpenseTargetConverted.value;
  const spends = weeklyHistoryChartData.value.map(w => w.spent);
  const maxSpent = spends.length > 0 ? Math.max(...spends) : 0;
  return Math.max(target, maxSpent, 10) * 1.15;
});

const getSvgY = (value) => {
  const max = chartMaxVal.value;
  if (max <= 0) return 170;
  const heightRatio = value / max;
  return 170 - (heightRatio * 150);
};

const targetLineY = computed(() => {
  return getSvgY(weeklyExpenseTargetConverted.value);
});

const chartBars = computed(() => {
  const data = weeklyHistoryChartData.value;
  const N = data.length;
  if (N === 0) return [];
  
  const chartWidth = 480;
  const barWidth = Math.max(12, Math.min(50, (chartWidth / N) * 0.6));
  const totalBarWidth = barWidth * N;
  const remainingWidth = chartWidth - totalBarWidth;
  const spacing = remainingWidth / (N + 1);

  return data.map((week, i) => {
    const x = 10 + spacing + i * (barWidth + spacing);
    const y = getSvgY(week.spent);
    const height = 170 - y;
    const isExceeded = week.spent > week.target;
    const color = isExceeded ? '#FFB3C6' : '#B9F7CA';

    const startDt = new Date(week.monday);
    const xLabel = startDt.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });

    return {
      ...week,
      x,
      y,
      width: barWidth,
      height,
      color,
      xLabel
    };
  });
});

// Sync edits when settings is opened or when props update
const syncEditTarget = () => {
  const rawVal = parseFloat(props.countdowns?.weekly_expense_target) || 0;
  if (props.activeCurrency === 'USD') {
    editWeeklyExpenseTarget.value = rawVal;
  } else {
    const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
    editWeeklyExpenseTarget.value = parseFloat((rawVal * rate).toFixed(2));
  }
};

// Sync when editing mode is toggled or countdowns prop changes
watch(isEditing, (newVal) => {
  if (newVal) {
    syncEditTarget();
  }
});

watch(() => props.countdowns, () => {
  if (isEditing.value) {
    syncEditTarget();
  }
}, { deep: true });

// Convert target value if currency switches while editing
watch(() => props.activeCurrency, (newCurrency, oldCurrency) => {
  if (!isEditing.value) return;
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  if (oldCurrency && oldCurrency !== newCurrency) {
    if (newCurrency === 'THB') {
      editWeeklyExpenseTarget.value = parseFloat((editWeeklyExpenseTarget.value * rate).toFixed(2));
    } else if (newCurrency === 'USD') {
      editWeeklyExpenseTarget.value = parseFloat((editWeeklyExpenseTarget.value / rate).toFixed(2));
    }
  }
});

// Convert target to active display currency
const weeklyExpenseTargetConverted = computed(() => {
  const amount = parseFloat(props.countdowns?.weekly_expense_target) || 0;
  if (props.activeCurrency === 'USD') return amount;
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  return amount * rate;
});

// Calculate dynamic maximum budget limit (1000 USD converted to activeCurrency)
const maxLimit = computed(() => {
  if (props.activeCurrency === 'USD') return 1000;
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  return Math.round(1000 * rate);
});

// Calculate progress percentage
const progressPercent = computed(() => {
  const target = weeklyExpenseTargetConverted.value;
  if (target <= 0) return 0;
  return (props.currentWeekExpenseTotal / target) * 100;
});

const remainingBudget = computed(() => {
  return weeklyExpenseTargetConverted.value - props.currentWeekExpenseTotal;
});

const isBudgetExceeded = computed(() => {
  return remainingBudget.value < 0;
});

const saveSettings = async () => {
  const targetVal = parseFloat(editWeeklyExpenseTarget.value) || 0;
  const max = maxLimit.value;

  if (targetVal < 0 || targetVal > max) {
    await showAlert(`เป้าหมายค่าใช้จ่ายต้องอยู่ในช่วง 0 ถึง ${max.toLocaleString()} ${props.activeCurrency} น้า!`, 'ข้อมูลไม่ถูกต้อง ⚠️');
    return;
  }

  let targetInUSD = targetVal;
  if (props.activeCurrency === 'THB') {
    const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
    targetInUSD = parseFloat((targetInUSD / rate).toFixed(2));
  }

  emit('update-countdowns', {
    nextPayday: props.countdowns.next_payday,
    payCycle: props.countdowns.pay_cycle,
    nextRentDay: props.countdowns.next_rent_day,
    rentCycle: props.countdowns.rent_cycle,
    rentAmount: props.countdowns.rent_amount,
    weeklyExpenseTarget: targetInUSD,
    projectStartDate: props.countdowns.project_start_date,
    projectEndDate: props.countdowns.project_end_date
  });
  isEditing.value = false;
};

const formatCurrency = (value) => {
  const val = parseFloat(value) || 0;
  const decimals = props.activeCurrency === 'THB' ? 0 : 2;
  const formatted = val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  if (props.activeCurrency === 'USD') {
    return `$${formatted}`;
  } else {
    return `${formatted} ฿`;
  }
};
</script>
