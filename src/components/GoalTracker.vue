<template>
  <div class="comic-panel">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h2 class="heading-font" style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
        <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: var(--color-income); color: black;">🎯</span>
        <span>เป้าหมายเงินออม</span>
      </h2>
      <button 
        type="button" 
        class="neo-btn secondary-btn" 
        style="padding: 4px 8px; font-size: 0.7rem; box-shadow: 2px 2px 0px #000; border-width: 2px;"
        @click="isEditing = !isEditing"
      >
        {{ isEditing ? 'ยกเลิก ❌' : 'แก้ไขเป้าหมาย ⚙️' }}
      </button>
    </div>

    <!-- Edit Mode Form -->
    <div v-if="isEditing" class="neo-card" style="padding: 16px; margin-bottom: 16px; border-width: 2px; box-shadow: 2px 2px 0px #000;">
      <form @submit.prevent="saveGoal">
        <div class="form-group">
          <label style="font-size: 0.7rem;">ชื่อเป้าหมาย</label>
          <input type="text" v-model="editTitle" required style="padding: 6px 10px; border-width: 2px;" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label style="font-size: 0.7rem;">จำนวนเงินเป้าหมาย</label>
            <input type="number" v-model.number="editAmount" min="1" required style="padding: 6px 10px; border-width: 2px;" />
          </div>
          <div class="form-group">
            <label style="font-size: 0.7rem;">สกุลเงิน</label>
            <select v-model="editCurrency" style="padding: 6px 10px; border-width: 2px;">
              <option value="USD">USD ($)</option>
              <option value="THB">THB (฿)</option>
            </select>
          </div>
        </div>
        <button type="submit" class="neo-btn income-btn" style="width: 100%; padding: 6px; font-size: 0.8rem; box-shadow: 2px 2px 0px #000; border-width: 2px; margin-top: 8px;">
          บันทึกเป้าหมาย 💾
        </button>
      </form>
    </div>

    <!-- Display Mode -->
    <div>
      <div style="font-weight: 800; font-size: 1rem; text-transform: uppercase;">
        {{ savingsGoal.title }}
      </div>
      
      <!-- Progress Bar container -->
      <div class="neo-progress-container">
        <div 
          class="neo-progress-bar" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>

      <!-- Stats text -->
      <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 0.85rem;">
        <span>เงินออมสะสม: {{ formatCurrency(savedAmount) }}</span>
        <span>เป้าหมาย: {{ formatCurrency(targetAmountActive) }}</span>
      </div>

      <div style="margin-top: 6px; margin-bottom: 8px;">
        <div v-if="netBalance <= 0" style="font-size: 0.75rem; color: var(--color-muted); font-weight: 700;">
          ⚠️ จะเริ่มสะสมเงินออมหลังจากคืนทุนแล้ว (ขาดอีก {{ formatCurrency(Math.abs(netBalance)) }})
        </div>
        <div v-else style="font-size: 0.75rem; color: #4d7c0f; font-weight: 700;">
          🎉 คืนทุนแล้ว! กำลังสะสมเงินออมเป้าหมาย
        </div>
      </div>
      
      <div class="text-center" style="font-weight: 900; font-family: var(--font-display); font-size: 1.1rem; margin-top: 10px; background-color: var(--color-accent); border: var(--border-medium); display: inline-block; padding: 4px 12px; box-shadow: 2px 2px 0px #000; transform: rotate(-1deg);">
        ความคืบหน้า: {{ progressPercentage.toFixed(1) }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  savingsGoal: {
    type: Object,
    required: true
  },
  netBalance: {
    type: Number,
    required: true
  },
  exchangeRate: {
    type: Object,
    required: true
  },
  activeCurrency: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update-goal']);

const isEditing = ref(false);
const editTitle = ref(props.savingsGoal.title);
const editAmount = ref(props.savingsGoal.targetAmount ?? props.savingsGoal.target_amount ?? 0);
const editCurrency = ref(props.savingsGoal.currency);

watch(() => props.savingsGoal, (newGoal) => {
  editTitle.value = newGoal.title;
  editAmount.value = newGoal.targetAmount ?? newGoal.target_amount ?? 0;
  editCurrency.value = newGoal.currency;
}, { deep: true });

watch(editCurrency, (newVal, oldVal) => {
  if (editAmount.value && editAmount.value > 0) {
    if (oldVal === 'USD' && newVal === 'THB') {
      editAmount.value = parseFloat((editAmount.value * props.exchangeRate.rate).toFixed(2));
    } else if (oldVal === 'THB' && newVal === 'USD') {
      editAmount.value = parseFloat((editAmount.value / props.exchangeRate.rate).toFixed(2));
    }
  }
});

// Convert target amount from goal currency into active currency
const targetAmountActive = computed(() => {
  const goalCur = props.savingsGoal?.currency || 'USD';
  const activeCur = props.activeCurrency || 'USD';
  const amount = parseFloat(props.savingsGoal?.targetAmount ?? props.savingsGoal?.target_amount) || 0;
  
  if (goalCur === activeCur) return amount;
  
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  
  if (goalCur === 'USD' && activeCur === 'THB') {
    return amount * rate;
  } else if (goalCur === 'THB' && activeCur === 'USD') {
    return amount / rate;
  }
  
  return amount;
});

// Calculate progress percentage
const progressPercentage = computed(() => {
  const target = parseFloat(targetAmountActive.value) || 0;
  if (target <= 0) return 0;
  
  const balance = parseFloat(props.netBalance) || 0;
  // Progress can't be negative, maxes out at 100%
  const pct = (balance / target) * 100;
  return isNaN(pct) ? 0 : Math.min(100, Math.max(0, pct));
});

const savedAmount = computed(() => {
  const balance = parseFloat(props.netBalance) || 0;
  return Math.max(0, isNaN(balance) ? 0 : balance);
});

const saveGoal = () => {
  const parsedVal = parseFloat(editAmount.value);
  emit('update-goal', {
    title: editTitle.value ? editTitle.value.trim() : 'เป้าหมายเงินออม',
    targetAmount: isNaN(parsedVal) ? 0 : parsedVal,
    currency: editCurrency.value || 'USD'
  });
  isEditing.value = false;
};

const formatCurrency = (value) => {
  const val = parseFloat(value) || 0;
  const decimals = props.activeCurrency === 'THB' ? 0 : 2;
  const formatted = Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  const sign = val < 0 ? '-' : '';
  
  if (props.activeCurrency === 'USD') {
    return `${sign}$${formatted}`;
  } else {
    return `${sign}${formatted} ฿`;
  }
};
</script>
