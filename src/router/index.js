import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Games from '../views/Games.vue'
import GameDetail from '../views/GameDetail.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/games',
    component: Games,
    meta: { requiresAuth: true }
  },
  {
    path: '/games/:id',
    component: GameDetail,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return '/login'
  }
})

export default router
