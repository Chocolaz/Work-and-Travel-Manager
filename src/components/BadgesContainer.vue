<template>
  <div class="comic-panel">
    <h2 class="heading-font" style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: var(--color-accent); color: black;">🎖️</span>
      <span>สมุดสะสมสติกเกอร์ (Badges)</span>
    </h2>

    <div class="badges-grid">
      <!-- Badge 1: Thrifty Eater -->
      <div 
        :class="['badge-item', badgeFood.earned ? 'earned' : '']"
        @click="openBadgeDetails('Thrifty Eater', '🍕', '#FED7AA', badgeFood.earned, 'ได้รับเมื่อค่าอาหารสะสมในรอบ 7 วันที่ผ่านมาน้อยกว่า $50.00', `ปัจจุบันสะสมได้: $${badgeFood.currentFoodExpense.toFixed(2)} / $50.00` )"
        style="cursor: pointer;"
      >
        <span class="sticker" style="background-color: #FED7AA;">🍕</span>
        <div class="badge-title">Thrifty Eater</div>
      </div>

      <!-- Badge 2: Goal Achieved -->
      <div 
        :class="['badge-item', badgeTrip.earned ? 'earned' : '']"
        @click="openBadgeDetails('Goal Achieved', '🗽', '#C084FC', badgeTrip.earned, 'ได้รับเมื่อยอดเงินออมสุทธิเท่ากับหรือมากกว่าเป้าหมายการออมเงิน', badgeTrip.earned ? 'สำเร็จแล้ว! 🎉' : 'กำลังสะสม... ⏳')"
        style="cursor: pointer;"
      >
        <span class="sticker" style="background-color: #C084FC;">🗽</span>
        <div class="badge-title">Goal Achieved</div>
      </div>

      <!-- Badge 3: Super Earner -->
      <div 
        :class="['badge-item', badgeEarner.earned ? 'earned' : '']"
        @click="openBadgeDetails('Super Earner', '💰', '#86EFAC', badgeEarner.earned, 'ได้รับเมื่อมีรายรับรวมจากงานหลักมากกว่า $2,000.00', `ปัจจุบันสะสมได้: $${badgeEarner.currentEarned.toFixed(2)} / $2,000.00` )"
        style="cursor: pointer;"
      >
        <span class="sticker" style="background-color: #86EFAC;">💰</span>
        <div class="badge-title">Super Earner</div>
      </div>

      <!-- Badge 4: First Paycheck -->
      <div 
        :class="['badge-item', badgeFirstPay.earned ? 'earned' : '']"
        @click="openBadgeDetails('First Paycheck', '💸', '#A7F3D0', badgeFirstPay.earned, 'ได้รับเมื่อบันทึกรายรับครั้งแรกสำเร็จ', badgeFirstPay.earned ? 'สำเร็จแล้ว! 🎉' : 'ยังไม่ได้รับเงินเดือนงวดแรก ⏳')"
        style="cursor: pointer;"
      >
        <span class="sticker" style="background-color: #A7F3D0;">💸</span>
        <div class="badge-title">First Pay</div>
      </div>

      <!-- Badge 5: Wanderlust -->
      <div 
        :class="['badge-item', badgeWanderlust.earned ? 'earned' : '']"
        @click="openBadgeDetails('Wanderlust', '✈️', '#93C5FD', badgeWanderlust.earned, 'ได้รับเมื่อบันทึกรายการท่องเที่ยวสะสมมากกว่า 3 รายการขึ้นไป', `ปัจจุบันไปเที่ยวสะสมแล้ว: ${badgeWanderlust.count} / 3 รายการ` )"
        style="cursor: pointer;"
      >
        <span class="sticker" style="background-color: #93C5FD;">✈️</span>
        <div class="badge-title">Wanderlust</div>
      </div>

      <!-- Badge 6: Big Spender -->
      <div 
        :class="['badge-item', badgeSpender.earned ? 'earned' : '']"
        @click="openBadgeDetails('Big Spender', '🛍️', '#FBCFE8', badgeSpender.earned, 'ได้รับเมื่อมียอดช้อปปิ้งสะสมมากกว่า $500.00', `ยอดช้อปปิ้งสะสมปัจจุบัน: $${badgeSpender.currentShopping.toFixed(2)} / $500.00` )"
        style="cursor: pointer;"
      >
        <span class="sticker" style="background-color: #FBCFE8;">🛍️</span>
        <div class="badge-title">Big Spender</div>
      </div>

      <!-- Badge 7: Super Saver -->
      <div 
        :class="['badge-item', badgeSaver.earned ? 'earned' : '']"
        @click="openBadgeDetails('Super Saver', '🐷', '#FDE68A', badgeSaver.earned, 'ได้รับเมื่อสัดส่วนเงินเก็บสะสมคิดเป็น 50% หรือมากกว่าของรายรับทั้งหมด', `สัดส่วนเก็บสะสมปัจจุบัน: ${badgeSaver.ratio.toFixed(1)}% / 50%` )"
        style="cursor: pointer;"
      >
        <span class="sticker" style="background-color: #FDE68A;">🐷</span>
        <div class="badge-title">Super Saver</div>
      </div>

      <!-- Badge 8: Break-even Hero -->
      <div 
        :class="['badge-item', badgeBreakEven.earned ? 'earned' : '']"
        @click="openBadgeDetails('Break-even Hero', '🏆', '#FCD34D', badgeBreakEven.earned, 'ได้รับเมื่อยอดรายรับสะสมทั้งหมดมากกว่าหรือเท่ากับค่าใช้จ่ายโครงการ (คืนทุนโครงการสำเร็จ)', badgeBreakEven.earned ? 'สำเร็จแล้ว! 🎉 คืนทุนเรียบร้อย' : `ความคืบหน้า: ${roi.toFixed(1)}% / 100%` )"
        style="cursor: pointer;"
      >
        <span class="sticker" style="background-color: #FCD34D;">🏆</span>
        <div class="badge-title">Break-Even</div>
      </div>
    </div>

    <!-- Badge Detail Modal -->
    <div v-if="selectedBadge" class="neo-modal-overlay" @click.self="closeModal">
      <div class="neo-modal-content">
        <!-- Close Button -->
        <button class="neo-modal-close" @click="closeModal">✖</button>
        
        <!-- Badge Icon & Header -->
        <div style="text-align: center; margin-bottom: 16px;">
          <span class="sticker" :style="{ backgroundColor: selectedBadge.color, width: '60px', height: '60px', fontSize: '1.8rem', display: 'inline-flex' }">
            {{ selectedBadge.emoji }}
          </span>
          <h3 class="heading-font" style="margin-top: 12px; font-size: 1.1rem; text-transform: uppercase;">{{ selectedBadge.name }}</h3>
          
          <!-- Earned Status Tag -->
          <div style="margin-top: 8px;">
            <span :class="['badge-tag', selectedBadge.earned ? 'income' : 'expense']" style="border-width: 2px; box-shadow: 2px 2px 0px #000; font-size: 0.7rem;">
              {{ selectedBadge.earned ? 'สำเร็จแล้ว / EARNED' : 'ยังไม่สำเร็จ / LOCKED' }}
            </span>
          </div>
        </div>

        <div class="comic-separator" style="margin: 12px -24px;"></div>

        <!-- Description & Details -->
        <div style="font-weight: 700; font-size: 0.8rem; color: var(--color-text); margin-bottom: 12px; text-align: left;">
          <p style="color: var(--color-muted); margin-bottom: 4px; font-size: 0.7rem; text-transform: uppercase;">เงื่อนไขการรับ:</p>
          <p style="font-size: 0.85rem;">{{ selectedBadge.description }}</p>
        </div>

        <div style="font-weight: 700; font-size: 0.8rem; color: var(--color-text); text-align: left;">
          <p style="color: var(--color-muted); margin-bottom: 4px; font-size: 0.7rem; text-transform: uppercase;">ความคืบหน้าปัจจุบัน:</p>
          <p style="background-color: #F4F4F0; border: var(--border-medium); padding: 8px 12px; font-family: var(--font-display); font-size: 0.85rem; word-break: keep-all;">
            {{ selectedBadge.progress }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  },
  netBalance: {
    type: Number,
    required: true
  },
  savingsGoal: {
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
  roi: {
    type: Number,
    required: true
  }
});

