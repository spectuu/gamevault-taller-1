import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const user = ref(null)
const profile = ref(null)
const initialized = ref(false)

async function fetchProfile(userId) {
  if (!userId) { profile.value = null; return }
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  profile.value = data
}

async function init() {
  if (initialized.value) return
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user ?? null
  await fetchProfile(user.value?.id)
  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user ?? null
    await fetchProfile(user.value?.id)
  })
  initialized.value = true
}

export function useAuth() {
  init()

  const isAdmin = () => profile.value?.role === 'admin'
  const isOwner = (userId) => user.value?.id === userId
  const canEdit = (game) => isAdmin() || isOwner(game.user_id)

  return { user, profile, isAdmin, isOwner, canEdit }
}
