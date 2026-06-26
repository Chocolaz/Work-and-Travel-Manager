<template>
  <div class="comic-panel">
    <!-- Tabs for Form Modes -->
    <div class="neo-tabs">
      <button 
        type="button" 
        :class="['neo-tab-btn', activeTab === 'add-tx' ? 'active' : '']" 
        @click="activeTab = 'add-tx'"
      >
        ➕ บันทึกรายวัน
      </button>
      <button 
        type="button" 
        :class="['neo-tab-btn', activeTab === 'edit-costs' ? 'active' : '']" 
        @click="activeTab = 'edit-costs'"
      >
        🛠️ ค่าใช้จ่ายโครงการ
      </button>
    </div>

    <!-- Mode 1: Add Transaction Form -->
    <div v-if="activeTab === 'add-tx'">
      <h2 class="heading-font" style="font-size: 0.95rem; margin-bottom: 12px;">บันทึกรายการใหม่</h2>
      
      <form @submit.prevent="submitTransaction">
        <div class="form-row">
          <!-- Type Selection -->
          <div class="form-group">
            <label for="tx-type">ประเภท (Type)</label>
            <select id="tx-type" v-model="txType" @change="handleTypeChange">
              <option value="expense">รายจ่าย 📉</option>
              <option value="income">รายรับ 📈</option>
            </select>
          </div>

          <!-- Date Input -->
          <div class="form-group">
            <label for="tx-date">วันที่ (Date)</label>
            <input type="date" id="tx-date" v-model="txDate" required />
          </div>
        </div>

        <!-- Category Selection (Visual Chips Grid) -->
        <div class="form-group" style="margin-bottom: 14px;">
          <label style="font-size: 0.75rem; font-weight: bold; margin-bottom: 6px; display: block;">หมวดหมู่ (Category)</label>
          <div class="category-grid">
            <button
              v-for="cat in categories"
              :key="cat.value"
              type="button"
              :class="[
                'category-chip',
                txCategory === cat.value ? 'active' : '',
                txCategory === cat.value ? (txType === 'income' ? 'income-active' : 'expense-active') : ''
              ]"
              @click="txCategory = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div class="form-row">
          <!-- Amount Input -->
          <div class="form-group">
            <label for="tx-amount">จำนวนเงิน (Amount)</label>
            <input 
              type="number" 
              id="tx-amount" 
              v-model="txAmount" 
              step="0.01" 
              min="0.01" 
              placeholder="0.00" 
              required
            />
          </div>

          <!-- Currency Selection -->
          <div class="form-group">
            <label for="tx-currency">สกุลเงิน (Currency)</label>
            <select id="tx-currency" v-model="txCurrency">
              <option value="USD">USD ($)</option>
              <option value="THB">THB (฿)</option>
            </select>
          </div>
        </div>

        <!-- Note Input -->
        <div class="form-group" style="margin-bottom: 14px;">
          <label for="tx-note">บันทึกเพิ่มเติม (Note)</label>
          <input type="text" id="tx-note" v-model="txNote" placeholder="รายละเอียดรายการ..." />
        </div>

        <button type="submit" class="neo-btn income-btn tilted-right" style="width: 100%; padding: 8px; font-size: 0.8rem;">
          บันทึกข้อมูล ➕
        </button>
      </form>
    </div>

    <!-- Mode 2: Edit Project Costs Form -->
    <div v-if="activeTab === 'edit-costs'">
      <h2 class="heading-font" style="font-size: 0.95rem; margin-bottom: 12px;">จัดการค่าโครงการ</h2>
      
      <div style="max-height: 350px; overflow-y: auto; padding-right: 4px; margin-bottom: 12px;">
        <div 
          v-for="(cost, index) in localCosts" 
          :key="cost.id" 
          class="neo-card" 
          style="padding: 10px 12px; margin-bottom: 8px; box-shadow: 2px 2px 0px #000; border-width: 2px;"
        >
          <div class="form-group" style="margin-bottom: 6px;">
            <label style="font-size: 0.7rem;">รายการ</label>
            <input type="text" v-model="cost.name" placeholder="Item Name" required style="padding: 6px 10px; border-width: 2px;" />
          </div>

          <div class="form-row" style="margin-bottom: 0;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.7rem;">จำนวนเงิน</label>
              <input type="number" v-model.number="cost.amount" step="0.01" min="0" placeholder="0" required style="padding: 6px 10px; border-width: 2px;" />
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
            style="padding: 4px 10px; font-size: 0.7rem; box-shadow: 2px 2px 0px #000; margin-top: 8px; border-width: 2px;" 
            @click="removeCostItem(index)"
          >
            ลบรายการ 🗑️
          </button>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button 
          type="button" 
          class="neo-btn secondary-btn tilted-left" 
          style="flex: 1; padding: 8px; font-size: 0.75rem;" 
          @click="addCostItem"
        >
          เพิ่มรายการใหม่ ➕
        </button>
        <button 
          type="button" 
          class="neo-btn" 
          style="flex: 1.2; padding: 8px; font-size: 0.75rem;" 
          @click="saveProjectCosts"
        >
          บันทึกค่าโครงการทั้งหมด 💾
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';

const showAlert = inject('showAlert');

