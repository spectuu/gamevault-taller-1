<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const fieldErrors = ref({ email: '', password: '', confirmPassword: '' })
const loading = ref(false)
const success = ref(false)
const touched = ref({ email: false, password: false, confirmPassword: false })
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const passwordChecks = computed(() => ({
  length: password.value.length >= 6,
  uppercase: /[A-Z]/.test(password.value),
  lowercase: /[a-z]/.test(password.value),
  number: /[0-9]/.test(password.value),
}))

const passwordStrength = computed(() => {
  const checks = Object.values(passwordChecks.value)
  const passed = checks.filter(Boolean).length
  if (passed <= 1) return { level: 'weak', label: 'Débil', color: 'var(--danger)' }
  if (passed <= 2) return { level: 'fair', label: 'Regular', color: '#ffa502' }
  if (passed <= 3) return { level: 'good', label: 'Buena', color: '#2ed573' }
  return { level: 'strong', label: 'Fuerte', color: '#00d4ff' }
})

const isPasswordValid = computed(() => Object.values(passwordChecks.value).every(Boolean))

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
  } else if (!isPasswordValid.value) {
    fieldErrors.value.password = 'La contraseña no cumple todos los requisitos'
  } else {
    fieldErrors.value.password = ''
  }
  if (touched.value.confirmPassword) validateConfirmPassword()
}

function validateConfirmPassword() {
  touched.value.confirmPassword = true
  if (!confirmPassword.value) {
    fieldErrors.value.confirmPassword = 'Confirma tu contraseña'
  } else if (password.value !== confirmPassword.value) {
    fieldErrors.value.confirmPassword = 'Las contraseñas no coinciden'
  } else {
    fieldErrors.value.confirmPassword = ''
  }
}

function translateError(message) {
  const map = {
    'User already registered': 'Este correo ya está registrado',
    'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos',
    'Signup requires a valid password': 'Ingresa una contraseña válida',
    'Unable to validate email address: invalid format': 'Formato de correo inválido',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  }
  for (const [key, val] of Object.entries(map)) {
    if (message.includes(key)) return val
  }
  return message
}

async function handleRegister() {
  error.value = ''
  validateEmail()
  validatePassword()
  validateConfirmPassword()

  if (fieldErrors.value.email || fieldErrors.value.password || fieldErrors.value.confirmPassword) {
    return
  }

  loading.value = true
  const { data, error: err } = await supabase.auth.signUp({
    email: email.value.trim().toLowerCase(),
    password: password.value
  })
  loading.value = false

  if (err) {
    error.value = translateError(err.message)
    return
  }

  // Supabase puede retornar un usuario "falso" si el email ya existe (sin confirmar)
  if (data?.user?.identities?.length === 0) {
    error.value = 'Este correo ya está registrado. Intenta iniciar sesión.'
    return
  }

  success.value = true
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Registrarse</h1>
      <p class="auth-subtitle">Crea tu cuenta en GameVault</p>

      <div v-if="success" class="success-msg">
        <p>¡Cuenta creada exitosamente!</p>
        <p>Revisa tu correo para confirmar tu cuenta, o <router-link to="/login">inicia sesión</router-link>.</p>
      </div>

      <form v-else @submit.prevent="handleRegister" novalidate>
        <div class="form-group" :class="{ 'has-error': touched.email && fieldErrors.email }">
          <label>Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            @blur="validateEmail"
            @input="touched.email && validateEmail()"
          />
          <p v-if="touched.email && fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
        </div>

        <div class="form-group" :class="{ 'has-error': touched.password && fieldErrors.password }">
          <label>Contraseña</label>
          <div class="input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Crea una contraseña segura"
              @blur="validatePassword"
              @input="touched.password && validatePassword()"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? 'Ocultar' : 'Ver' }}
            </button>
          </div>

          <div v-if="password.length > 0" class="password-feedback">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :style="{
                  width: (Object.values(passwordChecks).filter(Boolean).length / 4) * 100 + '%',
                  background: passwordStrength.color
                }"
              ></div>
            </div>
            <span class="strength-label" :style="{ color: passwordStrength.color }">{{ passwordStrength.label }}</span>

            <ul class="password-rules">
              <li :class="{ passed: passwordChecks.length }">Mínimo 6 caracteres</li>
              <li :class="{ passed: passwordChecks.uppercase }">Una letra mayúscula</li>
              <li :class="{ passed: passwordChecks.lowercase }">Una letra minúscula</li>
              <li :class="{ passed: passwordChecks.number }">Un número</li>
            </ul>
          </div>
        </div>

        <div class="form-group" :class="{ 'has-error': touched.confirmPassword && fieldErrors.confirmPassword }">
          <label>Confirmar contraseña</label>
          <div class="input-wrapper">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Repite tu contraseña"
              @blur="validateConfirmPassword"
              @input="touched.confirmPassword && validateConfirmPassword()"
            />
            <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
              {{ showConfirmPassword ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
          <p v-if="touched.confirmPassword && fieldErrors.confirmPassword" class="field-error">{{ fieldErrors.confirmPassword }}</p>
          <p v-if="touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword" class="field-success">Las contraseñas coinciden</p>
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

.field-success {
  color: var(--success);
  font-size: 0.8rem;
  margin-top: 6px;
}

.password-feedback {
  margin-top: 10px;
}

.strength-bar {
  height: 4px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s, background 0.3s;
}

.strength-label {
  font-size: 0.75rem;
  font-weight: 600;
}

.password-rules {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.password-rules li {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding-left: 18px;
  position: relative;
}

.password-rules li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: var(--text-muted);
}

.password-rules li.passed {
  color: var(--success);
}

.password-rules li.passed::before {
  content: '●';
  color: var(--success);
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
