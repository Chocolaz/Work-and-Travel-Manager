<template>
  <div class="auth-container" style="max-width: 600px; margin: 0 auto; width: 100%;">
    <div class="auth-card" style="max-width: 100%; transform: none;">
      <div class="auth-header">
        <span class="sticker" style="font-size: 2.5rem; width: 70px; height: 70px; background-color: var(--color-accent); color: black;">🗺️</span>
        <h1 class="heading-font" style="margin-top: 16px; font-size: 1.5rem;">SETUP YOUR JOURNEY!</h1>
        <p style="font-weight: 700; font-size: 0.85rem; color: var(--color-muted); margin-top: 4px;">
          ตั้งค่าข้อมูลเริ่มต้นสำหรับบัญชี Work & Travel ของคุณ
        </p>
      </div>

      <!-- Step Indicators -->
      <div class="neo-tabs" style="justify-content: center; margin-bottom: 24px;">
        <div 
          v-for="s in 4" 
          :key="s" 
          :class="['neo-tab-btn', step === s ? 'active' : '']"
          style="cursor: default; pointer-events: none; border-width: 2px; padding: 6px 12px; font-size: 0.75rem;"
        >
          STEP {{ s }}
        </div>
      </div>

      <!-- STEP 1: Exchange Rate & Base Currency -->
      <div v-if="step === 1" class="step-content">
        <h2 class="heading-font" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="sticker" style="font-size: 0.9rem; width: 24px; height: 24px; background-color: white;">💱</span>
          <span>1. ตั้งค่าอัตราแลกเปลี่ยนและสกุลเงิน</span>
        </h2>
        <p style="font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--color-muted);">
          ระบุอัตราแลกเปลี่ยนเริ่มต้นและสกุลเงินหลักที่คุณต้องการใช้แสดงผลบนแดชบอร์ด
        </p>

        <div class="form-group">
          <label>อัตราแลกเปลี่ยนอ้างอิง (1 USD = ? THB)</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <input 
              type="number" 
              v-model.number="rate" 
              step="0.01" 
              min="1" 
              required
            />
            <button 
              type="button" 
              class="neo-btn secondary-btn"
              style="padding: 10px 14px; font-size: 0.8rem; white-space: nowrap;"
              @click="fetchLiveRate"
              :disabled="isFetchingRate"
            >
              {{ isFetchingRate ? 'กำลังดึงข้อมูล...' : 'ดึงค่าเงินล่าสุด 🔄' }}
            </button>
          </div>
        </div>

        <div class="form-group" style="margin-top: 20px;">
          <label>สกุลเงินหลักที่ใช้แสดงผล</label>
          <div style="display: flex; gap: 12px;">
            <button 
              type="button" 
              :class="['neo-btn', activeCurrency === 'USD' ? 'balance-btn' : 'secondary-btn']"
              style="flex: 1; padding: 12px; font-size: 0.9rem;"
              @click="activeCurrency = 'USD'"
            >
              USD ($) - ดอลลาร์สหรัฐ
            </button>
            <button 
              type="button" 
              :class="['neo-btn', activeCurrency === 'THB' ? 'balance-btn' : 'secondary-btn']"
              style="flex: 1; padding: 12px; font-size: 0.9rem;"
              @click="activeCurrency = 'THB'"
            >
              THB (฿) - เงินบาทไทย
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 2: Savings Goal Settings -->
      <div v-if="step === 2" class="step-content">
        <h2 class="heading-font" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="sticker" style="font-size: 0.9rem; width: 24px; height: 24px; background-color: white;">🎯</span>
          <span>2. เป้าหมายการออมเงิน (Savings Goal)</span>
        </h2>
        <p style="font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--color-muted);">
          ตั้งเป้าหมายสำหรับการออมเงินหลังจากที่เริ่มได้กำไร (คืนทุนค่าโครงการเรียบร้อยแล้ว) เช่น ไปเที่ยวต่างรัฐ ช้อปปิ้ง หรือซื้อของกลับไทย
        </p>

        <div class="form-group">
          <label>ชื่อเป้าหมาย</label>
          <input 
            type="text" 
            v-model="goalTitle" 
            placeholder="เช่น Road Trip to Grand Canyon! 🏞️" 
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>จำนวนเงินเป้าหมาย</label>
            <input 
              type="number" 
              v-model.number="goalAmount" 
              min="0" 
              placeholder="เช่น 2500" 
              required
            />
          </div>
          <div class="form-group">
            <label>สกุลเงิน</label>
            <select v-model="goalCurrency">
              <option value="USD">USD ($)</option>
              <option value="THB">THB (฿)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- STEP 3: Project Costs Input -->
      <div v-if="step === 3" class="step-content">
        <h2 class="heading-font" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="sticker" style="font-size: 0.9rem; width: 24px; height: 24px; background-color: white;">💵</span>
          <span>3. บันทึกค่าใช้จ่ายโครงการ</span>
        </h2>
        <p style="font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--color-muted);">
          ระบุค่าใช้จ่ายโครงการจริงที่คุณจ่ายไปแล้ว สามารถเพิ่ม ลบ หรือแก้ไขข้อมูลต่างๆ ได้ตามต้องการ
        </p>

        <div style="max-height: 280px; overflow-y: auto; padding-right: 4px; margin-bottom: 16px;">
          <div 
            v-for="(cost, index) in initialCosts" 
            :key="cost.id"
            class="neo-card"
            style="padding: 12px; margin-bottom: 12px; border-width: 2px; box-shadow: 2px 2px 0px #000; background-color: #FAF9F5;"
          >
            <div class="form-group" style="margin-bottom: 8px;">
              <label style="font-size: 0.7rem;">รายการ</label>
              <input 
                type="text" 
                v-model="cost.name" 
                placeholder="ชื่อค่าใช้จ่าย เช่น ค่าวีซ่า" 
                required
                style="padding: 6px 10px; border-width: 2px;"
              />
            </div>

            <div class="form-row" style="margin-bottom: 0;">
              <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.7rem;">จำนวนเงิน</label>
                <input 
                  type="number" 
                  v-model.number="cost.amount" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00"
                  required
                  style="padding: 6px 10px; border-width: 2px;"
                />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.7rem;">สกุลเงิน</label>
                <select :value="cost.currency" @change="changeCostCurrency(cost, $event.target.value)" style="padding: 6px 10px; border-width: 2px;">
                  <option value="THB">THB (฿)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <button 
              type="button" 
              class="neo-btn danger-btn" 
              style="padding: 4px 10px; font-size: 0.7rem; box-shadow: 2px 2px 0px #000; margin-top: 12px; border-width: 2px;" 
              @click="removeCostItem(index)"
            >
              ลบรายการ 🗑️
            </button>
          </div>
        </div>

        <button 
          type="button" 
          class="neo-btn secondary-btn" 
          style="width: 100%; padding: 10px; font-size: 0.85rem;" 
          @click="addCostItem"
        >
          เพิ่มค่าใช้จ่ายโครงการใหม่ ➕
        </button>
      </div>

      <!-- STEP 4: Countdowns Config -->
      <div v-if="step === 4" class="step-content">
        <h2 class="heading-font" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="sticker" style="font-size: 0.9rem; width: 24px; height: 24px; background-color: white;">⏰</span>
          <span>4. ตั้งค่าวันรับเงินและค่าเช่าบ้าน</span>
        </h2>
        <p style="font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--color-muted);">
          กำหนดวันเวลาสำหรับการแจ้งเตือนและการนับถอยหลังในการใช้ชีวิตต่างแดน
        </p>

        <!-- Payday settings -->
        <h3 class="heading-font" style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 8px;">💵 ตั้งค่าวันรับเงินเดือนรอบถัดไป</h3>
        <div class="form-row" style="margin-bottom: 16px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันรับเงินครั้งถัดไป</label>
            <input type="date" v-model="nextPayday" :min="minDate" style="padding: 6px 10px; border-width: 2px;" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">รอบการจ่ายเงิน</label>
            <select v-model="payCycle" style="padding: 6px 10px; border-width: 2px;">
              <option value="weekly">ทุกสัปดาห์ (Weekly)</option>
              <option value="bi-weekly">ทุก 2 สัปดาห์ (Bi-weekly)</option>
              <option value="monthly">รายเดือน (Monthly)</option>
            </select>
          </div>
        </div>

        <!-- Rent settings -->
        <h3 class="heading-font" style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 8px; margin-top: 16px;">🏠 ตั้งค่ากำหนดชำระค่าเช่าบ้าน</h3>
        <div class="form-row" style="margin-bottom: 16px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันจ่ายค่าเช่าครั้งถัดไป</label>
            <input type="date" v-model="nextRentDay" :min="minDate" style="padding: 6px 10px; border-width: 2px;" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">ค่าเช่าบ้านรายสัปดาห์ (USD)</label>
            <input type="number" v-model.number="rentAmount" min="0" style="padding: 6px 10px; border-width: 2px;" />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="comic-separator"></div>

      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <button 
          v-if="step > 1"
          type="button" 
          class="neo-btn secondary-btn tilted-left"
          style="flex: 1; padding: 12px;"
          @click="prevStep"
        >
          ⬅️ ย้อนกลับ
        </button>
        
        <button 
          v-if="step < 4"
          type="button" 
          class="neo-btn tilted-right"
          style="flex: 1.5; padding: 12px;"
          @click="nextStep"
        >
          ถัดไป ➡️
        </button>
        
        <button 
          v-else
          type="button" 
          class="neo-btn income-btn tilted-right"
          style="flex: 1.5; padding: 12px;"
          @click="finishSetup"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'เสร็จสิ้นการตั้งค่า 🚀' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject } from 'vue';

