<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { addToast } = useToast()
const { canEdit } = useAuth()

const game = ref(null)
const loading = ref(true)
const editing = ref(false)
const formLoading = ref(false)

const form = ref({
  name: '', image: '', description: '', genre: '', platform: '',
  release_year: '', developer: '', publisher: '', rating: '',
  min_cpu: '', min_ram: '', min_gpu: '', min_storage: '',
  rec_cpu: '', rec_ram: '', rec_gpu: ''
})

const hasMinReqs = computed(() => {
  const g = game.value
  return g && (g.min_cpu || g.min_ram || g.min_gpu || g.min_storage)
})

const hasRecReqs = computed(() => {
  const g = game.value
  return g && (g.rec_cpu || g.rec_ram || g.rec_gpu)
})

onMounted(async () => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', route.params.id)
    .single()
  if (error || !data) {
    router.push('/games')
    return
  }
  game.value = data
  loading.value = false
})

function startEdit() {
  const g = game.value
  form.value = {
    name: g.name, image: g.image, description: g.description || '',
    genre: g.genre || '', platform: g.platform || '',
    release_year: g.release_year || '', developer: g.developer || '',
    publisher: g.publisher || '', rating: g.rating || '',
    min_cpu: g.min_cpu || '', min_ram: g.min_ram || '',
    min_gpu: g.min_gpu || '', min_storage: g.min_storage || '',
    rec_cpu: g.rec_cpu || '', rec_ram: g.rec_ram || '', rec_gpu: g.rec_gpu || ''
  }
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function saveEdit() {
  if (!form.value.name.trim() || !form.value.image.trim()) return
  formLoading.value = true
  try {
    const updateData = {
      ...form.value,
      release_year: form.value.release_year ? parseInt(form.value.release_year) : null
    }
    const { error } = await supabase
      .from('games')
      .update(updateData)
      .eq('id', game.value.id)
    if (error) {
      addToast('Error al guardar: ' + error.message, 'error')
    } else {
      Object.assign(game.value, updateData)
      editing.value = false
      addToast('Juego actualizado correctamente')
    }
  } catch (e) {
    addToast('Error de conexión. Intenta de nuevo.', 'error')
  } finally {
    formLoading.value = false
  }
}

async function deleteGame() {
  if (!confirm(`Eliminar "${game.value.name}"?`)) return
  const { error } = await supabase.from('games').delete().eq('id', game.value.id)
  if (error) {
    addToast('Error al eliminar: ' + error.message, 'error')
  } else {
    addToast(`"${game.value.name}" eliminado`, 'error')
    router.push('/games')
  }
}
</script>

<template>
  <div v-if="loading" class="detail-loading">
    <div class="skeleton skeleton-detail-img"></div>
    <div class="skeleton skeleton-detail-title"></div>
  </div>

  <div v-else-if="game" class="game-detail">
    <button class="btn-back" @click="router.push('/games')">&larr; Volver a la lista</button>

    <!-- VIEW MODE -->
    <template v-if="!editing">
      <!-- Hero Section -->
      <div class="detail-hero">
        <img :src="game.image" :alt="game.name" class="hero-image" />
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="detail-tags">
              <span v-if="game.genre" class="tag tag-genre">{{ game.genre }}</span>
              <span v-if="game.release_year" class="tag tag-year">{{ game.release_year }}</span>
              <span v-if="game.rating" class="tag tag-rating">{{ game.rating }}</span>
            </div>
            <h1>{{ game.name }}</h1>
            <div class="hero-meta" v-if="game.developer || game.publisher">
              <span v-if="game.developer">{{ game.developer }}</span>
              <span v-if="game.developer && game.publisher" class="separator">/</span>
              <span v-if="game.publisher" class="publisher">{{ game.publisher }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="info-grid">
        <!-- Description -->
        <div class="info-section description-section" v-if="game.description">
          <h2>Descripción</h2>
          <p>{{ game.description }}</p>
        </div>

        <!-- Details Sidebar -->
        <div class="info-section details-section">
          <h2>Detalles</h2>
          <div class="detail-list">
            <div v-if="game.platform" class="detail-row">
              <span class="detail-label">Plataformas</span>
              <span class="detail-value">{{ game.platform }}</span>
            </div>
            <div v-if="game.genre" class="detail-row">
              <span class="detail-label">Género</span>
              <span class="detail-value">{{ game.genre }}</span>
            </div>
            <div v-if="game.developer" class="detail-row">
              <span class="detail-label">Desarrollador</span>
              <span class="detail-value">{{ game.developer }}</span>
            </div>
            <div v-if="game.publisher" class="detail-row">
              <span class="detail-label">Publisher</span>
              <span class="detail-value">{{ game.publisher }}</span>
            </div>
            <div v-if="game.release_year" class="detail-row">
              <span class="detail-label">Lanzamiento</span>
              <span class="detail-value">{{ game.release_year }}</span>
            </div>
            <div v-if="game.rating" class="detail-row">
              <span class="detail-label">Clasificación</span>
              <span class="detail-value">{{ game.rating }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ID</span>
              <span class="detail-value mono">{{ game.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Agregado</span>
              <span class="detail-value">{{ new Date(game.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- System Requirements -->
      <div class="requirements-grid" v-if="hasMinReqs || hasRecReqs">
        <div class="info-section" v-if="hasMinReqs">
          <h2>Requisitos mínimos</h2>
          <div class="req-list">
            <div v-if="game.min_cpu" class="req-item">
              <span class="req-icon">CPU</span>
              <span>{{ game.min_cpu }}</span>
            </div>
            <div v-if="game.min_ram" class="req-item">
              <span class="req-icon">RAM</span>
              <span>{{ game.min_ram }}</span>
            </div>
            <div v-if="game.min_gpu" class="req-item">
              <span class="req-icon">GPU</span>
              <span>{{ game.min_gpu }}</span>
            </div>
            <div v-if="game.min_storage" class="req-item">
              <span class="req-icon">DISCO</span>
              <span>{{ game.min_storage }}</span>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="hasRecReqs">
          <h2>Requisitos recomendados</h2>
          <div class="req-list">
            <div v-if="game.rec_cpu" class="req-item">
              <span class="req-icon">CPU</span>
              <span>{{ game.rec_cpu }}</span>
            </div>
            <div v-if="game.rec_ram" class="req-item">
              <span class="req-icon">RAM</span>
              <span>{{ game.rec_ram }}</span>
            </div>
            <div v-if="game.rec_gpu" class="req-item">
              <span class="req-icon">GPU</span>
              <span>{{ game.rec_gpu }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="canEdit(game)" class="detail-actions">
        <button class="btn-primary" @click="startEdit">Editar juego</button>
        <button class="btn-danger" @click="deleteGame">Eliminar juego</button>
      </div>
      <div v-else class="no-permissions">
        Solo el creador de este juego o un admin pueden editarlo.
      </div>
    </template>

    <!-- EDIT MODE -->
    <div v-else class="edit-form-container">
      <div class="edit-header">
        <h2>Editar juego</h2>
        <div v-if="form.image" class="edit-image-preview">
          <img :src="form.image" :alt="form.name" />
        </div>
      </div>

      <div class="edit-sections">
        <div class="edit-section">
          <h3>Información general</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="form.name" type="text" />
            </div>
            <div class="form-group">
              <label>Año de lanzamiento</label>
              <input v-model="form.release_year" type="number" min="1970" max="2030" />
            </div>
          </div>
          <div class="form-group">
            <label>URL de imagen *</label>
            <input v-model="form.image" type="url" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Género</label>
              <input v-model="form.genre" type="text" placeholder="RPG, Acción, etc." />
            </div>
            <div class="form-group">
              <label>Plataforma</label>
              <input v-model="form.platform" type="text" placeholder="PC, PS5, Xbox..." />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Desarrollador</label>
              <input v-model="form.developer" type="text" />
            </div>
            <div class="form-group">
              <label>Publisher</label>
              <input v-model="form.publisher" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Clasificación (Rating)</label>
              <input v-model="form.rating" type="text" placeholder="E, T, M..." />
            </div>
            <div class="form-group"></div>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.description" rows="4"></textarea>
          </div>
        </div>

        <div class="edit-section">
          <h3>Requisitos mínimos</h3>
          <div class="form-row">
            <div class="form-group">
              <label>CPU</label>
              <input v-model="form.min_cpu" type="text" placeholder="Intel Core i5-8400..." />
            </div>
            <div class="form-group">
              <label>RAM</label>
              <input v-model="form.min_ram" type="text" placeholder="8 GB" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>GPU</label>
              <input v-model="form.min_gpu" type="text" placeholder="GTX 1060..." />
            </div>
            <div class="form-group">
              <label>Almacenamiento</label>
              <input v-model="form.min_storage" type="text" placeholder="50 GB SSD" />
            </div>
          </div>
        </div>

        <div class="edit-section">
          <h3>Requisitos recomendados</h3>
          <div class="form-row">
            <div class="form-group">
              <label>CPU</label>
              <input v-model="form.rec_cpu" type="text" />
            </div>
            <div class="form-group">
              <label>RAM</label>
              <input v-model="form.rec_ram" type="text" />
            </div>
          </div>
          <div class="form-group">
            <label>GPU</label>
            <input v-model="form.rec_gpu" type="text" />
          </div>
        </div>
      </div>

      <div class="detail-actions">
        <button class="btn-secondary" @click="cancelEdit">Cancelar</button>
        <button class="btn-primary" :disabled="formLoading" @click="saveEdit">
          {{ formLoading ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-back {
  background: none;
  color: var(--accent);
  padding: 8px 0;
  font-size: 1rem;
  margin-bottom: 20px;
}

.btn-back:hover {
  text-decoration: underline;
}

/* Hero */
.detail-hero {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  height: 400px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 15, 35, 0.95) 0%, rgba(15, 15, 35, 0.4) 50%, transparent 100%);
  display: flex;
  align-items: flex-end;
}

.hero-content {
  padding: 40px;
  width: 100%;
}

.hero-content h1 {
  color: white;
  font-size: 2.5rem;
  line-height: 1.2;
  margin: 12px 0 8px;
}

.hero-meta {
  color: rgba(255,255,255,0.7);
  font-size: 1rem;
}

.hero-meta .separator {
  margin: 0 8px;
  opacity: 0.5;
}

.hero-meta .publisher {
  opacity: 0.8;
}

/* Tags */
.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.tag-genre {
  background: rgba(0, 212, 255, 0.2);
  color: var(--accent);
}

.tag-year {
  background: rgba(108, 92, 231, 0.25);
  color: #a29bfe;
}

.tag-rating {
  background: rgba(46, 213, 115, 0.2);
  color: var(--success);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.info-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px;
}

.info-section h2 {
  color: var(--accent);
  font-size: 1.1rem;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description-section p {
  color: var(--text);
  line-height: 1.8;
  font-size: 0.95rem;
}

/* Detail List */
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  color: var(--text-muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.detail-value {
  color: var(--text);
  font-size: 0.9rem;
}

.detail-value.mono {
  font-family: monospace;
  font-size: 0.75rem;
  word-break: break-all;
  color: var(--text-muted);
}

/* Requirements */
.requirements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.req-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.req-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.req-icon {
  background: var(--bg-input);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 46px;
  text-align: center;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.req-item span:last-child {
  color: var(--text);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Actions */
.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* Edit Mode */
.edit-form-container {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.edit-header h2 {
  color: var(--accent);
  font-size: 1.5rem;
}

.edit-image-preview {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.edit-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-sections {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.edit-section h3 {
  color: var(--text);
  font-size: 1rem;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-group label {
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Skeleton */
.detail-loading {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton {
  background: linear-gradient(90deg, var(--border) 25%, #3a3a5a 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

.skeleton-detail-img {
  height: 400px;
}

.skeleton-detail-title {
  height: 40px;
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.no-permissions {
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-input);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 768px) {
  .detail-hero {
    height: 280px;
  }

  .hero-content {
    padding: 24px;
  }

  .hero-content h1 {
    font-size: 1.8rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .requirements-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .edit-header {
    flex-direction: column;
    gap: 16px;
  }

  .edit-image-preview {
    width: 100%;
    height: 150px;
  }
}
</style>