// Helper: convert amounts to USD if needed
const getAmountInUSD = (amount, currency) => {
  const amt = parseFloat(amount) || 0;
  if (currency === 'USD') return amt;
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  return amt / rate;
};

// 1. Thrifty Foodie Badge logic: Food expenses in last 7 days < $50 USD
const badgeFood = computed(() => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  let currentFoodExpense = 0;
  
  props.transactions.forEach(tx => {
    if (tx.type === 'expense' && tx.category === 'food') {
      const txDate = new Date(tx.date);
      if (txDate >= sevenDaysAgo) {
        currentFoodExpense += getAmountInUSD(tx.amount, tx.currency);
      }
    }
  });
  
  // Need to have at least one transaction to earn it (so it is not unlocked by default on an empty tracker)
  const hasFoodTx = props.transactions.some(tx => tx.category === 'food');
  const earned = hasFoodTx && currentFoodExpense < 50 && currentFoodExpense > 0;
  
  return { earned, currentFoodExpense };
});

// 2. Trip Planner Badge logic: netBalance >= savingsGoal.targetAmount (both converted to USD)
const badgeTrip = computed(() => {
  const goalAmount = parseFloat(props.savingsGoal?.targetAmount ?? props.savingsGoal?.target_amount) || 0;
  if (goalAmount <= 0) return { earned: false };
  
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  
  // Convert savingsGoal to USD
  const goalInUSD = props.savingsGoal?.currency === 'USD' 
    ? goalAmount 
    : goalAmount / rate;
     
  // Convert net balance to USD
  const balance = parseFloat(props.netBalance) || 0;
  const balanceUSD = props.activeCurrency === 'USD' 
    ? balance 
    : balance / rate;

  const earned = balanceUSD >= goalInUSD && balanceUSD > 0;
  return { earned };
});

