<template>
  <div class="stats-grid">
    <!-- Balance Card -->
    <div class="neo-card balance-card">
      <div class="neo-card-title">
        <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: var(--color-accent); color: black;">💵</span>
        <span>ยอดคงเหลือ</span>
      </div>
      <div class="stat-num">{{ formatCurrency(netBalance) }}</div>
      <div class="stat-sub">เงินที่เหลือสำหรับทริปและช้อปปิ้ง</div>
    </div>

    <!-- Income Card -->
    <div class="neo-card income-card">
      <div class="neo-card-title">
        <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: white; color: black;">📈</span>
        <span>รายรับรวม</span>
      </div>
      <div class="stat-num" style="color: black;">{{ formatCurrency(totalIncome) }}</div>
      <div class="stat-sub" style="color: black;">รายได้รวมจากทุกงานที่ทำ</div>
    </div>

    <!-- Expenses Card -->
    <div class="neo-card expense-card">
      <div class="neo-card-title">
        <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: white; color: black;">📉</span>
        <span>รายจ่ายรวม</span>
      </div>
      <div class="stat-num" style="color: white;">{{ formatCurrency(totalExpenses) }}</div>
            <div class="stat-sub" style="color: white; margin-top: 4px;">รวมค่าโครงการและค่าใช้จ่ายอื่นๆ</div>

      <!-- Expenses Breakdown -->
      <div style="font-size: 0.72rem; font-weight: 700; color: #FFE4E6; margin-top: 6px; border-top: 1.5px dashed rgba(255,255,255,0.4); padding-top: 6px; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between;">
          <span>ค่าโครงการสะสม:</span>
          <span>{{ formatCurrency(projectCostsTotal) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>ค่าบ้าน & มัดจำสะสม:</span>
          <span>{{ formatCurrency(rentAndDepositTotal) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>ค่ากินอยู่ & อื่นๆ สะสม:</span>
          <span>{{ formatCurrency(otherExpensesTotal) }}</span>
        </div>
      </div>
      
    </div>

      <!-- ROI / Break-even Card -->
      <div :class="['neo-card', isNetBreakEven ? 'income-card' : 'expense-card']" style="color: black; overflow: visible !important;">
        <div class="neo-card-title">
          <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: white; color: black;">
            {{ isNetBreakEven ? '🏆' : '⏳' }}
          </span>
          <span :style="{ color: isNetBreakEven ? 'black' : 'white' }" style="display: inline-flex; align-items: center; gap: 6px;">
            <span>การคืนทุนจริง (Net ROI)</span>
            <span 
              class="roi-info-btn"
              @click.stop="toggleTooltip"
              style="cursor: pointer; font-size: 0.85rem; opacity: 0.85; position: relative; z-index: 10;"
              :style="{ color: isNetBreakEven ? 'black' : '#FFF' }"
            >
              ℹ️
              <!-- Popover Tooltip -->
              <span v-if="showTooltip" class="roi-tooltip-content">
                <strong>วิเคราะห์การคืนทุนโครงการ (ROI)</strong><br/>
                แบ่งเป็น 2 รูปแบบเพื่อความแม่นยำ:<br/><br/>
                1. <strong>คืนทุนสุทธิ (Net ROI)</strong>: คิดจาก รายรับ / รายจ่ายทั้งหมด (ค่าโครงการ + ค่ากินอยู่). ถ้าเกิน 100% แปลว่ากระแสเงินสดเป็นบวกจริง 💚<br/>
                2. <strong>ถอนทุนโครงการ (Gross ROI)</strong>: คิดจาก รายรับ / ค่าโครงการเท่านั้น (ไม่รวมค่ากินอยู่) เพื่อวัดการทำเงินคืนเทียบทุนสมัคร ⚡
              </span>
            </span>
          </span>
        </div>
        <div class="stat-num" :style="{ color: isNetBreakEven ? 'black' : 'white' }">{{ netRoi.toFixed(1) }}%</div>
        
        <!-- Break-even Progress Bar -->
        <div class="neo-progress-container" style="background-color: white; border-width: 2px; margin: 8px 0; height: 16px;">
          <div 
            class="neo-progress-bar" 
            :style="{ 
              width: `${netRoiPercentage}%`, 
              backgroundColor: isNetBreakEven ? 'var(--color-balance)' : 'var(--color-accent)',
              borderRightWidth: netRoiPercentage > 0 ? '2px' : '0' 
            }"
          ></div>
        </div>

        <div class="stat-sub" :style="{ color: isNetBreakEven ? 'black' : 'white' }" style="margin-bottom: 8px;">
          {{ isNetBreakEven ? '🎉 คืนทุนรายจ่ายและค่าโครงการครบแล้ว!' : `ยังขาดอีก ${formatCurrency(amountToNetBreakEven)} จะคืนทุนสุทธิ` }}
        </div>

        <!-- Secondary Gross ROI Section -->
        <div 
          style="font-size: 0.72rem; font-weight: 700; margin-top: 6px; border-top: 1.5px dashed rgba(0,0,0,0.18); padding-top: 6px; display: flex; justify-content: space-between; align-items: center;"
          :style="{ color: isNetBreakEven ? 'black' : '#FFE4E6', borderTopColor: isNetBreakEven ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.3)' }"
        >
          <span>ถอนทุนเฉพาะค่าโครงการ (Gross):</span>
          <span>{{ grossRoi.toFixed(1) }}%</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  
  const props = defineProps({
    totalIncome: {
      type: Number,
      required: true
    },
    totalExpenses: {
      type: Number,
      required: true
    },
    dailyExpenses: {
      type: Number,
      required: true
    },
    netBalance: {
      type: Number,
      required: true
    },
    roi: {
      type: Number,
      required: true
    },
    projectCostsTotal: {
      type: Number,
      required: true
    },
    activeCurrency: {
      type: String,
      required: true
    },
    rentAndDepositTotal: {
      type: Number,
      required: true
    },
    otherExpensesTotal: {
      type: Number,
      required: true
    }
  });
  
  const grossRoi = computed(() => {
    return props.roi;
  });

  const netRoi = computed(() => {
    if (props.totalExpenses <= 0) return 0;
    const pct = (props.totalIncome / props.totalExpenses) * 100;
    return isNaN(pct) ? 0 : pct;
  });

  const isNetBreakEven = computed(() => netRoi.value >= 100);

  const netRoiPercentage = computed(() => {
    return Math.min(100, Math.max(0, netRoi.value));
  });
  
  const amountToNetBreakEven = computed(() => {
    const difference = props.totalExpenses - props.totalIncome;
    return difference > 0 ? difference : 0;
  });
  
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

  const showTooltip = ref(false);
  const toggleTooltip = () => {
    showTooltip.value = !showTooltip.value;
  };

  const closeTooltip = (e) => {
    if (!e.target.closest('.roi-info-btn')) {
      showTooltip.value = false;
    }
  };

  onMounted(() => {
    window.addEventListener('click', closeTooltip);
  });

  onUnmounted(() => {
    window.removeEventListener('click', closeTooltip);
  });
  </script>

<style scoped>
.roi-info-btn {
  display: inline-block;
  user-select: none;
}
.roi-tooltip-content {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  background-color: #000000;
  color: #FFE135;
  border: 2px solid #000000;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
  padding: 10px 12px;
  font-size: 0.72rem;
  font-family: var(--font-body);
  font-weight: 700;
  width: 250px;
  border-radius: 4px;
  z-index: 100;
  text-align: left;
  line-height: 1.4;
  white-space: normal;
  pointer-events: auto;
}
.roi-tooltip-content::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent #000000 transparent;
}
</style>
