<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { addToast } = useToast()
const { user, canEdit, isAdmin } = useAuth()

const games = ref([])
const search = ref('')
const loading = ref(true)
const showForm = ref(false)
const editingGame = ref(null)
const currentPage = ref(1)
const perPage = 20

const formName = ref('')
const formImage = ref('')
const formDescription = ref('')
const formGenre = ref('')
const formPlatform = ref('')
const formReleaseYear = ref('')
const formDeveloper = ref('')
const formPublisher = ref('')
const formRating = ref('')
const formError = ref('')
const formLoading = ref(false)

const filteredGames = computed(() => {
  if (!search.value) return games.value
  const q = search.value.toLowerCase()
  return games.value.filter(g => g.name.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.ceil(filteredGames.value.length / perPage))

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredGames.value.slice(start, start + perPage)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(() => {
  fetchGames()
})

async function fetchGames() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)
    if (error) {
      addToast('Error al cargar los juegos: ' + error.message, 'error')
    } else {
      games.value = data
    }
  } catch (e) {
    addToast('Error de conexión al cargar los juegos', 'error')
  } finally {
    loading.value = false
  }
}

function goToPage(page) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onSearch() {
  currentPage.value = 1
}

function openCreate() {
  editingGame.value = null
  formName.value = ''
  formImage.value = ''
  formDescription.value = ''
  formGenre.value = ''
  formPlatform.value = ''
  formReleaseYear.value = ''
  formDeveloper.value = ''
  formPublisher.value = ''
  formRating.value = ''
  formError.value = ''
  showForm.value = true
}

function openEdit(game) {
  editingGame.value = game
  formName.value = game.name
  formImage.value = game.image
  formDescription.value = game.description || ''
  formGenre.value = game.genre || ''
  formPlatform.value = game.platform || ''
  formReleaseYear.value = game.release_year || ''
  formDeveloper.value = game.developer || ''
  formPublisher.value = game.publisher || ''
  formRating.value = game.rating || ''
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingGame.value = null
}

function viewGame(game) {
  router.push(`/games/${game.id}`)
}

async function handleSubmit() {
  formError.value = ''
  if (!formName.value.trim() || !formImage.value.trim()) {
    formError.value = 'Todos los campos son obligatorios'
    return
  }
  if (!editingGame.value && !user.value?.id) {
    formError.value = 'Debes iniciar sesión para agregar juegos'
    return
  }
  formLoading.value = true

  const safetyTimeout = setTimeout(() => {
    formLoading.value = false
    formError.value = 'La operación tardó demasiado. Intenta de nuevo.'
  }, 15000)

  try {
    const gameData = {
      name: formName.value,
      image: formImage.value,
      description: formDescription.value,
      genre: formGenre.value,
      platform: formPlatform.value,
      release_year: formReleaseYear.value ? parseInt(formReleaseYear.value) : null,
      developer: formDeveloper.value,
      publisher: formPublisher.value,
      rating: formRating.value
    }

    if (editingGame.value) {
      const { error } = await supabase
        .from('games')
        .update(gameData)
        .eq('id', editingGame.value.id)
      if (error) {
        formError.value = error.message
      } else {
        addToast(`"${formName.value}" actualizado correctamente`)
        closeForm()
        await fetchGames()
      }
    } else {
      gameData.user_id = user.value.id
      const { error } = await supabase
        .from('games')
        .insert(gameData)
      if (error) {
        formError.value = error.message
      } else {
        addToast(`"${formName.value}" agregado correctamente`)
        closeForm()
        await fetchGames()
      }
    }
  } catch (e) {
    formError.value = 'Error de conexión. Intenta de nuevo.'
  } finally {
    clearTimeout(safetyTimeout)
    formLoading.value = false
  }
}

async function deleteGame(game) {
  if (!confirm(`¿Eliminar "${game.name}"?`)) return
  try {
    const { error } = await supabase.from('games').delete().eq('id', game.id)
    if (error) {
      addToast('Error al eliminar: ' + error.message, 'error')
    } else {
      addToast(`"${game.name}" eliminado`, 'info')
      await fetchGames()
      if (paginatedGames.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
      }
    }
  } catch (e) {
    addToast('Error de conexión al eliminar', 'error')
  }
}
</script>