const props = defineProps({
  projectCosts: {
    type: Array,
    required: true
  },
  exchangeRate: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['add-transaction', 'update-project-costs']);

const activeTab = ref('add-tx');

// Transaction Form Fields
const txType = ref('expense');
const txCategory = ref('food');
const txAmount = ref('');
const txCurrency = ref('USD');
const txDate = ref(new Date().toISOString().split('T')[0]);
const txNote = ref('');

// Project Costs Fields (cloned from props to allow local editing)
const localCosts = ref(JSON.parse(JSON.stringify(props.projectCosts)));

watch(() => props.projectCosts, (newCosts) => {
  localCosts.value = JSON.parse(JSON.stringify(newCosts));
}, { deep: true });

// Watch transaction currency and convert typed amount
watch(txCurrency, (newVal, oldVal) => {
  if (txAmount.value && parseFloat(txAmount.value) > 0) {
    if (oldVal === 'USD' && newVal === 'THB') {
      txAmount.value = parseFloat((parseFloat(txAmount.value) * props.exchangeRate.rate).toFixed(2));
    } else if (oldVal === 'THB' && newVal === 'USD') {
      txAmount.value = parseFloat((parseFloat(txAmount.value) / props.exchangeRate.rate).toFixed(2));
    }
  }
});

const changeCostCurrency = (cost, newCurrency) => {
  const oldCurrency = cost.currency;
  if (oldCurrency !== newCurrency) {
    if (cost.amount && cost.amount > 0) {
      if (oldCurrency === 'USD' && newCurrency === 'THB') {
        cost.amount = parseFloat((cost.amount * props.exchangeRate.rate).toFixed(2));
      } else if (oldCurrency === 'THB' && newCurrency === 'USD') {
        cost.amount = parseFloat((cost.amount / props.exchangeRate.rate).toFixed(2));
      }
    }
    cost.currency = newCurrency;
  }
};

// Available Categories based on Transaction Type
const expenseCategories = [
  { value: 'food', label: '🍔 อาหาร' },
  { value: 'transport', label: '🚇 เดินทาง' },
  { value: 'groceries', label: '🛒 ซื้อของชำ' },
  { value: 'sim_net', label: '📱 ค่าเน็ต/โทรศัพท์' },
  { value: 'rent', label: '🏠 ค่าเช่าบ้าน' },
  { value: 'deposit', label: '🔑 มัดจำที่พัก' },
  { value: 'shopping', label: '🛍️ ช้อปปิ้ง' },
  { value: 'travel', label: '🏞️ ท่องเที่ยว' },
  { value: 'emergency', label: '🚨 ฉุกเฉิน' },
  { value: 'other_expense', label: '📦 อื่นๆ' }
];

const incomeCategories = [
  { value: 'job1', label: '💵 รายได้จากงานหลัก' },
  { value: 'tips', label: '🪙 ทิป' },
  { value: 'job_other', label: '💼 งานเสริม' },
  { value: 'other_income', label: '🎁 รายรับอื่นๆ' }
];

const categories = computed(() => {
  return txType.value === 'expense' ? expenseCategories : incomeCategories;
});

const handleTypeChange = () => {
  txCategory.value = txType.value === 'expense' ? 'food' : 'job1';
  // Standard defaults: expense in USD, income in USD
  txCurrency.value = 'USD';
};

const submitTransaction = () => {
  if (!txAmount.value || parseFloat(txAmount.value) <= 0) return;

  emit('add-transaction', {
    type: txType.value,
    category: txCategory.value,
    amount: parseFloat(txAmount.value),
    currency: txCurrency.value,
    note: txNote.value,
    date: txDate.value
  });

  // Reset Form (preserving the selected date for bulk entries)
  txAmount.value = '';
  txNote.value = '';
};

// Cost management methods
const addCostItem = () => {
  localCosts.value.push({
    id: `pc-${Math.random().toString(36).substring(2, 9)}`,
    name: 'ค่าใช้จ่ายโครงการใหม่',
    amount: 0,
    currency: 'USD'
  });
};

const removeCostItem = (index) => {
  localCosts.value.splice(index, 1);
};

const saveProjectCosts = async () => {
  emit('update-project-costs', localCosts.value);
  await showAlert('บันทึกค่าโครงการเรียบร้อยแล้ว!', 'สำเร็จ 🎉');
};
</script>

<style scoped>
.comic-panel {
  padding: 12px 14px;
}
.neo-tab-btn {
  padding: 6px 12px;
  font-size: 0.75rem;
}
label {
  font-size: 0.7rem;
  margin-bottom: 4px;
}
input, select, textarea {
  font-size: 0.8rem;
  padding: 6px 10px;
  box-shadow: 2px 2px 0px var(--color-border);
}
input:focus, select:focus, textarea:focus {
  box-shadow: 3px 3px 0px var(--color-border);
}
.form-group {
  margin-bottom: 10px;
}
.neo-btn {
  padding: 6px 12px;
  font-size: 0.75rem;
}

/* Category grid and chips styles */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  margin-top: 6px;
}
.category-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  background-color: #FAF9F6;
  border: var(--border-medium);
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: 2px 2px 0px var(--color-border);
  color: var(--color-text);
  font-family: var(--font-body);
}
.category-chip:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px var(--color-border);
}
.category-chip:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px var(--color-border);
}
.category-chip.active {
  transform: none;
}
.category-chip.active.expense-active {
  background-color: var(--color-expense);
  color: #000000;
  box-shadow: 2px 2px 0px var(--color-border);
}
.category-chip.active.income-active {
  background-color: var(--color-income);
  color: #000000;
  box-shadow: 2px 2px 0px var(--color-border);
}
</style>
