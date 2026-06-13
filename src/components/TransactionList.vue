<template>
  <div class="comic-panel" style="grid-column: 1 / -1; padding: 12px 14px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
      <h2 class="heading-font" style="font-size: 0.95rem;">ประวัติรายการ</h2>
      
      <!-- Filter controls -->
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <button 
          @click="filterType = 'all'" 
          :class="['neo-tab-btn', filterType === 'all' ? 'active' : '']"
          style="padding: 4px 8px; font-size: 0.7rem; border-width: 2px;"
        >
          ทั้งหมด
        </button>
        <button 
          @click="filterType = 'income'" 
          :class="['neo-tab-btn', filterType === 'income' ? 'active' : '']"
          style="padding: 4px 8px; font-size: 0.7rem; border-width: 2px;"
        >
          รายรับ 📈
        </button>
        <button 
          @click="filterType = 'expense'" 
          :class="['neo-tab-btn', filterType === 'expense' ? 'active' : '']"
          style="padding: 4px 8px; font-size: 0.7rem; border-width: 2px;"
        >
          รายจ่าย 📉
        </button>
      </div>
    </div>

    <!-- Search & Sort Controls -->
    <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
      <div style="flex: 2; min-width: 180px;">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="🔍 ค้นหาบันทึกหรือหมวดหมู่..."
          style="border-width: 2px; padding: 6px 10px; font-size: 0.8rem; box-shadow: 2px 2px 0px var(--color-border);"
        />
      </div>
      <div style="flex: 1.2; min-width: 160px;">
        <select 
          v-model="sortBy"
          style="border-width: 2px; padding: 6px 10px; font-size: 0.8rem; box-shadow: 2px 2px 0px var(--color-border); font-weight: 700; cursor: pointer; height: 100%;"
        >
          <option value="date-desc">📅 วันที่ทำรายการ: ล่าสุด</option>
          <option value="date-asc">📅 วันที่ทำรายการ: เก่าสุด</option>
          <option value="created-desc">💾 วันที่บันทึก: ล่าสุด</option>
          <option value="created-asc">💾 วันที่บันทึก: เก่าสุด</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper" style="max-height: 420px; overflow-y: auto;">
      <!-- Desktop Mode (Table View) -->
      <div class="desktop-tx-table" v-if="filteredTransactions.length > 0">
        <table style="table-layout: fixed; width: 100%;">
          <colgroup>
            <col style="width: 100px;" />
            <col style="width: 90px;" />
            <col style="width: 130px;" />
            <col style="width: 150px;" />
            <col style="width: 110px;" />
            <col style="width: 60px;" />
          </colgroup>
          <thead>
            <tr>
              <th>วันที่</th>
              <th>ประเภท</th>
              <th>หมวดหมู่</th>
              <th>บันทึก</th>
              <th>จำนวนเงิน</th>
              <th style="text-align: center;">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in visibleTransactions" :key="tx.id" :class="{ 'new-highlight': tx.id === newlyAddedTxId }">
              <td style="font-weight: 700;">{{ tx.date }}</td>
              <td>
                <span :class="['badge-tag', tx.type === 'income' ? 'income' : 'expense']" style="border-width: 1.5px; font-size: 0.65rem; padding: 2px 4px;">
                  {{ tx.type === 'income' ? 'INCOME' : 'EXPENSE' }}
                </span>
              </td>
              <td style="font-weight: 700; text-transform: uppercase;">
                {{ getCategoryLabel(tx.category) }}
              </td>
              <td 
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                :title="tx.note"
              >
                {{ tx.note || '-' }}
              </td>
              <td style="font-family: var(--font-display); font-weight: 900;">
                <!-- Active Converted Currency Display -->
                <span :class="tx.type === 'income' ? 'text-success' : 'text-danger'">
                  {{ formatValue(tx.amount, tx.currency) }}
                </span>
                
                <!-- Original currency in parenthesis if mismatched -->
                <span 
                  v-if="tx.currency !== activeCurrency" 
                  style="font-size: 0.7rem; color: var(--color-muted); font-weight: 500; margin-top: 2px; display: block;"
                >
                  (Orig: {{ tx.currency === 'USD' ? '$' : '' }}{{ tx.currency === 'THB' ? Math.round(tx.amount) : tx.amount.toFixed(2) }}{{ tx.currency === 'THB' ? ' ฿' : '' }})
                </span>
              </td>
              <td style="min-width: 60px; text-align: center;">
                <button 
                  type="button" 
                  class="neo-btn danger-btn" 
                  style="padding: 4px 8px; font-size: 0.7rem; box-shadow: 2px 2px 0px #000; border-width: 2px;"
                  @click="emit('delete-transaction', tx.id)"
                >
                  🗑️
                </button>
              </td>
            </tr>
            <!-- Load More Row (Spans all columns) -->
            <tr v-if="filteredTransactions.length > visibleCount" class="load-more-row" @click="loadMore">
              <td colspan="6" style="text-align: center;">
                ➕ โหลดรายการเพิ่มเติม...
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Mode (Card View) -->
      <div class="mobile-tx-cards" v-if="filteredTransactions.length > 0">
        <div 
          v-for="tx in visibleTransactions" 
          :key="tx.id" 
          class="mobile-tx-card" 
          :class="{ 'new-highlight-card': tx.id === newlyAddedTxId }"
        >
          <!-- Card Header -->
          <div class="mobile-card-header">
            <span class="mobile-card-date">📅 {{ tx.date }}</span>
            <span :class="['badge-tag', tx.type === 'income' ? 'income' : 'expense']" style="border-width: 1.5px; font-size: 0.6rem; padding: 2px 4px;">
              {{ tx.type === 'income' ? 'INCOME' : 'EXPENSE' }}
            </span>
          </div>

          <!-- Card Body -->
          <div class="mobile-card-body">
            <div class="mobile-card-details">
              <div class="mobile-card-category">{{ getCategoryLabel(tx.category) }}</div>
              <div class="mobile-card-note">{{ tx.note || '-' }}</div>
            </div>
            
            <div class="mobile-card-value">
              <span :class="tx.type === 'income' ? 'text-success' : 'text-danger'" style="font-family: var(--font-display); font-weight: 900; font-size: 0.95rem;">
                {{ formatValue(tx.amount, tx.currency) }}
              </span>
              <span v-if="tx.currency !== activeCurrency" style="font-size: 0.65rem; color: var(--color-muted); font-weight: 500; margin-top: 2px; display: block;">
                (Orig: {{ tx.currency === 'USD' ? '$' : '' }}{{ tx.currency === 'THB' ? Math.round(tx.amount) : tx.amount.toFixed(2) }}{{ tx.currency === 'THB' ? ' ฿' : '' }})
              </span>
            </div>
          </div>

          <!-- Card Footer (Delete Button) -->
          <div class="mobile-card-footer">
            <button 
              type="button" 
              class="neo-btn danger-btn" 
              style="width: 100%; padding: 6px; font-size: 0.75rem; box-shadow: 2px 2px 0px #000; border-width: 2px;"
              @click="emit('delete-transaction', tx.id)"
            >
              🗑️ ลบรายการนี้
            </button>
          </div>
        </div>

        <!-- Mobile Load More -->
        <button 
          v-if="filteredTransactions.length > visibleCount" 
          type="button"
          class="neo-btn" 
          style="width: 100%; padding: 10px; font-size: 0.8rem; box-shadow: 3px 3px 0px #000; border-width: 2.5px; background-color: var(--color-accent); font-weight: 800; margin-top: 4px;"
          @click="loadMore"
        >
          ➕ โหลดรายการเพิ่มเติม
        </button>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center" style="padding: 32px; font-weight: 800; color: var(--color-muted);">
        📭 ไม่มีข้อมูลรายการ
      </div>
    </div>

    <!-- Scroll items count -->
    <div v-if="filteredTransactions.length > 0" style="font-size: 0.7rem; font-weight: 700; color: var(--color-muted); text-align: right; margin-top: 8px;">
      แสดง {{ Math.min(visibleCount, filteredTransactions.length) }} จาก {{ filteredTransactions.length }} รายการ
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  transactions: {
    type: Array,
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
  newlyAddedTxId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['delete-transaction']);

