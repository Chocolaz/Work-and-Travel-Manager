<template>
  <div v-if="showCelebrateModal" class="neo-modal-overlay" style="z-index: 9999;" @click.self="closeCelebrateModal">
    <div class="neo-modal-content celebrate-modal-content" style="text-align: center; max-width: 500px; padding: 32px; border-width: 4px; transform: rotate(1deg);">
      <button class="neo-modal-close" @click="closeCelebrateModal">✖</button>
      
      <div class="celebrate-bounce" style="font-size: 4rem; margin-bottom: 16px;">🏆</div>
      
      <h2 class="heading-font" style="font-size: 1.8rem; color: black; margin-bottom: 8px;">
        🎉 คืนทุนโครงการแล้ว! 🎉
      </h2>
      <h3 class="heading-font" style="font-size: 1.1rem; color: var(--color-balance); background-color: black; display: inline-block; padding: 4px 12px; margin-bottom: 16px;">
        BREAK-EVEN ACHIEVED!
      </h3>
      
      <p style="font-weight: 700; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; color: var(--color-muted);">
        ยินดีด้วยน้าาา! คุณทำยอดรายรับสะสมได้มากกว่าค่าธรรมเนียมและค่าโครงการทั้งหมดแล้ว ตอนนี้เงินทุกบาทที่คุณหาได้จะเริ่มสะสมเข้ากระเป๋าออมเงินโดยตรงแล้ว!
      </p>

      <div style="display: flex; justify-content: center; gap: 8px; font-size: 2rem; margin-bottom: 24px;">
        <span>🇺🇸</span><span class="celebrate-bounce">✨</span><span>💰</span><span class="celebrate-bounce">✨</span><span>✈️</span>
      </div>

      <button 
        class="neo-btn income-btn" 
        style="width: 100%; padding: 12px; font-size: 1rem; box-shadow: 4px 4px 0px #000;"
        @click="closeCelebrateModal"
      >
        ลุยต่อเลยเพื่อฝัน! 🚀
      </button>
    </div>
  </div>
</template>

<script setup>
import { useFinancials } from '../../composables/useFinancials';

const { showCelebrateModal, closeCelebrateModal } = useFinancials();
</script>