const showAlert = inject('showAlert');

const props = defineProps({
  token: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['onboarding-complete', 'change-currency']);

const step = ref(1);
const isFetchingRate = ref(false);
const isSubmitting = ref(false);

// Step 1: Exchange Rate & Display currency
const rate = ref(35.00);
const activeCurrency = ref('USD');

// Step 2: Goal settings
const goalTitle = ref('เก็บเงินเที่ยว Road Trip! 🏞️');
const goalAmount = ref(1500);
const goalCurrency = ref('USD');

watch(goalCurrency, (newVal, oldVal) => {
  if (goalAmount.value && goalAmount.value > 0) {
    if (oldVal === 'USD' && newVal === 'THB') {
      goalAmount.value = parseFloat((goalAmount.value * rate.value).toFixed(2));
    } else if (oldVal === 'THB' && newVal === 'USD') {
      goalAmount.value = parseFloat((goalAmount.value / rate.value).toFixed(2));
    }
  }
});

// Step 3: Project Costs setup (custom checkbox seeding)
const initialCosts = ref([
  { id: `pc-0-${Math.random().toString(36).substring(2, 6)}`, name: 'ค่าธรรมเนียมโครงการ', amount: 68000.0, currency: 'THB' },
  { id: `pc-1-${Math.random().toString(36).substring(2, 6)}`, name: 'ค่าตั๋วเครื่องบิน', amount: 42000.0, currency: 'THB' }
]);

const changeCostCurrency = (cost, newCurrency) => {
  const oldCurrency = cost.currency;
  if (oldCurrency !== newCurrency) {
    if (cost.amount && cost.amount > 0) {
      if (oldCurrency === 'USD' && newCurrency === 'THB') {
        cost.amount = parseFloat((cost.amount * rate.value).toFixed(2));
      } else if (oldCurrency === 'THB' && newCurrency === 'USD') {
        cost.amount = parseFloat((cost.amount / rate.value).toFixed(2));
      }
    }
    cost.currency = newCurrency;
  }
};

const addCostItem = () => {
  initialCosts.value.push({
    id: `pc-${Math.random().toString(36).substring(2, 6)}`,
    name: 'ค่าใช้จ่ายโครงการใหม่',
    amount: 0,
    currency: 'THB'
  });
};

const removeCostItem = (index) => {
  initialCosts.value.splice(index, 1);
};

// Step 4: Countdowns setup
const nextPayday = ref('');
const payCycle = ref('weekly');
const nextRentDay = ref('');
const rentAmount = ref(150);

// Get tomorrow's date formatted as YYYY-MM-DD for min attribute validation
const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};
const minDate = ref(getTomorrowDateString());

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const nextStep = () => {
  if (step.value < 4) step.value++;
};