const filterType = ref('all');
const searchQuery = ref('');
const sortBy = ref('date-desc');

// Load More State
const visibleCount = ref(10);

const categoryMapping = {
  // Expenses
  food: '🍔 อาหาร',
  transport: '🚇 เดินทาง',
  groceries: '🛒 ซื้อของชำ',
  sim_net: '📱 ค่าเน็ต/โทรศัพท์',
  rent: '🏠 ค่าเช่าบ้าน',
  deposit: '🔑 มัดจำที่พัก',
  shopping: '🛍️ ช้อปปิ้ง',
  travel: '🏞️ ท่องเที่ยว',
  emergency: '🚨 ฉุกเฉิน',
  other_expense: '📦 อื่นๆ',
  
  // Income
  job1: '💵 รายได้จากงานหลัก',
  tips: '🪙 ทิป',
  job_other: '💼 งานเสริม',
  other_income: '🎁 รายรับอื่นๆ'
};

const getCategoryLabel = (category) => {
  return categoryMapping[category] || category;
};

// Filter, Search & Sort Logic
const filteredTransactions = computed(() => {
  // 1. Filter
  const result = props.transactions.filter(tx => {
    // Type Filter
    if (filterType.value !== 'all' && tx.type !== filterType.value) {
      return false;
    }
    
    // Search Query Filter
    if (searchQuery.value.trim() !== '') {
      const query = searchQuery.value.toLowerCase().trim();
      const noteMatch = tx.note && tx.note.toLowerCase().includes(query);
      const catLabel = getCategoryLabel(tx.category).toLowerCase();
      const catMatch = catLabel.includes(query);
      return noteMatch || catMatch;
    }
    
    return true;
  });

  // 2. Sort
  return result.sort((a, b) => {
    if (sortBy.value === 'date-desc') {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      const createdA = a.created_at || '';
      const createdB = b.created_at || '';
      if (createdA && createdB) {
        const createdCompare = createdB.localeCompare(createdA);
        if (createdCompare !== 0) return createdCompare;
      } else if (createdA && !createdB) {
        return -1;
      } else if (!createdA && createdB) {
        return 1;
      }
      return b.id.localeCompare(a.id);
    } 
    
    else if (sortBy.value === 'date-asc') {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      const createdA = a.created_at || '';
      const createdB = b.created_at || '';
      if (createdA && createdB) {
        const createdCompare = createdA.localeCompare(createdB);
        if (createdCompare !== 0) return createdCompare;
      } else if (createdA && !createdB) {
        return 1;
      } else if (!createdA && createdB) {
        return -1;
      }
      return a.id.localeCompare(b.id);
    } 
    
    else if (sortBy.value === 'created-desc') {
      const createdA = a.created_at || '';
      const createdB = b.created_at || '';
      
      if (createdA && createdB) {
        const createdCompare = createdB.localeCompare(createdA);
        if (createdCompare !== 0) return createdCompare;
      } else if (createdA && !createdB) {
        return -1;
      } else if (!createdA && createdB) {
        return 1;
      }
      
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id.localeCompare(a.id);
    } 
    
    else if (sortBy.value === 'created-asc') {
      const createdA = a.created_at || '';
      const createdB = b.created_at || '';
      
      if (createdA && createdB) {
        const createdCompare = createdA.localeCompare(createdB);
        if (createdCompare !== 0) return createdCompare;
      } else if (createdA && !createdB) {
        return 1;
      } else if (!createdA && createdB) {
        return -1;
      }
      
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.id.localeCompare(b.id);
    }
    
    return 0;
  });
});

