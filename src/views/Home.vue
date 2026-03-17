<script setup>
</script>

<template>
  <div class="home">
    <section class="hero">
      <h1>GameVault</h1>
      <p class="subtitle">Tu colección definitiva de videojuegos</p>
      <p class="description">
        Descubre, organiza y gestiona tu biblioteca de videojuegos favoritos.
        Desde clásicos retro hasta los últimos lanzamientos, GameVault te permite
        mantener un registro completo de todos los juegos que amas.
      </p>
      <div class="cta">
        <router-link to="/register" class="btn-primary btn-large">Comenzar ahora</router-link>
        <router-link to="/login" class="btn-secondary btn-large">Ya tengo cuenta</router-link>
      </div>
    </section>

    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">🎮</div>
        <h3>Catálogo completo</h3>
        <p>Explora una colección de videojuegos con imágenes, nombres y detalles de cada título.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔍</div>
        <h3>Búsqueda rápida</h3>
        <p>Encuentra cualquier juego en segundos con nuestra barra de búsqueda en tiempo real.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✏️</div>
        <h3>Gestión total</h3>
        <p>Agrega, edita y elimina videojuegos de tu colección con total libertad.</p>
      </div>
    </section>

    <section class="info">
      <h2>Sobre los videojuegos</h2>
      <p>
        Los videojuegos son una de las formas de entretenimiento más populares del mundo.
        Desde los primeros arcades de los años 70 como Pong y Space Invaders, hasta las
        experiencias inmersivas de mundo abierto actuales como Elden Ring y Zelda: Tears of
        the Kingdom, la industria ha evolucionado de manera impresionante.
      </p>
      <br />
      <p>
        Hoy en día, los videojuegos no solo son entretenimiento: son arte, narrativa interactiva,
        competición deportiva (esports) y una comunidad global que conecta a millones de jugadores.
        Géneros como RPG, FPS, aventura, estrategia, simulación y plataformas ofrecen
        experiencias para todos los gustos.
      </p>
      <br />
      <p>
        Con GameVault puedes registrar y organizar todos tus títulos favoritos en un solo lugar.
        Ya seas fan de Nintendo, PlayStation, Xbox o PC, esta es tu plataforma.
      </p>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.hero {
  text-align: center;
  padding: 60px 0 20px;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 1.3rem;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.description {
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.7;
  color: var(--text);
}

.cta {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-large {
  display: inline-block;
  padding: 14px 32px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: transform 0.1s;
}

.btn-large:hover {
  text-decoration: none;
  transform: scale(1.03);
}

.btn-primary.btn-large {
  background: var(--primary);
  color: white;
}

.btn-secondary.btn-large {
  background: var(--border);
  color: var(--text);
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  color: var(--accent);
  margin-bottom: 8px;
}

.feature-card p {
  color: var(--text-muted);
  line-height: 1.6;
}

.info {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 40px;
}

.info h2 {
  color: var(--accent);
  margin-bottom: 16px;
}

.info p {
  line-height: 1.8;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
  .hero h1 {
    font-size: 2.5rem;
  }
  .cta {
    flex-direction: column;
    align-items: center;
  }
}
</style>
