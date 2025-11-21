<template>
  <div class="categorias-view">
    <!-- Header con título de la categoría -->
    <div class="header-categoria">
      <button @click="volver" class="btn-volver">
        <i class="pi pi-arrow-left"></i>
        <span>Volver</span>
      </button>
      
      <div v-if="!cargando && categoriaActual" class="info-categoria">
        <h1>{{ categoriaActual.nombre }}</h1>
        <p v-if="categoriaActual.descripcion" class="descripcion">
          {{ categoriaActual.descripcion }}
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: var(--cafe);"></i>
      <p>Cargando productos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="mensaje-error">
      <i class="pi pi-exclamation-triangle"></i>
      <span>{{ error }}</span>
    </div>

    <!-- Contenido principal -->
    <div v-else class="contenido">
      <!-- Sidebar con filtros -->
      <aside class="sidebar-filtros">
        <div class="filtros-card">
          <h3><i class="pi pi-filter"></i> Filtros</h3>

          <!-- Filtro por subcategorías -->
          <div v-if="subcategorias.length > 0" class="filtro-grupo">
            <h4>Subcategorías</h4>
            <div class="opciones">
              <label class="opcion-filtro">
                <input 
                  type="radio" 
                  :value="null" 
                  v-model="filtros.subcategoriaId"
                  @change="aplicarFiltros"
                />
                <span>Todas</span>
              </label>
              <label 
                v-for="sub in subcategorias" 
                :key="sub.id"
                class="opcion-filtro"
              >
                <input 
                  type="radio" 
                  :value="sub.id" 
                  v-model="filtros.subcategoriaId"
                  @change="aplicarFiltros"
                />
                <span>{{ sub.nombre }}</span>
              </label>
            </div>
          </div>

          <!-- Filtro por tallas -->
          <div v-if="tallas.length > 0" class="filtro-grupo">
            <h4>Tallas</h4>
            <div class="opciones">
              <label class="opcion-filtro">
                <input 
                  type="checkbox" 
                  :checked="filtros.tallasIds.length === 0"
                  @change="limpiarFiltroTallas"
                />
                <span>Todas</span>
              </label>
              <label 
                v-for="talla in tallas" 
                :key="talla.id"
                class="opcion-filtro"
              >
                <input 
                  type="checkbox" 
                  :value="talla.id" 
                  v-model="filtros.tallasIds"
                  @change="aplicarFiltros"
                />
                <span>{{ talla.nombre }}</span>
              </label>
            </div>
          </div>

          <!-- Ordenar por precio -->
          <div class="filtro-grupo">
            <h4>Ordenar por precio</h4>
            <div class="opciones">
              <label class="opcion-filtro">
                <input 
                  type="radio" 
                  value="asc" 
                  v-model="filtros.ordenPrecio"
                  @change="aplicarFiltros"
                />
                <span><i class="pi pi-arrow-up"></i> Menor a mayor</span>
              </label>
              <label class="opcion-filtro">
                <input 
                  type="radio" 
                  value="desc" 
                  v-model="filtros.ordenPrecio"
                  @change="aplicarFiltros"
                />
                <span><i class="pi pi-arrow-down"></i> Mayor a menor</span>
              </label>
              <label class="opcion-filtro">
                <input 
                  type="radio" 
                  value="" 
                  v-model="filtros.ordenPrecio"
                  @change="aplicarFiltros"
                />
                <span>Sin ordenar</span>
              </label>
            </div>
          </div>

          <!-- Botón limpiar filtros -->
          <button 
            v-if="hayFiltrosActivos" 
            @click="limpiarFiltros"
            class="btn-limpiar"
          >
            <i class="pi pi-times"></i>
            Limpiar filtros
          </button>
        </div>
      </aside>

      <!-- Grid de productos -->
      <main class="productos-grid">
        <div class="productos-header">
          <p class="contador-productos">
            {{ productosFiltrados.length }} producto{{ productosFiltrados.length !== 1 ? 's' : '' }} encontrado{{ productosFiltrados.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Sin productos -->
        <div v-if="productosFiltrados.length === 0" class="sin-productos">
          <i class="pi pi-inbox"></i>
          <h3>No hay productos disponibles</h3>
          <p>{{ hayFiltrosActivos ? 'Intenta ajustar los filtros' : 'Aún no hay productos en esta categoría' }}</p>
        </div>

        <!-- Tarjetas de productos -->
        <div v-else class="productos-lista">
          <div 
            v-for="producto in productosFiltrados" 
            :key="producto.id"
            class="producto-card"
            @click="verProducto(producto)"
          >
            <div class="producto-imagen">
              <img 
                v-if="producto.imagenes && producto.imagenes.length > 0" 
                :src="producto.imagenes[0].archivo" 
                :alt="producto.producto?.nombre || 'Producto'"
              />
              <div v-else class="imagen-placeholder">
                <i class="pi pi-image"></i>
              </div>
              
              <div v-if="producto.talla" class="badge-talla">
                {{ producto.talla.nombre }}
              </div>
            </div>

            <div class="producto-info">
              <h3>{{ producto.producto.nombre }}</h3>
              <p v-if="producto.descripcion" class="descripcion-corta">
                {{ producto.descripcion }}
              </p>
              <div class="producto-footer">
                <span class="precio">Bs {{ formatearPrecio(producto.precio) }}</span>
                <span v-if="producto.producto.categoria" class="categoria-badge">
                  {{ producto.producto.categoria.nombre }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productosService } from '../services/productosService'
import categoriasService from '../services/categoriasService'
import { tallasService } from '../services/tallasService'

const router = useRouter()
const route = useRoute()

const categoriaId = route.params.categoriaId

const cargando = ref(true)
const error = ref('')

const categoriaActual = ref(null)
const subcategorias = ref([])
const tallas = ref([])
const productosOriginales = ref([])

const filtros = ref({
  subcategoriaId: null,
  tallasIds: [],
  ordenPrecio: ''
})

onMounted(async () => {
  await cargarDatos()
})

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''

  try {
    // Cargar categoría actual
    categoriaActual.value = await categoriasService.obtenerCategoriaPorId(categoriaId)
    
    // Cargar subcategorías
    const subs = await categoriasService.obtenerSubcategorias(categoriaId)
    subcategorias.value = subs || []
    
    // Cargar tallas
    tallas.value = await tallasService.obtenerTodas()
    
    // Cargar productos de la categoría y sus subcategorías
    await cargarProductos()
    
    cargando.value = false
  } catch (err) {
    cargando.value = false
    error.value = 'Error al cargar datos: ' + err.message
    console.error('Error:', err)
  }
}

const cargarProductos = async () => {
  try {
    const categoriasIds = [categoriaId, ...subcategorias.value.map(s => s.id)];

    const promesas = categoriasIds.map(async (catId) => {
      try {
        return await productosService.obtenerPorCategoria(catId);
      } catch (err) {
        console.error("Error al cargar productos de categoría " + catId, err);
        return [];
      }
    });

    const resultados = await Promise.all(promesas);
    productosOriginales.value = resultados.flat();
  } catch (err) {
    console.error("Error al cargar productos:", err);
    throw err;
  }
};


const productosFiltrados = computed(() => {
  let productos = [...productosOriginales.value]

  // Filtrar por subcategoría
  if (filtros.value.subcategoriaId) {
    productos = productos.filter(p => 
      p.producto?.categoria?.id === filtros.value.subcategoriaId
    )
  }

  // Filtrar por tallas
  if (filtros.value.tallasIds.length > 0) {
    productos = productos.filter(p => 
      p.talla && filtros.value.tallasIds.includes(p.talla.id)
    )
  }

  // Ordenar por precio
  if (filtros.value.ordenPrecio === 'asc') {
    productos.sort((a, b) => a.precio - b.precio)
  } else if (filtros.value.ordenPrecio === 'desc') {
    productos.sort((a, b) => b.precio - a.precio)
  }

  return productos
})

const hayFiltrosActivos = computed(() => {
  return filtros.value.subcategoriaId !== null ||
         filtros.value.tallasIds.length > 0 ||
         filtros.value.ordenPrecio !== ''
})

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente por el computed
}

