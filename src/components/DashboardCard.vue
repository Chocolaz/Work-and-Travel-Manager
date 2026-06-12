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

      <!-- Expenses excluding project costs -->
      <div style="font-size: 0.75rem; font-weight: 700; color: #FFE4E6; margin-top: 4px; border-top: 1.5px dashed rgba(255,255,255,0.4); padding-top: 6px; display: flex; justify-content: space-between;">
        <span>ไม่รวมค่าโครงการ:</span>
        <span>{{ formatCurrency(dailyExpenses) }}</span>
      </div>
      
    </div>

      <!-- ROI / Break-even Card -->
      <div :class="['neo-card', isBreakEven ? 'income-card' : 'expense-card']" style="color: black;">
        <div class="neo-card-title">
          <span class="sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: white; color: black;">
            {{ isBreakEven ? '🏆' : '⏳' }}
          </span>
          <span :style="{ color: isBreakEven ? 'black' : 'white' }">คืนทุนโครงการ (ROI)</span>
        </div>
        <div class="stat-num" :style="{ color: isBreakEven ? 'black' : 'white' }">{{ roi.toFixed(1) }}%</div>
        
        <!-- Break-even Progress Bar -->
        <div class="neo-progress-container" style="background-color: white; border-width: 2px; margin: 8px 0; height: 16px;">
          <div 
            class="neo-progress-bar" 
            :style="{ 
              width: `${roiPercentage}%`, 
              backgroundColor: isBreakEven ? 'var(--color-balance)' : 'var(--color-accent)',
              borderRightWidth: roiPercentage > 0 ? '2px' : '0' 
            }"
          ></div>
        </div>

        <div class="stat-sub" :style="{ color: isBreakEven ? 'black' : 'white' }">
          {{ isBreakEven ? '🎉 คืนทุนโครงการเรียบร้อยแล้ว!' : `ยังขาดอีก ${formatCurrency(amountToBreakEven)} จะคืนทุน` }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
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
    }
  });
  
  const isBreakEven = computed(() => props.roi >= 100);

  const roiPercentage = computed(() => {
    const parsedRoi = parseFloat(props.roi);
    return isNaN(parsedRoi) ? 0 : Math.min(100, Math.max(0, parsedRoi));
  });
  
  const amountToBreakEven = computed(() => {
    const difference = props.projectCostsTotal - props.totalIncome;
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
  </script>
