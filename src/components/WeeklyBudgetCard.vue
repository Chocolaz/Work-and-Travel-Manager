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

    <!-- Display Mode -->
    <div v-else class="neo-card" style="padding: 16px; border-width: 2px; box-shadow: 2px 2px 0px #000; background-color: #FFF9C4;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-weight: 800; font-size: 0.8rem; text-transform: uppercase; color: var(--color-muted);">
            เป้าหมายงบประมาณสัปดาห์นี้
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
            backgroundColor: actualWeeklyExpenseTotal <= weeklyExpenseTargetConverted ? 'var(--color-income)' : 'var(--color-error)'
          }"
          style="height: 100%; transition: width 0.3s ease;"
        ></div>
      </div>

      <!-- Stats Footer -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 0.8rem; color: black;">
          <span>เฉลี่ยจริงรายสัปดาห์: {{ formatCurrency(actualWeeklyExpenseTotal) }}</span>
          
          <span 
            v-if="countdowns.weekly_expense_target > 0" 
            class="badge-wrap"
            :style="{
              backgroundColor: actualWeeklyExpenseTotal <= weeklyExpenseTargetConverted ? '#B9F7CA' : '#FFB3C6',
              border: '1.5px solid #000',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.65rem',
              fontWeight: '900',
              color: 'black'
            }"
          >
            {{ actualWeeklyExpenseTotal <= weeklyExpenseTargetConverted ? 'คุมงบได้ดีเยี่ยม 👍' : 'ใช้จ่ายเกินงบแล้ว ⚠️' }}
          </span>
        </div>

        <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-muted);">
          <template v-if="countdowns.weekly_expense_target <= 0">
            ⚠️ กรุณาตั้งงบเป้าหมายประจำสัปดาห์เพื่อให้ Mascot คอยเตือนความคุมงบ
          </template>
          <template v-else-if="actualWeeklyExpenseTotal <= weeklyExpenseTargetConverted">
            🎉 ยอดเยี่ยม! ใช้จ่ายเฉลี่ยต่ำกว่าเป้าหมาย รักษาเกณฑ์นี้ไว้เพื่อคืนทุนตามแผนน้า
          </template>
          <template v-else>
            ⚠️ ยอดใช้จ่ายเกินเป้าหมาย! แนะนำให้ปรับลดค่าใช้จ่ายจิปาถะเพื่อรักษาเสถียรภาพการคืนทุน
          </template>
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
  }
});

const emit = defineEmits(['update-countdowns']);

const isEditing = ref(false);
const editWeeklyExpenseTarget = ref(0);

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
  return (props.actualWeeklyExpenseTotal / target) * 100;
});

const remainingBudget = computed(() => {
  return weeklyExpenseTargetConverted.value - props.actualWeeklyExpenseTotal;
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
