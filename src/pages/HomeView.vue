<template>
  <div class="home-page">
    <!-- Navbar -->
    <NavBar />

    <!-- Hero con carrusel -->
    <section class="hero">
      <div class="hero-carrusel">
        <div 
          v-for="(slide, index) in slides" 
          :key="index" 
          class="slide"
          :class="{ active: index === activeSlide }"
        >
          <h2>{{ slide.titulo }}</h2>
          <p>{{ slide.descripcion }}</p>
        </div>
      </div>
      <div class="carrusel-nav">
        <button @click="prevSlide"><i class="pi pi-angle-left"></i></button>
        <button @click="nextSlide"><i class="pi pi-angle-right"></i></button>
      </div>
    </section>

    <!-- Conoce tiendas -->
    <section class="conoce-tiendas">
      <h2>Conoce tiendas</h2>
      
      <div v-if="loadingTiendas" class="loading">
        <i class="pi pi-spin pi-spinner"></i> Cargando tiendas...
      </div>
      
      <div v-else-if="error" class="error-message">
        <i class="pi pi-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="cargarTiendas" class="btn-retry">Reintentar</button>
      </div>
      
      <div v-else-if="tiendas.length > 0" class="tiendas-grid">
        <div 
          v-for="tienda in tiendas" 
          :key="tienda.id" 
          class="tarjeta-tienda"
          @click="irTiendaPublica(tienda.id)"
        >
          <div class="foto-tienda">
            <img 
              v-if="tienda.fotoPerfil" 
              :src="tienda.fotoPerfil" 
              :alt="tienda.nombre"
            />
            <div v-else class="imagen-placeholder">
              <i class="pi pi-shop"></i>
            </div>
          </div>
          <div class="tienda-info">
            <h3>{{ tienda.nombre }}</h3>
            <p>{{ tienda.descripcion || 'Sin descripción' }}</p>
            <div class="tienda-meta" v-if="tienda.propietario">
              <i class="pi pi-user"></i>
              <span>{{ tienda.propietario.nombre }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="sin-tiendas">
        <i class="pi pi-shop"></i>
        <p>No hay tiendas disponibles en este momento</p>
      </div>
    </section>

    <!-- Explora por categorías -->
    <section class="explora-categorias">
      <h2>Explora por categorías</h2>
      <div class="categorias-grid">
        <div 
          v-for="categoria in categoriasPrincipales" 
          :key="categoria.id"
          class="categoria-card"
          @click="irCategoria(categoria.id)"
        >
          <span class="categoria-icono">{{ categoria.icono }}</span>
          <span class="categoria-nombre">{{ categoria.nombre }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tiendasService } from '../services/tiendasService'
import categoriasService from '../services/categoriasService'
import NavBar from '../components/NavBar.vue'

const router = useRouter()

// Carrusel
const slides = [
  { titulo: 'Conoce la app', descripcion: 'Descubre cómo Chichawasi facilita la venta de ropa usada.' },
  { titulo: 'Comienza a vender', descripcion: 'Crea tu tienda y llega a más clientes en Sucre.' },
  { titulo: 'Promociona tus productos', descripcion: 'Organiza y muestra tus productos de forma fácil.' }
]
const activeSlide = ref(0)

const nextSlide = () => {
  activeSlide.value = (activeSlide.value + 1) % slides.length
}
const prevSlide = () => {
  activeSlide.value = (activeSlide.value - 1 + slides.length) % slides.length
}

// Tiendas
const tiendas = ref([])
const loadingTiendas = ref(false)
const error = ref('')

// Categorías
const categoriasPrincipales = ref([])

onMounted(async () => {
  await cargarTiendas()
  await cargarCategorias()
})

const cargarTiendas = async () => {
  loadingTiendas.value = true
  error.value = ''
  
  try {
    const result = await tiendasService.obtenerTiendasPublicas()
    console.log('Resultado de tiendas:', result) // Para debug
    
    if (result.success) {
      tiendas.value = result.data || []
    } else {
      error.value = result.error || 'Error al cargar las tiendas'
      console.error('Error en servicio:', result.error)
    }
  } catch (err) {
    error.value = 'Error de conexión al cargar las tiendas'
    console.error('Error al cargar tiendas:', err)
  } finally {
    loadingTiendas.value = false
  }
}

const cargarCategorias = async () => {
  try {
    const resultCategorias = await categoriasService.obtenerTodasCategorias(true, true)
    categoriasPrincipales.value = resultCategorias
  } catch (err) {
    console.error('Error al cargar categorías:', err)
  }
}

const irTiendaPublica = (id) => {
  router.push(`/tienda-publica/${id}`)
}

const irCategoria = (id) => {
  router.push(`/categoria/${id}`)
}
</script>

<style scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Hero carrusel */
.hero {
  position: relative;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
  padding: 60px 20px;
  border-radius: 20px;
  margin-bottom: 40px;
  text-align: center;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.hero p {
  font-size: 1.2rem;
}

.hero-carrusel {
  width: 100%;
}

.hero-carrusel .slide {
  display: none;
  transition: opacity 0.5s ease;
}

.hero-carrusel .slide.active {
  display: block;
}

.carrusel-nav {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  padding: 0 20px;
}

.carrusel-nav button {
  background: rgba(255,255,255,0.3);
  border: none;
  padding: 10px 15px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.carrusel-nav button:hover {
  background: rgba(255,255,255,0.5);
}

/* Secciones */
.conoce-tiendas,
.explora-categorias {
  margin-bottom: 60px;
}

.conoce-tiendas h2,
.explora-categorias h2 {
  color: var(--cafe);
  margin-bottom: 30px;
  font-size: 1.8rem;
  text-align: center;
}

/* Loading y Error */
.loading {
  text-align: center;
  padding: 40px;
  color: var(--gris-claro);
}

.loading i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.error-message {
  text-align: center;
  padding: 40px;
  background: #fee;
  border-radius: 15px;
  color: #c33;
}

.error-message i {
  font-size: 3rem;
  margin-bottom: 15px;
}

.btn-retry {
  margin-top: 15px;
  padding: 10px 20px;
  background: var(--cafe);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.btn-retry:hover {
  background: var(--naranja-opaco);
}

/* Tiendas */
.tiendas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.tarjeta-tienda {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--cafe-claro);
}

.tarjeta-tienda:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(111,72,39,0.2);
  border-color: var(--naranja-opaco);
}

.foto-tienda {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
}

.foto-tienda img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagen-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 4rem;
}

.tienda-info {
  padding: 20px;
}

.tienda-info h3 {
  color: var(--cafe);
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.tienda-info p {
  color: var(--gris-claro);
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tienda-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gris-oscuro);
  font-size: 0.85rem;
}

.tienda-meta i {
  color: var(--naranja-opaco);
}

/* Sin tiendas */
.sin-tiendas {
  text-align: center;
  padding: 60px 20px;
  color: var(--gris-claro);
}

.sin-tiendas i {
  font-size: 4rem;
  margin-bottom: 15px;
  color: var(--cafe-claro);
}

/* Categorías */
.categorias-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.categoria-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
  padding: 15px 25px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.categoria-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(111,72,39,0.3);
}

.categoria-icono {
  font-size: 1.5rem;
}

.categoria-nombre {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .tiendas-grid {
    grid-template-columns: 1fr;
  }

  .hero h2 {
    font-size: 1.5rem;
  }

  .hero p {
    font-size: 1rem;
  }

  .categorias-grid {
    justify-content: stretch;
  }

  .categoria-card {
    flex: 1 1 calc(50% - 10px);
    justify-content: center;
  }
}
</style>