<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    router.push('/games')
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Iniciar sesión</h1>
      <p class="auth-subtitle">Ingresa a tu cuenta de GameVault</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Correo electrónico</label>
          <input v-model="email" type="email" placeholder="tu@email.com" required />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="Tu contraseña" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>
      <p class="auth-footer">
        ¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.auth-card h1 {
  color: var(--accent);
  margin-bottom: 8px;
}

.auth-subtitle {
  color: var(--text-muted);
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text);
}

.btn-full {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
}

.btn-full:disabled {
  opacity: 0.6;
}

.error {
  color: var(--danger);
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  color: var(--text-muted);
}
</style>