const limpiarFiltros = () => {
  filtros.value = {
    subcategoriaId: null,
    tallasIds: [],
    ordenPrecio: ''
  }
}

const limpiarFiltroTallas = () => {
  filtros.value.tallasIds = []
}

const formatearPrecio = (precio) => {
  return parseFloat(precio).toFixed(2)
}

const verProducto = (producto) => {
  // Navegar al detalle del producto
  router.push(`/producto/${producto.id}`)
}

const volver = () => {
  router.push('/')
}
</script>

<style scoped>
.categorias-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--crema) 0%, #fff8f0 100%);
}

.header-categoria {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: transparent;
  color: var(--cafe);
  border: 2px solid var(--cafe);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.btn-volver:hover {
  background-color: var(--cafe);
  color: white;
}

.info-categoria h1 {
  color: var(--cafe);
  margin: 10px 0 5px 0;
  font-size: 2rem;
}

.info-categoria .descripcion {
  color: var(--gris-claro);
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 15px;
}

.loading-container p {
  color: var(--cafe);
  font-size: 1.1rem;
  font-weight: 600;
}

.mensaje-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
  border-radius: 10px;
  margin: 20px;
}

.contenido {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  padding: 0 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.sidebar-filtros {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.filtros-card {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  padding: 20px;
}

.filtros-card h3 {
  color: var(--cafe);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
}

.filtro-grupo {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--crema);
}

.filtro-grupo:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filtro-grupo h4 {
  color: var(--cafe);
  margin: 0 0 12px 0;
  font-size: 1rem;
}

.opciones {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opcion-filtro {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.opcion-filtro:hover {
  background-color: var(--crema);
}

.opcion-filtro input[type="radio"],
.opcion-filtro input[type="checkbox"] {
  cursor: pointer;
  accent-color: var(--cafe);
}

.opcion-filtro span {
  color: var(--gris-oscuro);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-limpiar {
  width: 100%;
  padding: 12px;
  background-color: #ffebee;
  color: #f44336;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.btn-limpiar:hover {
  background-color: #f44336;
  color: white;
}

.productos-grid {
  min-height: 400px;
}

.productos-header {
  margin-bottom: 20px;
}

.contador-productos {
  color: var(--gris-claro);
  font-weight: 600;
  margin: 0;
}

.sin-productos {
  text-align: center;
  padding: 60px 20px;
  color: var(--gris-claro);
}

.sin-productos i {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.sin-productos h3 {
  color: var(--cafe);
  margin: 0 0 10px 0;
}

.sin-productos p {
  margin: 0;
}

.productos-lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.producto-card {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.producto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(111, 72, 39, 0.2);
  border-color: var(--naranja-opaco);
}

.producto-imagen {
  position: relative;
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
}

.producto-imagen img {
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
  font-size: 3rem;
}

.badge-talla {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.95);
  color: var(--cafe);
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.producto-info {
  padding: 15px;
}

.producto-info h3 {
  color: var(--cafe);
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.descripcion-corta {
  color: var(--gris-claro);
  font-size: 0.85rem;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.producto-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.precio {
  color: var(--cafe);
  font-weight: 700;
  font-size: 1.2rem;
}

.categoria-badge {
  background-color: var(--crema);
  color: var(--cafe);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .contenido {
    grid-template-columns: 1fr;
  }

  .sidebar-filtros {
    position: static;
  }
}

@media (max-width: 768px) {
  .productos-lista {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .info-categoria h1 {
    font-size: 1.5rem;
  }
}
</style>