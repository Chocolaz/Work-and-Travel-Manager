<template>
  <div v-if="customModal.show" class="neo-modal-overlay" style="z-index: 10000;" @click.self="handleModalCancel">
    <div class="neo-modal-content" style="max-width: 450px; padding: 28px; border-width: 4px; transform: rotate(-0.5deg);">
      <button class="neo-modal-close" @click="handleModalCancel">✖</button>
      
      <h2 class="heading-font" style="font-size: 1.4rem; color: black; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        {{ customModal.title }}
      </h2>
      
      <p style="font-weight: 700; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; color: black;">
        {{ customModal.message }}
      </p>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button 
          v-if="customModal.type === 'confirm'" 
          class="neo-btn danger-btn" 
          style="padding: 8px 16px; font-size: 0.85rem; box-shadow: 3px 3px 0px #000;"
          @click="handleModalCancel"
        >
          ยกเลิก ❌
        </button>
        <button 
          class="neo-btn income-btn" 
          style="padding: 8px 16px; font-size: 0.85rem; box-shadow: 3px 3px 0px #000;"
          @click="handleModalConfirm"
        >
          {{ customModal.type === 'confirm' ? 'ยืนยัน' : 'ตกลง' }} 
          {{ customModal.type === 'confirm' ? '✔️' : '👍' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFinancials } from '../../composables/useFinancials';

const { customModal, handleModalConfirm, handleModalCancel } = useFinancials();
</script>
