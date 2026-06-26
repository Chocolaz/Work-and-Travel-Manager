<template>
  <div class="stats-dashboard">
    <!-- 3D Flippable Wallet Hero Card -->
    <div class="wallet-hero-container" @click="isFlipped = !isFlipped" :class="{ 'flipped': isFlipped }">
      <div class="wallet-hero-inner">
        
        <!-- FRONT SIDE -->
        <div class="wallet-hero-front">
          <div class="hero-header">
            <div class="hero-title-group">
              <span class="sticker hero-sticker">💳</span>
              <div>
                <div class="hero-label">ยอดคงเหลือสุทธิ (Net Balance)</div>
                <div class="hero-val">{{ formatCurrency(netBalance) }}</div>
              </div>
            </div>
            <div class="hero-chip" :class="isNetBreakEven ? 'success-chip' : 'warning-chip'">
              {{ isNetBreakEven ? '🏆 คืนทุนแล้ว' : '⏳ กำลังคืนทุน' }}
            </div>
          </div>

          <div class="hero-body">
            <div class="roi-row">
              <div class="roi-label-group">
                <span class="roi-text">การคืนทุนจริง (Net ROI): <strong>{{ netRoi.toFixed(1) }}%</strong></span>
                <span class="roi-sub">ถอนทุนเฉพาะค่าโครงการ (Gross): <strong>{{ grossRoi.toFixed(1) }}%</strong></span>
              </div>
              <div class="neo-progress-container-mini">
                <div 
                  class="neo-progress-bar-mini"
                  :style="{ 
                    width: `${netRoiPercentage}%`, 
                    backgroundColor: isNetBreakEven ? 'var(--color-income)' : 'var(--color-accent)',
                    borderRightWidth: netRoiPercentage > 0 ? '2px' : '0' 
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="hero-footer">
            <span class="hero-tip-text">
              {{ isNetBreakEven ? '🎉 เก่งมาก! กระแสเงินสดสะสมเป็นบวกแล้ว' : `ยังขาดอีก ${formatCurrency(amountToNetBreakEven)} จะคืนทุนสุทธิ` }}
            </span>
            <div class="flip-hint">
              <span>🔄 แตะเพื่อดูรายละเอียดรายจ่าย</span>
            </div>
          </div>
        </div>

        <!-- BACK SIDE -->
        <div class="wallet-hero-back">
          <div class="hero-header-back">
            <h3 class="heading-font" style="margin: 0; font-size: 1.1rem; color: black;">📊 สัดส่วนรายจ่ายสะสม</h3>
            <span class="sticker hero-sticker" style="margin: 0;">📉</span>
          </div>

          <div class="breakdown-bars">
            <!-- Project Fees -->
            <div class="breakdown-item">
              <div class="breakdown-labels">
                <span class="item-name">ค่าโครงการ (Project Fees):</span>
                <span class="item-val">{{ formatCurrency(projectCostsTotal) }} ({{ projectCostWeight.toFixed(1) }}%)</span>
              </div>
              <div class="progress-bar-flat">
                <div class="progress-fill" style="background-color: var(--color-expense);" :style="{ width: `${projectCostWeight}%` }"></div>
              </div>
            </div>

            <!-- Housing -->
            <div class="breakdown-item">
              <div class="breakdown-labels">
                <span class="item-name">ค่าที่พัก & มัดจำ (Housing):</span>
                <span class="item-val">{{ formatCurrency(rentAndDepositTotal) }} ({{ rentWeight.toFixed(1) }}%)</span>
              </div>
              <div class="progress-bar-flat">
                <div class="progress-fill" style="background-color: var(--color-accent);" :style="{ width: `${rentWeight}%` }"></div>
              </div>
            </div>

            <!-- Other / Pocket Money -->
            <div class="breakdown-item">
              <div class="breakdown-labels">
                <span class="item-name">ค่ากินอยู่ & จิปาถะ (Pocket Money):</span>
                <span class="item-val">{{ formatCurrency(otherExpensesTotal) }} ({{ otherWeight.toFixed(1) }}%)</span>
              </div>
              <div class="progress-bar-flat">
                <div class="progress-fill" style="background-color: var(--color-balance);" :style="{ width: `${otherWeight}%` }"></div>
              </div>
            </div>
          </div>

          <div class="hero-footer-back">
            <span class="total-expense-sub">ยอดรายจ่ายสะสมทั้งหมด: <strong>{{ formatCurrency(totalExpenses) }}</strong></span>
            <div class="flip-hint-back">
              <span>🔄 แตะเพื่อกลับหน้าหลัก</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Core Metrics Row -->
    <div class="core-metrics-row">
      <!-- Income Card -->
      <div class="neo-card income-card" style="margin-bottom: 0;">
        <div class="neo-card-title">
          <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: white; color: black;">📈</span>
          <span>รายรับรวม (Total Earnings)</span>
        </div>
        <div class="stat-num" style="color: black;">{{ formatCurrency(totalIncome) }}</div>
        <div class="stat-sub" style="color: black;">รายได้รวมจากทุกงานที่บันทึกไว้</div>
      </div>

      <!-- Expenses Card -->
      <div class="neo-card expense-card" style="color: black; margin-bottom: 0;">
        <div class="neo-card-title">
          <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: white; color: black;">📉</span>
          <span>รายจ่ายรวม (Total Spending)</span>
        </div>
        <div class="stat-num" style="color: black;">{{ formatCurrency(totalExpenses) }}</div>
        <div class="stat-sub" style="color: black;">ยอดใช้จ่ายรวมสะสมทั้งหมด</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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

