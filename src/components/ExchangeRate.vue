<template>
  <div class="settings-bar">
    <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
      <div>
        <span class="badge-tag project" style="margin-right: 8px;">RATE</span>
        <span style="font-weight: 800;">1 USD = </span>
      </div>
      
      <div class="rate-editor">
        <input 
          type="number" 
          v-model="rateInput" 
          step="0.01" 
          min="1" 
          @change="handleManualRateChange"
          style="width: 100px; font-weight: 800;"
        />
        <span style="font-weight: 800;">THB</span>
      </div>

      <button 
        type="button" 
        class="neo-btn secondary-btn" 
        style="padding: 6px 12px; font-size: 0.75rem; box-shadow: 2px 2px 0px #000;" 
        @click="fetchRealtimeRate"
        :disabled="isFetching"
      >
        {{ isFetching ? 'กำลังดึงข้อมูล... 🔄' : 'ดึงอัตราแลกเปลี่ยนล่าสุด 🔄' }}
      </button>

      <div style="font-size: 0.75rem; color: var(--color-muted); font-weight: 700;">
        อัปเดตล่าสุด: {{ formatDate(exchangeRate.lastUpdated || exchangeRate.last_updated) }}
      </div>
    </div>

    <!-- Currency Switcher Toggle -->
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-weight: 800; font-size: 0.8rem; text-transform: uppercase;">แสดงผลสกุลเงิน:</span>
      <div class="currency-swapper">
        <button 
          @click="setCurrency('USD')" 
          :class="['currency-btn', activeCurrency === 'USD' ? 'active' : '']"
        >
          USD
        </button>
        <button 
          @click="setCurrency('THB')" 
          :class="['currency-btn', activeCurrency === 'THB' ? 'active' : '']"
        >
          THB
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject } from 'vue';

const showAlert = inject('showAlert');

const props = defineProps({
  exchangeRate: {
    type: Object,
    required: true
  },
  activeCurrency: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update-rate', 'change-currency']);

const rateInput = ref(props.exchangeRate.rate);
const isFetching = ref(false);

// Watch for changes in prop from parent (e.g. if loaded from DB)
watch(() => props.exchangeRate.rate, (newRate) => {
  rateInput.value = newRate;
});

const handleManualRateChange = () => {
  if (rateInput.value && rateInput.value > 0) {
    emit('update-rate', parseFloat(rateInput.value));
  }
};

const setCurrency = (currency) => {
  emit('change-currency', currency);
};

const fetchRealtimeRate = async () => {
  isFetching.value = true;
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('API fetch failed');
    const data = await response.json();
    const thbRate = data.rates.THB;
    if (thbRate) {
      rateInput.value = parseFloat(thbRate.toFixed(2));
      emit('update-rate', rateInput.value);
    }
  } catch (err) {
    await showAlert('ไม่สามารถดึงข้อมูลอัตราแลกเปลี่ยนจริงได้ กำลังใช้อัตราแลกเปลี่ยนปัจจุบัน', 'เกิดข้อผิดพลาด ❌');
    console.error('Error fetching rate:', err);
  } finally {
    isFetching.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Never';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', { 
      hour12: false,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
};
</script>
