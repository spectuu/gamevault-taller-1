<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const fieldErrors = ref({ email: '', password: '' })
const loading = ref(false)
const touched = ref({ email: false, password: false })
const showPassword = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail() {
  touched.value.email = true
  if (!email.value.trim()) {
    fieldErrors.value.email = 'El correo es obligatorio'
  } else if (!emailRegex.test(email.value)) {
    fieldErrors.value.email = 'Ingresa un correo electrónico válido'
  } else {
    fieldErrors.value.email = ''
  }
}

function validatePassword() {
  touched.value.password = true
  if (!password.value) {
    fieldErrors.value.password = 'La contraseña es obligatoria'
  } else {
    fieldErrors.value.password = ''
  }
}

function translateError(message) {
  const map = {
    'Invalid login credentials': 'Correo o contraseña incorrectos',
    'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión',
    'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos',
    'Invalid email or password': 'Correo o contraseña incorrectos',
    'User not found': 'No existe una cuenta con este correo',
    'Too many requests': 'Demasiados intentos. Espera unos minutos',
    'Network': 'Error de conexión. Verifica tu internet',
  }
  for (const [key, val] of Object.entries(map)) {
    if (message.includes(key)) return val
  }
  return message
}

async function handleLogin() {
  error.value = ''
  validateEmail()
  validatePassword()

  if (fieldErrors.value.email || fieldErrors.value.password) {
    return
  }

  loading.value = true
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value.trim().toLowerCase(),
    password: password.value
  })
  loading.value = false

  if (err) {
    error.value = translateError(err.message)
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

      <form @submit.prevent="handleLogin" novalidate>
        <div class="form-group" :class="{ 'has-error': touched.email && fieldErrors.email }">
          <label>Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            @blur="validateEmail"
            @input="touched.email && validateEmail()"
            @keydown.enter.prevent="$refs?.passwordInput?.focus()"
          />
          <p v-if="touched.email && fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
        </div>

        <div class="form-group" :class="{ 'has-error': touched.password && fieldErrors.password }">
          <label>Contraseña</label>
          <div class="input-wrapper">
            <input
              ref="passwordInput"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Tu contraseña"
              @blur="validatePassword"
              @input="touched.password && validatePassword()"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
          <p v-if="touched.password && fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
        </div>

        <div v-if="error" class="error">{{ error }}</div>

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

.form-group.has-error input {
  border-color: var(--danger);
}

.input-wrapper {
  position: relative;
  display: flex;
}

.input-wrapper input {
  flex: 1;
  padding-right: 70px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px;
}

.toggle-password:hover {
  text-decoration: underline;
}

.field-error {
  color: var(--danger);
  font-size: 0.8rem;
  margin-top: 6px;
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
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: var(--radius);
  padding: 10px 14px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  color: var(--text-muted);
}
</style>
