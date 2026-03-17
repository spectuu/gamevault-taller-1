<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const success = ref(false)

async function handleRegister() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  loading.value = true
  const { error: err } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    success.value = true
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Registrarse</h1>
      <p class="auth-subtitle">Crea tu cuenta en GameVault</p>

      <div v-if="success" class="success-msg">
        <p>Cuenta creada exitosamente!</p>
        <p>Revisa tu correo para confirmar tu cuenta, o <router-link to="/login">inicia sesión</router-link>.</p>
      </div>

      <form v-else @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Correo electrónico</label>
          <input v-model="email" type="email" placeholder="tu@email.com" required />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div class="form-group">
          <label>Confirmar contraseña</label>
          <input v-model="confirmPassword" type="password" placeholder="Repite tu contraseña" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Crear cuenta' }}
        </button>
      </form>
      <p class="auth-footer">
        ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
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

.success-msg {
  background: rgba(46, 213, 115, 0.1);
  border: 1px solid var(--success);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
  line-height: 1.8;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  color: var(--text-muted);
}
</style>