// Load More & Scroll Logic
const visibleTransactions = computed(() => {
  return filteredTransactions.value.slice(0, visibleCount.value);
});

const loadMore = () => {
  visibleCount.value += 10;
};

// Reset visible count on filter/search/sort changes
watch([filterType, searchQuery, sortBy], () => {
  visibleCount.value = 10;
});

// Converts transaction value into active display currency
const formatValue = (amount, transactionCurrency) => {
  let finalVal = amount;
  
  if (transactionCurrency !== props.activeCurrency) {
    if (transactionCurrency === 'USD' && props.activeCurrency === 'THB') {
      finalVal = amount * props.exchangeRate.rate;
    } else if (transactionCurrency === 'THB' && props.activeCurrency === 'USD') {
      finalVal = amount / props.exchangeRate.rate;
    }
  }

  const decimals = props.activeCurrency === 'THB' ? 0 : 2;
  const formatted = finalVal.toLocaleString('en-US', {
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

<style scoped>
th, td {
  padding: 10px 12px !important;
  line-height: 1.4;
  vertical-align: middle;
}
th {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  background-color: var(--color-accent) !important;
}
td {
  font-size: 0.8rem;
}
tbody tr {
  height: 48px;
}
tr:hover {
  background-color: #FAF9F5;
}
.load-more-row td {
  background-color: var(--color-accent) !important;
  color: #000000;
  text-align: center;
  font-family: var(--font-display);
  font-weight: 800;
  cursor: pointer;
  height: 44px;
  transition: all 0.1s ease;
}
.load-more-row:hover td {
  background-color: #000000 !important;
  color: var(--color-accent) !important;
}
.new-highlight td {
  animation: highlightFade 3s ease-out forwards;
}
@keyframes highlightFade {
  0% {
    background-color: var(--color-accent) !important;
  }
  60% {
    background-color: var(--color-accent) !important;
  }
  100% {
    background-color: transparent;
  }
}

/* Mobile Responsive Transaction List Styles */
.mobile-tx-cards {
  display: none;
}

@media (max-width: 600px) {
  .desktop-tx-table {
    display: none;
  }
  
  .mobile-tx-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 2px;
  }

  .mobile-tx-card {
    border: 2px solid #000;
    border-radius: 8px;
    background-color: #ffffff;
    padding: 12px;
    box-shadow: 3px 3px 0px #000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px dashed #000;
    padding-bottom: 6px;
  }

  .mobile-card-date {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--color-muted);
  }

  .mobile-card-body {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .mobile-card-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 65%;
  }

  .mobile-card-category {
    font-size: 0.85rem;
    font-weight: 900;
    color: #000;
  }

  .mobile-card-note {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-muted);
    word-break: break-word;
  }

  .mobile-card-value {
    text-align: right;
    flex-shrink: 0;
  }

  .mobile-card-footer {
    margin-top: 4px;
  }
  
  .new-highlight-card {
    animation: highlightFadeCard 3s ease-out forwards;
  }
}

@keyframes highlightFadeCard {
  0% {
    background-color: var(--color-accent) !important;
  }
  60% {
    background-color: var(--color-accent) !important;
  }
  100% {
    background-color: #ffffff;
  }
}
</style>
