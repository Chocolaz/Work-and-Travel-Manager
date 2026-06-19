<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">✈️🎒</div>
        <h1 class="heading-font">{{ isLogin ? 'เข้าสู่ระบบ!' : 'สมัครสมาชิกที่นี่!' }}</h1>
        <p style="margin-top: 8px; font-weight: 700;">WAT Expense Tracker</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">ชื่อผู้ใช้งาน</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="กรอกชื่อผู้ใช้งาน..."
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group" style="margin-bottom: 24px;">
          <label for="password">รหัสผ่าน</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="กรอกรหัสผ่าน..."
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="neo-card" style="padding: 12px; background-color: var(--color-error); color: white; border-width: 2px; margin-bottom: 16px; font-weight: 700; text-transform: uppercase; font-size: 0.8rem; box-shadow: 2px 2px 0px #000;">
          ⚠️ ข้อผิดพลาด: {{ error }}
        </div>

        <button type="submit" class="neo-btn tilted-right" style="width: 100%; padding: 14px; font-size: 1rem; margin-bottom: 8px;">
          {{ isLogin ? 'เข้าสู่แดชบอร์ด 🚀' : 'สร้างบัญชีผู้ใช้ 🎉' }}
        </button>
      </form>

      <div class="divider">
        <span>หรือ</span>
      </div>

      <div class="google-btn-wrapper">
        <div id="google-signin-btn"></div>
      </div>

      <div class="auth-toggle" style="margin-top: 16px;">
        <span @click="toggleMode" class="auth-toggle-link">
          {{ isLogin ? 'ยังไม่มีบัญชีใช่หรือไม่? สมัครสมาชิกที่นี่' : 'มีบัญชีผู้ใช้อยู่แล้ว? เข้าสู่ระบบที่นี่' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['auth-success']);

const isLogin = ref(true);
const username = ref('');
const password = ref('');
const error = ref('');

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
  username.value = '';
  password.value = '';
};

const handleSubmit = async () => {
  error.value = '';
  const endpoint = isLogin.value ? '/api/auth/login' : '/api/auth/register';
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    // Success
    emit('auth-success', {
      token: data.token,
      userId: data.userId,
      username: data.username,
    });
  } catch (err) {
    error.value = err.message;
  }
};

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
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 16px 0;
  color: #000;
  font-weight: 800;
  font-size: 0.9rem;
  text-transform: uppercase;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 3px dashed #000;
}
.divider:not(:empty)::before {
  margin-right: 12px;
}
.divider:not(:empty)::after {
  margin-left: 12px;
}

.google-btn-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
