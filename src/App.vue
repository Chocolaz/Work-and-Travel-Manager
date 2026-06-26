<template>
  <div class="container">
    <!-- Unauthenticated View -->
    <LoginRegister v-if="!token" @auth-success="handleAuthSuccess" />

    <!-- Loading View (No cache available yet) -->
    <div v-else-if="isLoading && isCacheEmpty" class="neo-card" style="text-align: center; margin: 80px auto; max-width: 500px; padding: 40px; background-color: #FFE135; border-width: 4px; box-shadow: 8px 8px 0px #000; border-style: solid; border-color: #000;">
      <h2 class="heading-font" style="margin-bottom: 20px;">กำลังโหลดข้อมูลการเงินของคุณ... ✈️</h2>
      <div style="font-size: 3.5rem; margin: 20px 0; animation: celebrateBounce 0.6s infinite alternate ease-in-out; display: inline-block;">💼</div>
      <p style="margin-top: 20px; font-weight: bold;">กรุณารอคู่หู J-1 ดึงข้อมูลจากคลาวด์สักครู่</p>
    </div>

    <!-- Onboarding View -->
    <OnboardingWizard 
      v-else-if="onboarded !== 1" 
      :token="token" 
      @onboarding-complete="handleOnboardingComplete" 
      @change-currency="handleChangeCurrency" 
    />

    <!-- Authenticated View -->
    <div v-else>
      <!-- Header -->
      <header>
        <div class="logo-section">
          <h1 class="heading-font">Work And Travel EXPENSE TRACKER ✈️</h1>
        </div>
        
        <div class="user-controls">
          <div class="user-profile-group">
            <div class="user-avatar-circle" :title="username">
              {{ username ? username.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div class="user-info-text">
              <span class="username-tag">{{ username }}</span>
              <div class="sync-badge">
                <span class="sync-dot"></span>
                <span class="sync-text">Cloud Synced</span>
              </div>
            </div>
          </div>
          <button @click="logout" class="neo-btn danger-btn" style="padding: 6px 12px; font-size: 0.75rem; box-shadow: 2px 2px 0px #000; border-width: 2px;">
            ออกจากระบบ 🚪
          </button>
        </div>
      </header>

      <!-- Settings Exchange Rate / Currency selector -->
      <ExchangeRate 
        :exchange-rate="exchangeRate"
        :active-currency="activeCurrency"
        @update-rate="handleUpdateRate"
        @change-currency="handleChangeCurrency"
      />

      <!-- Navigation Tabs -->
      <div class="neo-tabs" style="margin-bottom: 24px; justify-content: flex-start; gap: 12px; flex-wrap: wrap;">
        <router-link 
          to="/" 
          class="neo-tab-btn"
          active-class="active"
          style="padding: 10px 20px; font-size: 0.85rem; border-width: 3px; box-shadow: 3px 3px 0px #000; text-decoration: none; display: inline-flex; align-items: center;"
        >
          📊 แดชบอร์ด & เป้าหมาย (Dashboard)
        </router-link>
        <router-link 
          to="/planner" 
          class="neo-tab-btn"
          active-class="active"
          style="padding: 10px 20px; font-size: 0.85rem; border-width: 3px; box-shadow: 3px 3px 0px #000; text-decoration: none; display: inline-flex; align-items: center;"
        >
          🎯 วางแผนคืนทุน (Planner)
        </router-link>
        <router-link 
          to="/transactions" 
          class="neo-tab-btn"
          active-class="active"
          style="padding: 10px 20px; font-size: 0.85rem; border-width: 3px; box-shadow: 3px 3px 0px #000; text-decoration: none; display: inline-flex; align-items: center;"
        >
          💸 บันทึกรายวัน & ประวัติ (Transactions)
        </router-link>
        <router-link 
          to="/jobs" 
          class="neo-tab-btn"
          active-class="active"
          style="padding: 10px 20px; font-size: 0.85rem; border-width: 3px; box-shadow: 3px 3px 0px #000; text-decoration: none; display: inline-flex; align-items: center;"
        >
          🏢 บันทึกชั่วโมงงาน (Work Hours)
        </router-link>
      </div>

      <!-- Routed Page view content -->
      <router-view />

      <!-- Modular Modals -->
      <CelebrateModal />
      <ConfirmModal />
      <QuickAddModal />

      <!-- Mobile Bottom Navigation Bar -->
      <div class="mobile-bottom-nav">
        <router-link 
          to="/" 
          class="bottom-nav-btn"
          active-class="active"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">แดชบอร์ด</span>
        </router-link>
        <router-link 
          to="/planner" 
          class="bottom-nav-btn"
          active-class="active"
        >
          <span class="nav-icon">🎯</span>
          <span class="nav-text">วางแผน</span>
        </router-link>
        
        <!-- Central FAB Button -->
        <button 
          class="bottom-nav-fab"
          @click="showAddTxModal = true"
        >
          <span class="fab-icon">+</span>
        </button>
        
        <router-link 
          to="/transactions" 
          class="bottom-nav-btn"
          active-class="active"
        >
          <span class="nav-icon">📝</span>
          <span class="nav-text">ประวัติ</span>
        </router-link>
        <router-link 
          to="/jobs" 
          class="bottom-nav-btn"
          active-class="active"
        >
          <span class="nav-icon">🏢</span>
          <span class="nav-text">ชั่วโมงงาน</span>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, provide } from 'vue';
import LoginRegister from './components/LoginRegister.vue';
import OnboardingWizard from './components/OnboardingWizard.vue';
import ExchangeRate from './components/ExchangeRate.vue';
import CelebrateModal from './components/modals/CelebrateModal.vue';
import ConfirmModal from './components/modals/ConfirmModal.vue';
import QuickAddModal from './components/modals/QuickAddModal.vue';
import { useFinancials } from './composables/useFinancials';

const {
  token,
  username,
  logout,
  handleAuthSuccess,
  handleChangeCurrency,
  handleOnboardingComplete,
  activeCurrency,
  showAddTxModal,
  exchangeRate,
  isLoading,
  isCacheEmpty,
  onboarded,
  handleUpdateRate,
  fetchDashboardData,
  checkAndRolloverCountdowns,
  showAlert,
  showConfirm
} = useFinancials();

// Provide dialog helpers to sub-components
provide('showAlert', showAlert);
provide('showConfirm', showConfirm);

// Lifecycle
onMounted(() => {
  if (token.value) {
    fetchDashboardData();
    checkAndRolloverCountdowns();
  }
});
</script>

<style scoped>
.user-profile-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-balance);
  color: #ffffff;
  border: var(--border-medium);
  box-shadow: 2px 2px 0px #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 1.2rem;
  text-shadow: 1px 1px 0px #000;
}

.user-info-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.username-tag {
  background-color: #FFFFFF;
  padding: 2px 8px;
  border: var(--border-medium);
  font-weight: 700;
  font-family: var(--font-display);
  font-size: 0.8rem;
  box-shadow: 1px 1px 0px #000;
}

.sync-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #ffffff;
  border: 1.5px solid #000000;
  padding: 1px 6px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
  box-shadow: 1px 1px 0px #000;
}

.sync-dot {
  width: 6px;
  height: 6px;
  background-color: #22c55e;
  border-radius: 50%;
  display: inline-block;
  animation: pulseSync 2s infinite ease-in-out;
}

@keyframes pulseSync {
  0% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* Adjust header to wrap nicely on mobile */
@media (max-width: 600px) {
  header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  .user-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
