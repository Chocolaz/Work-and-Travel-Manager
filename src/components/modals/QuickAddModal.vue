<template>
  <div v-if="showAddTxModal" class="neo-modal-overlay" style="z-index: 9999;" @click.self="showAddTxModal = false">
    <div class="neo-modal-content" style="max-width: 450px; padding: 24px; border-width: 4px; transform: rotate(0.5deg); overflow-y: auto; max-height: 90vh;">
      <button class="neo-modal-close" @click="showAddTxModal = false">✖</button>
      
      <h2 class="heading-font" style="font-size: 1.3rem; color: black; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        💸 บันทึกรายการด่วน (Quick Add)
      </h2>
      
      <CostForm 
        :project-costs="projectCosts"
        :exchange-rate="exchangeRate"
        @add-transaction="handleQuickAddTransaction"
        @update-project-costs="handleUpdateProjectCosts"
      />
    </div>
  </div>
</template>

<script setup>
import CostForm from '../CostForm.vue';
import { useFinancials } from '../../composables/useFinancials';

const {
  showAddTxModal,
  projectCosts,
  exchangeRate,
  handleQuickAddTransaction,
  handleUpdateProjectCosts
} = useFinancials();
</script>
