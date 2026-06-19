<template>
  <div class="comic-panel">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h2 class="heading-font" style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
        <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: var(--color-expense); color: black;">⏰</span>
        <span>เคานต์ดาวน์</span>
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
        <!-- Payday Config -->
        <h3 class="heading-font" style="font-size: 0.8rem; margin-bottom: 8px; color: var(--color-muted);">💵 ตั้งค่าวันรับเงินเดือน</h3>
        <div class="form-row" style="margin-bottom: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันรับเงินครั้งถัดไป</label>
            <input type="date" v-model="editNextPayday" :min="minDate" style="padding: 6px 10px; border-width: 2px;" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">รอบการจ่ายเงิน</label>
            <select v-model="editPayCycle" style="padding: 6px 10px; border-width: 2px;">
              <option value="weekly">ทุกสัปดาห์ (Weekly)</option>
              <option value="bi-weekly">ทุก 2 สัปดาห์ (Bi-weekly)</option>
              <option value="monthly">รายเดือน (Monthly)</option>
            </select>
          </div>
        </div>

        <!-- Rent Config -->
        <h3 class="heading-font" style="font-size: 0.8rem; margin-bottom: 8px; color: var(--color-muted); margin-top: 16px;">🏠 ตั้งค่ากำหนดชำระค่าเช่าบ้าน</h3>
        <div class="form-row" style="margin-bottom: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันจ่ายค่าเช่าครั้งถัดไป</label>
            <input type="date" v-model="editNextRentDay" :min="minDate" style="padding: 6px 10px; border-width: 2px;" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">รอบการชำระค่าเช่า</label>
            <select v-model="editRentCycle" style="padding: 6px 10px; border-width: 2px;">
              <option value="weekly">ทุกสัปดาห์ (Weekly)</option>
              <option value="bi-weekly">ทุก 2 สัปดาห์ (Bi-weekly)</option>
              <option value="monthly">รายเดือน (Monthly)</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 12px;">
          <label style="font-size: 0.65rem;">จำนวนค่าเช่าบ้านต่อรอบชำระ ({{ activeCurrency }})</label>
          <input type="number" v-model.number="editRentAmount" min="0" style="padding: 6px 10px; border-width: 2px; width: 100%; box-sizing: border-box;" />
        </div>


        <!-- Project Duration Config -->
        <h3 class="heading-font" style="font-size: 0.8rem; margin-bottom: 8px; color: var(--color-muted); margin-top: 16px;">✈️ ตั้งค่าช่วงเวลาโครงการ</h3>
        <div class="form-row" style="margin-bottom: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันเริ่มโครงการ</label>
            <input type="date" v-model="editProjectStartDate" style="padding: 6px 10px; border-width: 2px;" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันจบโครงการ</label>
            <input type="date" v-model="editProjectEndDate" style="padding: 6px 10px; border-width: 2px;" />
          </div>
        </div>

        <button type="submit" class="neo-btn" style="width: 100%; padding: 6px; font-size: 0.8rem; box-shadow: 2px 2px 0px #000; border-width: 2px; margin-top: 8px;">
          บันทึกการตั้งค่า 💾
        </button>
      </form>
    </div>

    <!-- Display Mode -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
      <!-- Payday Countdown -->
      <div class="countdown-box payday">
        <span style="font-weight: 800; font-size: 0.8rem; text-transform: uppercase;">วันรับเงินครั้งถัดไป</span>
        
        <div v-if="paydayStatus.arrived" class="countdown-alert">
          วันนี้วันเงินเดือนออก! 💰
        </div>
        <div v-else>
          <div class="countdown-num">{{ paydayStatus.timeText }}</div>
          <div style="font-size: 0.7rem; font-weight: 700; opacity: 0.8;">กำหนดวัน: {{ countdowns.next_payday || 'ยังไม่ระบุ' }}</div>
        </div>
      </div>

      <!-- Rent Countdown -->
      <div class="countdown-box housing">
        <span style="font-weight: 800; font-size: 0.8rem; text-transform: uppercase; color: white;">วันจ่ายค่าเช่าครั้งถัดไป</span>
        
        <div v-if="rentStatus.arrived" class="countdown-alert" style="background-color: var(--color-error); color: white;">
          ถึงกำหนดจ่ายค่าเช่าแล้ว! 🏠
        </div>
        <div v-else style="color: white;">
          <div class="countdown-num">{{ rentStatus.timeText }}</div>
          <div style="font-size: 0.7rem; font-weight: 700; opacity: 0.8;">
            ค่าเช่า: {{ formatCurrency(rentAmountActive) }} / {{ rentCycleText }} วันที่ {{ countdowns.next_rent_day || 'ยังไม่ระบุ' }}
          </div>
        </div>
      </div>

      <!-- J-1 Project Countdown -->
      <div class="countdown-box timeline">
        <span style="font-weight: 800; font-size: 0.8rem; text-transform: uppercase; color: black;">ระยะเวลาโครงการ J-1 ✈️</span>
        <div>
          <div class="countdown-num">{{ projectStatus.timeText }}</div>
          <div style="font-size: 0.7rem; font-weight: 700; opacity: 0.8; color: var(--color-muted);">
            {{ projectStatus.subText }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue';

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

const editNextPayday = ref(props.countdowns.next_payday || '');
const editPayCycle = ref(props.countdowns.pay_cycle || 'weekly');
const editNextRentDay = ref(props.countdowns.next_rent_day || '');
const editRentCycle = ref(props.countdowns.rent_cycle || 'weekly');
const editRentAmount = ref(150);
const editProjectStartDate = ref(props.countdowns.project_start_date || '');
const editProjectEndDate = ref(props.countdowns.project_end_date || '');

// Get tomorrow's date formatted as YYYY-MM-DD for min attribute validation
const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};
const minDate = ref(getTomorrowDateString());

