<script setup>
import { useToast } from '../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="'toast-' + toast.type"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 14px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  min-width: 250px;
}

.toast-success {
  background: #2ed573;
  color: #111;
}

.toast-error {
  background: #ff4757;
  color: white;
}

.toast-info {
  background: #00d4ff;
  color: #111;
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(60px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}
</style>
