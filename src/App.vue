<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'
import ToastContainer from './components/ToastContainer.vue'
import { useToast } from './composables/useToast'
import { useAuth } from './composables/useAuth'

const router = useRouter()
const menuOpen = ref(false)
const { addToast } = useToast()
const { user, profile, isAdmin } = useAuth()

async function logout() {
  await supabase.auth.signOut()
  addToast('Sesión cerrada correctamente', 'info')
  router.push('/')
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <ToastContainer />
  <nav class="navbar">
    <router-link to="/" class="logo" @click="closeMenu">GameVault</router-link>
    <button class="menu-toggle" @click="menuOpen = !menuOpen">
      <span :class="{ open: menuOpen }"></span>
    </button>
    <div class="nav-links" :class="{ active: menuOpen }">
      <router-link to="/" @click="closeMenu">Inicio</router-link>
      <template v-if="user">
        <router-link to="/games" @click="closeMenu">Videojuegos</router-link>
        <div class="user-info">
          <span class="user-email">{{ user.email }}</span>
          <span v-if="isAdmin()" class="badge-admin">ADMIN</span>
          <span v-else class="badge-user">USUARIO</span>
        </div>
        <button class="btn-secondary" @click="logout(); closeMenu()">Cerrar sesión</button>
      </template>
      <template v-else>
        <router-link to="/login" @click="closeMenu">Iniciar sesión</router-link>
        <router-link to="/register" @click="closeMenu">Registrarse</router-link>
      </template>
    </div>
  </nav>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent);
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-links a {
  color: var(--text);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent);
  text-decoration: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-email {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.badge-admin {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.badge-user {
  background: rgba(0, 212, 255, 0.15);
  color: var(--accent);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.menu-toggle span,
.menu-toggle span::before,
.menu-toggle span::after {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text);
  transition: all 0.3s;
  position: relative;
}

.menu-toggle span::before,
.menu-toggle span::after {
  content: '';
  position: absolute;
}

.menu-toggle span::before {
  top: -7px;
}

.menu-toggle span::after {
  top: 7px;
}

.menu-toggle span.open {
  background: transparent;
}

.menu-toggle span.open::before {
  top: 0;
  transform: rotate(45deg);
}

.menu-toggle span.open::after {
  top: 0;
  transform: rotate(-45deg);
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}

@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    padding: 14px 20px;
  }

  .menu-toggle {
    display: block;
  }

  .nav-links {
    display: none;
    flex-direction: column;
    width: 100%;
    gap: 12px;
    padding-top: 16px;
  }

  .nav-links.active {
    display: flex;
  }

  .user-info {
    order: -1;
  }
}
</style>
