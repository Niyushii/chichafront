<template>
  <div class="home-page">

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
      <div v-else class="tiendas-grid">
        <div 
          v-for="tienda in tiendas" 
          :key="tienda.id" 
          class="tarjeta-tienda"
          @click="irTiendaPublica(tienda.id)"
        >
          <div class="foto-tienda">
            <img :src="tienda.fotoPerfil || placeholder" :alt="tienda.nombre" />
          </div>
          <h3>{{ tienda.nombre }}</h3>
          <p>{{ tienda.descripcion || 'Sin descripción' }}</p>
        </div>
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
          <span>{{ categoria.nombre }}</span>
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
const placeholder = '/placeholder.png'

// Categorías
const categoriasPrincipales = ref([])
const error = ref('')

onMounted(async () => {
  await cargarTiendas()
  await cargarCategorias()
})

const cargarTiendas = async () => {
  loadingTiendas.value = true
  const result = await tiendasService.obtenerTiendasPublicas()
  if (result.success) {
    tiendas.value = result.data
  } else {
    error.value = result.error
  }
  loadingTiendas.value = false
}

const cargarCategorias = async () => {
  try {
    const resultCategorias = await categoriasService.obtenerTodasCategorias(true, true)
    categoriasPrincipales.value = resultCategorias
  } catch (err) {
    error.value = 'Error al cargar categorías: ' + err.message
  }
}

const irTiendaPublica = (id) => {
  router.push(`/tienda/${id}/publica`)
}

const irCategoria = (id) => {
  router.push(`/categoria/${id}`)
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
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
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.hero p {
  font-size: 1.2rem;
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
}

.carrusel-nav button {
  background: rgba(255,255,255,0.2);
  border: none;
  padding: 10px 15px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
}

/* Conoce tiendas */
.conoce-tiendas h2,
.explora-categorias h2 {
  color: var(--cafe);
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.tiendas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.tarjeta-tienda {
  background: white;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--cafe-claro);
}

.tarjeta-tienda:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(111,72,39,0.2);
}

.foto-tienda {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 10px;
}

.foto-tienda img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Categorías */
.categorias-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.categoria-card {
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
  padding: 15px 25px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.categoria-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(111,72,39,0.3);
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--gris-claro);
}

.loading i {
  font-size: 2rem;
}
</style>