<template>
  <div class="games-page">
    <div class="games-header">
      <h1>Videojuegos</h1>
      <button class="btn-primary" @click="openCreate">+ Agregar juego</button>
    </div>

    <div class="search-bar">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar videojuegos por nombre..."
        @input="onSearch"
      />
    </div>

    <!-- Modal Form -->
    <Transition name="fade">
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal">
          <h2>{{ editingGame ? 'Editar juego' : 'Agregar juego' }}</h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre *</label>
                <input v-model="formName" type="text" placeholder="Nombre del juego" required />
              </div>
              <div class="form-group">
                <label>Año de lanzamiento</label>
                <input v-model="formReleaseYear" type="number" placeholder="2024" min="1970" max="2030" />
              </div>
            </div>
            <div class="form-group">
              <label>URL de imagen *</label>
              <input v-model="formImage" type="url" placeholder="https://ejemplo.com/imagen.jpg" required />
            </div>
            <div v-if="formImage" class="image-preview">
              <img :src="formImage" alt="Preview" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Género</label>
                <input v-model="formGenre" type="text" placeholder="RPG, Acción, etc." />
              </div>
              <div class="form-group">
                <label>Plataforma</label>
                <input v-model="formPlatform" type="text" placeholder="PC, PS5, Xbox..." />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Desarrollador</label>
                <input v-model="formDeveloper" type="text" placeholder="Studio..." />
              </div>
              <div class="form-group">
                <label>Publisher</label>
                <input v-model="formPublisher" type="text" placeholder="Publisher..." />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Clasificación</label>
                <input v-model="formRating" type="text" placeholder="E, T, M..." />
              </div>
              <div class="form-group"></div>
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea v-model="formDescription" placeholder="Descripción del juego..." rows="3"></textarea>
            </div>
            <p v-if="formError" class="error">{{ formError }}</p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeForm">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="formLoading">
                {{ formLoading ? 'Guardando...' : (editingGame ? 'Guardar cambios' : 'Agregar') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="games-grid">
      <div v-for="n in 8" :key="n" class="game-card skeleton-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton-info">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-id"></div>
          <div class="skeleton-actions">
            <div class="skeleton skeleton-btn"></div>
            <div class="skeleton skeleton-btn"></div>
          </div>
        </div>
      </div>
    </div>

    <p v-else-if="filteredGames.length === 0" class="status">
      {{ search ? 'No se encontraron resultados' : 'No hay videojuegos aún. ¡Agrega el primero!' }}
    </p>

    <template v-else>
      <p class="results-count">
        {{ filteredGames.length }} juego{{ filteredGames.length !== 1 ? 's' : '' }}
        <span v-if="search"> encontrado{{ filteredGames.length !== 1 ? 's' : '' }}</span>
        <span v-if="totalPages > 1"> &middot; Página {{ currentPage }} de {{ totalPages }}</span>
      </p>

      <div class="games-grid">
        <div v-for="game in paginatedGames" :key="game.id" class="game-card" @click="viewGame(game)">
          <img :src="game.image" :alt="game.name" class="game-image" loading="lazy" />
          <div class="game-info">
            <h3>{{ game.name }}</h3>
            <div class="game-tags">
              <span v-if="game.genre" class="tag tag-genre">{{ game.genre }}</span>
              <span v-if="game.release_year" class="tag tag-year">{{ game.release_year }}</span>
            </div>
            <p v-if="game.platform" class="game-platform">{{ game.platform }}</p>
            <div class="game-actions" @click.stop>
              <template v-if="canEdit(game)">
                <button class="btn-secondary btn-sm" @click="openEdit(game)">Editar</button>
                <button class="btn-danger btn-sm" @click="deleteGame(game)">Eliminar</button>
              </template>
              <span v-else class="owner-tag">Otro usuario</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          &laquo;
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          &raquo;
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.games-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.games-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.games-header h1 {
  color: var(--accent);
}

.search-bar input {
  width: 100%;
  padding: 14px 20px;
  font-size: 1.05rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.results-count {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.game-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.game-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.game-info {
  padding: 16px;
}

.game-info h3 {
  color: var(--text);
  margin-bottom: 6px;
  font-size: 1.05rem;
}

.game-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.tag-genre {
  background: var(--accent-bg, rgba(0, 212, 255, 0.15));
  color: var(--accent);
}

.tag-year {
  background: rgba(108, 92, 231, 0.2);
  color: #a29bfe;
}

.game-platform {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-bottom: 10px;
}

.game-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.85rem;
}

.owner-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.status {
  text-align: center;
  color: var(--text-muted);
  padding: 60px 0;
  font-size: 1.1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 8px;
}

.page-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text);
  border: 1px solid var(--border);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.page-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Skeleton */
.skeleton-card {
  cursor: default;
}

.skeleton-card:hover {
  transform: none;
  box-shadow: none;
}

.skeleton {
  background: linear-gradient(90deg, var(--border) 25%, #3a3a5a 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-image {
  width: 100%;
  height: 180px;
  border-radius: 0;
}

.skeleton-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-title {
  height: 20px;
  width: 80%;
}

.skeleton-id {
  height: 14px;
  width: 50%;
}

.skeleton-actions {
  display: flex;
  gap: 8px;
}

.skeleton-btn {
  height: 30px;
  width: 70px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  color: var(--accent);
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.image-preview {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.image-preview img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.error {
  color: var(--danger);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .games-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  .games-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>