// Sync Rent Amount edit value from USD to active currency
const syncEditRentAmount = () => {
  const rawVal = parseFloat(props.countdowns?.rent_amount) || 150;
  if (props.activeCurrency === 'USD') {
    editRentAmount.value = rawVal;
  } else {
    const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
    editRentAmount.value = parseFloat((rawVal * rate).toFixed(2));
  }
};

// Sync edits with props from server
watch(isEditing, (newVal) => {
  if (newVal) {
    editNextPayday.value = props.countdowns.next_payday || '';
    editPayCycle.value = props.countdowns.pay_cycle || 'weekly';
    editNextRentDay.value = props.countdowns.next_rent_day || '';
    editRentCycle.value = props.countdowns.rent_cycle || 'weekly';
    editProjectStartDate.value = props.countdowns.project_start_date || '';
    editProjectEndDate.value = props.countdowns.project_end_date || '';
    syncEditRentAmount();
  }
});

watch(() => props.countdowns, (newVal) => {
  if (isEditing.value) {
    editNextPayday.value = newVal.next_payday || '';
    editPayCycle.value = newVal.pay_cycle || 'weekly';
    editNextRentDay.value = newVal.next_rent_day || '';
    editRentCycle.value = newVal.rent_cycle || 'weekly';
    editProjectStartDate.value = newVal.project_start_date || '';
    editProjectEndDate.value = newVal.project_end_date || '';
    syncEditRentAmount();
  }
}, { deep: true });

// Convert Rent Amount target value if currency switches while editing
watch(() => props.activeCurrency, (newCurrency, oldCurrency) => {
  if (!isEditing.value) return;
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  if (oldCurrency === 'USD' && newCurrency === 'THB') {
    editRentAmount.value = parseFloat((editRentAmount.value * rate).toFixed(2));
  } else if (oldCurrency === 'THB' && newCurrency === 'USD') {
    editRentAmount.value = parseFloat((editRentAmount.value / rate).toFixed(2));
  }
});

// Convert Rent Amount to Active Display Currency
const rentAmountActive = computed(() => {
  const amount = parseFloat(props.countdowns?.rent_amount) || 0;
  // Rent is stored in USD by default in database settings
  if (props.activeCurrency === 'USD') return amount;
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  return amount * rate;
});

const rentCycleText = computed(() => {
  const cycle = props.countdowns?.rent_cycle || 'weekly';
  if (cycle === 'weekly') return 'สัปดาห์';
  if (cycle === 'bi-weekly') return '2 สัปดาห์';
  if (cycle === 'monthly') return 'เดือน';
  return cycle;
});

// Ticking logic
const now = ref(new Date());
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

// Calculate Payday Status
const paydayStatus = computed(() => {
  if (!props.countdowns?.next_payday) {
    return { arrived: false, timeText: 'ยังไม่ตั้งค่า' };
  }
  
  // Set target to end of that day (23:59:59) or midnight
  const targetDate = new Date(`${props.countdowns.next_payday}T23:59:59`);
  const diffMs = targetDate.getTime() - now.value.getTime();
  
  if (diffMs <= 0) {
    return { arrived: true, timeText: 'วันนี้!' };
  }
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  
  if (diffDays >= 1) {
    return { arrived: false, timeText: `เหลืออีก ${diffDays} วัน` };
  } else {
    const hours = diffHrs % 24;
    const minutes = diffMin % 60;
    const seconds = diffSec % 60;
    
    // Formatting with padding zeros
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return { arrived: false, timeText: `${hh}:${mm}:${ss}` };
  }
});