const isFlipped = ref(false);

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

const projectCostWeight = computed(() => {
  if (props.totalExpenses <= 0) return 0;
  return (props.projectCostsTotal / props.totalExpenses) * 100;
});

const rentWeight = computed(() => {
  if (props.totalExpenses <= 0) return 0;
  return (props.rentAndDepositTotal / props.totalExpenses) * 100;
});

const otherWeight = computed(() => {
  if (props.totalExpenses <= 0) return 0;
  return (props.otherExpensesTotal / props.totalExpenses) * 100;
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
</script>

<style scoped>
.stats-dashboard {
  margin-bottom: 24px;
}

.wallet-hero-container {
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: 20px;
  height: 250px;
}

.wallet-hero-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.wallet-hero-container.flipped .wallet-hero-inner {
  transform: rotateY(180deg);
}

.wallet-hero-front,
.wallet-hero-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.wallet-hero-front {
  background-color: var(--color-balance);
  color: #ffffff;
}

.wallet-hero-back {
  background-color: #ffffff;
  color: #000000;
  transform: rotateY(180deg);
}

/* Header inside hero */
.hero-header, .hero-header-back {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hero-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  opacity: 0.9;
  font-weight: 700;
}

.hero-val {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: -1px;
  text-shadow: 2px 2px 0px #000000;
}

.hero-sticker {
  font-size: 1.4rem;
  width: 38px;
  height: 38px;
  background-color: #ffffff;
  color: #000000;
  border: 2px solid #000000;
  box-shadow: 2px 2px 0px #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.hero-chip {
  padding: 4px 10px;
  border: 2px solid #000000;
  box-shadow: 2px 2px 0px #000000;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  color: #000000;
}

.success-chip {
  background-color: var(--color-income);
}

.warning-chip {
  background-color: var(--color-accent);
}

/* Body / progress bar inside hero */
.roi-row {
  margin: 10px 0;
}

.roi-label-group {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 0.8rem;
  margin-bottom: 6px;
}

.roi-text {
  text-shadow: 1px 1px 0px #000000;
}

.roi-sub {
  font-size: 0.75rem;
  opacity: 0.9;
  text-shadow: 1px 1px 0px #000000;
}

.neo-progress-container-mini {
  background-color: #ffffff;
  border: 2px solid #000000;
  box-shadow: 2px 2px 0px #000000;
  height: 14px;
  overflow: hidden;
  position: relative;
}

.neo-progress-bar-mini {
  height: 100%;
  border-right: 2px solid #000000;
  transition: width 0.4s ease;
}

/* Footer inside hero */
.hero-footer, .hero-footer-back {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1.5px dashed rgba(255, 255, 255, 0.3);
  padding-top: 8px;
}

.hero-footer-back {
  border-top: 1.5px dashed rgba(0, 0, 0, 0.15);
  color: #000000;
}

.hero-tip-text {
  font-size: 0.8rem;
  font-weight: 700;
  text-shadow: 1px 1px 0px #000000;
}

.flip-hint, .flip-hint-back {
  font-size: 0.75rem;
  font-weight: 700;
  background-color: #000000;
  color: var(--color-accent);
  padding: 4px 8px;
  border: 1.5px solid var(--color-accent);
  box-shadow: 1px 1px 0px var(--color-accent);
}

.flip-hint-back {
  color: #ffffff;
  border-color: #000000;
  box-shadow: 1px 1px 0px #000000;
}

/* Back breakdown styling */
.breakdown-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 12px 0;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.breakdown-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
}

.progress-bar-flat {
  background-color: #f3f4f6;
  border: 2px solid #000000;
  height: 10px;
  box-shadow: 1px 1px 0px #000000;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-right: 1.5px solid #000000;
  transition: width 0.4s ease;
}

/* Core Metrics Row */
.core-metrics-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .wallet-hero-container {
    height: 290px;
  }
  .hero-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  .hero-chip {
    align-self: flex-start;
  }
  .roi-label-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .core-metrics-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
