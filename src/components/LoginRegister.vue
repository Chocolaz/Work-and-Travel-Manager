<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">✈️🎒</div>
        <h1 class="heading-font">เข้าสู่ระบบ</h1>
        <p style="margin-top: 8px; font-weight: 700; margin-bottom: 24px;">WAT Expense Tracker</p>
      </div>

      <div v-if="error" class="neo-card" style="padding: 12px; background-color: var(--color-error); color: white; border-width: 2px; margin-bottom: 20px; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; box-shadow: 2px 2px 0px #000; border-style: solid; border-color: #000;">
        ⚠️ ข้อผิดพลาด: {{ error }}
      </div>

      <div class="google-btn-wrapper" style="margin-top: 10px; margin-bottom: 10px;">
        <div id="google-signin-btn"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['auth-success']);
const error = ref('');

const handleCredentialResponse = async (response) => {
  error.value = '';
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential: response.credential,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google authentication failed');
    }

    emit('auth-success', {
      token: data.token,
      userId: data.userId,
      username: data.username,
      onboarded: data.onboarded,
    });
  } catch (err) {
    error.value = err.message;
  }
};

const initGoogleSignIn = () => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '293018933967-ph9tibk9ffaijf0fj8a1fof0jbj9ss9g.apps.googleusercontent.com',
      callback: handleCredentialResponse,
    });
    
    const btnEl = document.getElementById('google-signin-btn');
    if (btnEl) {
      // Calculate responsive width matching parent container (within Google constraints 200px - 400px)
      const parentWidth = btnEl.parentElement.getBoundingClientRect().width || 380;
      const finalWidth = Math.min(400, Math.max(200, parentWidth));

      window.google.accounts.id.renderButton(
        btnEl,
        { 
          theme: 'filled_black', // Matches the dark Neo-Brutalism theme perfectly
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: finalWidth.toString()
        }
      );
    }
  } else {
    setTimeout(initGoogleSignIn, 100);
  }
};

onMounted(() => {
  initGoogleSignIn();
});
</script>

<style scoped>
.google-btn-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