// 3. Super Earner Badge logic: Job 1 income >= $2000 USD
const badgeEarner = computed(() => {
  let currentEarned = 0;
  props.transactions.forEach(tx => {
    if (tx.type === 'income' && tx.category === 'job1') {
      currentEarned += getAmountInUSD(tx.amount, tx.currency);
    }
  });
  
  const earned = currentEarned >= 2000;
  return { earned, currentEarned };
});

// 4. First Paycheck Badge logic: any income recorded
const badgeFirstPay = computed(() => {
  const hasIncome = props.transactions.some(tx => tx.type === 'income');
  return { earned: hasIncome };
});

// 5. Wanderlust Badge logic: travel expense transactions >= 3
const badgeWanderlust = computed(() => {
  const travelTxCount = props.transactions.filter(tx => tx.type === 'expense' && tx.category === 'travel').length;
  return { earned: travelTxCount >= 3, count: travelTxCount };
});

// 6. Big Spender Badge logic: shopping expenses >= $500 USD
const badgeSpender = computed(() => {
  let currentShopping = 0;
  props.transactions.forEach(tx => {
    if (tx.type === 'expense' && tx.category === 'shopping') {
      currentShopping += getAmountInUSD(tx.amount, tx.currency);
    }
  });
  return { earned: currentShopping >= 500, currentShopping };
});

// 7. Super Saver Badge logic: net savings ratio >= 50% of total income
const badgeSaver = computed(() => {
  let totalIncomeUSD = 0;
  props.transactions.forEach(tx => {
    if (tx.type === 'income') {
      totalIncomeUSD += getAmountInUSD(tx.amount, tx.currency);
    }
  });
  
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  const balance = parseFloat(props.netBalance) || 0;
  const balanceUSD = props.activeCurrency === 'USD' 
    ? balance 
    : balance / rate;
    
  const earned = totalIncomeUSD > 0 && (balanceUSD / totalIncomeUSD) >= 0.5;
  const ratio = totalIncomeUSD > 0 ? (balanceUSD / totalIncomeUSD) * 100 : 0;
  return { earned, ratio: Math.max(0, ratio) };
});

// 8. Break-even Hero Badge logic: roi >= 100
const badgeBreakEven = computed(() => {
  const parsedRoi = parseFloat(props.roi);
  const earned = !isNaN(parsedRoi) && parsedRoi >= 100;
  return { earned };
});

const selectedBadge = ref(null);

const openBadgeDetails = (name, emoji, color, earned, description, progress) => {
  selectedBadge.value = { name, emoji, color, earned, description, progress };
};

const closeModal = () => {
  selectedBadge.value = null;
};
</script>