// Calculate Rent Status
const rentStatus = computed(() => {
  if (!props.countdowns?.next_rent_day) {
    return { arrived: false, timeText: 'ยังไม่ตั้งค่า' };
  }
  
  const targetDate = new Date(`${props.countdowns.next_rent_day}T23:59:59`);
  const diffMs = targetDate.getTime() - now.value.getTime();
  
  if (diffMs <= 0) {
    return { arrived: true, timeText: 'วันนี้!' };
  }
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  
  if (diffDays >= 1) {
    return { arrived: false, timeText: `เหลืออีก ${diffDays} วัน` };
  } else {
    const hours = diffHrs % 24;
    const minutes = diffMin % 60;
    const seconds = diffSec % 60;
    
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return { arrived: false, timeText: `${hh}:${mm}:${ss}` };
  }
});

// Calculate J-1 Project Countdown Status
// Calculate J-1 Project Countdown Status
const projectStatus = computed(() => {
  const start = props.countdowns?.project_start_date;
  const end = props.countdowns?.project_end_date;
  if (!start || !end) {
    return { status: 'unset', timeText: 'ยังไม่ตั้งค่า', subText: 'วันเริ่ม-จบโครงการ' };
  }
  
  const nowVal = now.value;
  // Use start date midnight and end date end of day
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T23:59:59`);
  
  if (nowVal < startDate) {
    const diffMs = startDate.getTime() - nowVal.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    const hours = diffHrs % 24;
    const minutes = diffMin % 60;
    const seconds = diffSec % 60;
    
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    
    return { 
      status: 'not-started', 
      timeText: `${diffDays} วัน ${hh}:${mm}:${ss}`, 
      subText: `นับถอยหลังวันเริ่มโครงการ: ${start}` 
    };
  } else if (nowVal >= startDate && nowVal <= endDate) {
    const diffMs = endDate.getTime() - nowVal.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    const hours = diffHrs % 24;
    const minutes = diffMin % 60;
    const seconds = diffSec % 60;
    
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    
    return { 
      status: 'running', 
      timeText: `${diffDays} วัน ${hh}:${mm}:${ss}`, 
      subText: `นับถอยหลังวันจบโครงการ: ${end}` 
    };
  } else {
    return { 
      status: 'ended', 
      timeText: 'สิ้นสุดแล้ว 🎓', 
      subText: `จบเมื่อ: ${end}` 
    };
  }
});

const saveSettings = async () => {
  // Validate dates: must be strictly greater than today (i.e., tomorrow onwards)
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (editNextPayday.value && editNextPayday.value <= todayStr) {
    await showAlert('วันรับเงินครั้งถัดไป ต้องมากกว่าวันปัจจุบัน (กรุณาเลือกตั้งแต่วันพรุ่งนี้เป็นต้นไป)', 'ข้อมูลไม่ถูกต้อง ⚠️');
    return;
  }
  if (editNextRentDay.value && editNextRentDay.value <= todayStr) {
    await showAlert('วันจ่ายค่าเช่าครั้งถัดไป ต้องมากกว่าวันปัจจุบัน (กรุณาเลือกตั้งแต่วันพรุ่งนี้เป็นต้นไป)', 'ข้อมูลไม่ถูกต้อง ⚠️');
    return;
  }

  if (editProjectStartDate.value && editProjectEndDate.value && editProjectStartDate.value >= editProjectEndDate.value) {
    await showAlert('วันเริ่มโครงการต้องเกิดก่อนวันจบโครงการน้า!', 'ข้อมูลไม่ถูกต้อง ⚠️');
    return;
  }

  let rentUSD = parseFloat(editRentAmount.value) || 0;
  if (props.activeCurrency === 'THB') {
    const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
    rentUSD = parseFloat((rentUSD / rate).toFixed(2));
  }

  emit('update-countdowns', {
    nextPayday: editNextPayday.value,
    payCycle: editPayCycle.value,
    nextRentDay: editNextRentDay.value,
    rentCycle: editRentCycle.value,
    rentAmount: rentUSD,
    weeklyExpenseTarget: props.countdowns.weekly_expense_target || 0,
    projectStartDate: editProjectStartDate.value,
    projectEndDate: editProjectEndDate.value
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