const fetchLiveRate = async () => {
  isFetchingRate.value = true;
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch rate');
    const data = await response.json();
    const thbRate = data.rates.THB;
    if (thbRate) {
      rate.value = parseFloat(thbRate.toFixed(2));
    }
  } catch (e) {
    await showAlert('Could not fetch live rate. Using manual input.', 'แจ้งเตือน 📢');
  } finally {
    isFetchingRate.value = false;
  }
};

const finishSetup = async () => {
  // Validate dates: must be strictly greater than today (i.e., tomorrow onwards)
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (nextPayday.value && nextPayday.value <= todayStr) {
    await showAlert('วันรับเงินครั้งถัดไป ต้องมากกว่าวันปัจจุบัน (กรุณาเลือกตั้งแต่วันพรุ่งนี้เป็นต้นไป)', 'ข้อมูลไม่ถูกต้อง ⚠️');
    return;
  }
  if (nextRentDay.value && nextRentDay.value <= todayStr) {
    await showAlert('วันจ่ายค่าเช่าครั้งถัดไป ต้องมากกว่าวันปัจจุบัน (กรุณาเลือกตั้งแต่วันพรุ่งนี้เป็นต้นไป)', 'ข้อมูลไม่ถูกต้อง ⚠️');
    return;
  }

  isSubmitting.value = true;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${props.token}`
  };

  try {
    // 1. Save Exchange Rate
    await fetch('/api/exchange-rate', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ rate: rate.value })
    });

    // 2. Save Savings Goal
    await fetch('/api/goals', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        title: goalTitle.value,
        targetAmount: goalAmount.value,
        currency: goalCurrency.value
      })
    });

    // 3. Save Project Costs
    const preparedCosts = initialCosts.value.map((cost, idx) => ({
      id: cost.id || `pc-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: cost.name,
      amount: cost.amount || 0,
      currency: cost.currency
    }));
    
    await fetch('/api/project-costs', {
      method: 'PUT',
      headers,
      body: JSON.stringify(preparedCosts)
    });

    // 4. Save Countdowns
    await fetch('/api/countdowns', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        nextPayday: nextPayday.value,
        payCycle: payCycle.value,
        nextRentDay: nextRentDay.value,
        rentAmount: rentAmount.value
      })
    });

    // 5. Update user onboarding status to 1
    const onboardRes = await fetch('/api/auth/onboarded', {
      method: 'PUT',
      headers
    });
    
    if (!onboardRes.ok) throw new Error('Failed to complete onboarding');

    // Notify App.vue of active currency choice
    emit('change-currency', activeCurrency.value);
    
    // Complete onboarding
    emit('onboarding-complete');
  } catch (e) {
    console.error('Onboarding submit error:', e);
    await showAlert(`Error during setup: ${e.message}`, 'เกิดข้อผิดพลาด ❌');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
