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

        <button type="submit" class="neo-btn tilted-right" style="width: 100%; padding: 14px; font-size: 1rem;">
          {{ isLogin ? 'เข้าสู่แดชบอร์ด 🚀' : 'สร้างบัญชีผู้ใช้ 🎉' }}
        </button>
      </form>

      <div class="auth-toggle">
        <span @click="toggleMode" class="auth-toggle-link">
          {{ isLogin ? 'ยังไม่มีบัญชีใช่หรือไม่? สมัครสมาชิกที่นี่' : 'มีบัญชีผู้ใช้อยู่แล้ว? เข้าสู่ระบบที่นี่' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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
</script>
