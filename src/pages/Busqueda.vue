<!-- src/pages/Busqueda.vue -->
<!-- src/pages/Busqueda.vue -->
<template>
  <div class="busqueda-container">
    <!-- Header con término de búsqueda -->
    <div class="busqueda-header">
      <button @click="router.back()" class="btn-volver">
        <i class="pi pi-arrow-left"></i>
        <span>Volver</span>
      </button>
      
      <div class="busqueda-info">
        <h1>Resultados de búsqueda</h1>
        <p v-if="terminoBusqueda" class="termino">
          Buscando: <strong>"{{ terminoBusqueda }}"</strong>
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Buscando productos y tiendas...</p>
    </div>

    <!-- Resultados -->
    <div v-else-if="resultados" class="resultados-container">
      <!-- Resumen de resultados -->
      <div class="resumen-resultados">
        <div class="resumen-item">
          <i class="pi pi-shop"></i>
          <span>{{ resultados.totalTiendas }} {{ resultados.totalTiendas === 1 ? 'tienda' : 'tiendas' }}</span>
        </div>
        <div class="resumen-item">
          <i class="pi pi-shopping-bag"></i>
          <span>{{ resultados.totalProductos }} {{ resultados.totalProductos === 1 ? 'producto' : 'productos' }}</span>
        </div>
      </div>

      <!-- SECCIÓN: TIENDAS -->
      <div v-if="resultados.tiendas && resultados.tiendas.length > 0" class="seccion-resultados">
        <div class="seccion-header">
          <h2>
            <i class="pi pi-shop"></i>
            Tiendas Encontradas
          </h2>
          <span class="contador">{{ resultados.totalTiendas }}</span>
        </div>

        <div class="tiendas-grid">
          <div 
            v-for="tienda in resultados.tiendas" 
            :key="tienda.id"
            class="tienda-card"
            @click="irATienda(tienda.id)"
          >
            <div class="tienda-imagen">
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
              
              <p v-if="tienda.descripcion" class="tienda-descripcion">
                {{ tienda.descripcion }}
              </p>

              <div class="tienda-meta">
                <div class="propietario">
                  <i class="pi pi-user"></i>
                  <span>{{ tienda.propietario.nombre }} {{ tienda.propietario.apellidos }}</span>
                </div>

                <div v-if="tienda.telefono" class="telefono">
                  <i class="pi pi-phone"></i>
                  <span>{{ tienda.telefono }}</span>
                </div>
              </div>

              <button class="btn-ver-tienda">
                <i class="pi pi-arrow-right"></i>
                <span>Ver Tienda</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Separador visual -->
      <div v-if="resultados.tiendas?.length > 0 && resultados.productos?.length > 0" class="separador">
        <span></span>
      </div>

      <!-- SECCIÓN: PRODUCTOS -->
      <div v-if="resultados.productos && resultados.productos.length > 0" class="seccion-resultados">
        <div class="seccion-header">
          <h2>
            <i class="pi pi-shopping-bag"></i>
            Productos Encontrados
          </h2>
          <span class="contador">{{ resultados.totalProductos }}</span>
        </div>

        <div class="productos-grid">
          <TarjetaProductoPublica 
            v-for="producto in resultados.productos"
            :key="producto.id"
            :producto="producto"
            :tienda="producto.tienda"
          />
        </div>
      </div>

      <!-- Sin resultados -->
      <div v-if="!resultados.tiendas?.length && !resultados.productos?.length" class="sin-resultados">
        <i class="pi pi-search"></i>
        <h2>No se encontraron resultados</h2>
        <p>No encontramos tiendas ni productos que coincidan con "<strong>{{ terminoBusqueda }}</strong>"</p>
        <div class="sugerencias">
          <h3>Intenta con:</h3>
          <ul>
            <li>Verificar la ortografía</li>
            <li>Usar palabras más generales</li>
            <li>Usar menos palabras clave</li>
          </ul>
        </div>
        <button @click="router.push('/')" class="btn-inicio">
          <i class="pi pi-home"></i>
          <span>Volver al Inicio</span>
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <h2>Error al buscar</h2>
      <p>{{ error }}</p>
      <button @click="buscar" class="btn-reintentar">
        <i class="pi pi-refresh"></i>
        <span>Reintentar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { busquedaService } from '../services/busquedaService'
import TarjetaProductoPublica from '../components/TarjetaProductoPublica.vue'

const router = useRouter()
const route = useRoute()

const terminoBusqueda = ref('')
const resultados = ref(null)
const loading = ref(false)
const error = ref('')

// Cargar resultados al montar
onMounted(() => {
  terminoBusqueda.value = route.query.q || ''
  if (terminoBusqueda.value) {
    buscar()
  }
})

// Recargar si cambia el query
watch(() => route.query.q, (nuevoTermino) => {
  if (nuevoTermino) {
    terminoBusqueda.value = nuevoTermino
    buscar()
  }
})

const buscar = async () => {
  if (!terminoBusqueda.value || terminoBusqueda.value.trim().length < 2) {
    error.value = 'Por favor ingresa al menos 2 caracteres para buscar'
    return
  }

  loading.value = true
  error.value = ''
  resultados.value = null

  try {
    const result = await busquedaService.buscar(terminoBusqueda.value, 20, 10)
    
    loading.value = false

    if (result.success) {
      resultados.value = result.data
    } else {
      error.value = result.error
    }
  } catch (err) {
    loading.value = false
    error.value = err.message || 'Error al realizar la búsqueda'
  }
}

const irATienda = (tiendaId) => {
  router.push(`/tienda-publica/${tiendaId}`)
}
</script>

<style scoped>
.busqueda-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 200px);
}

/* Header */
.busqueda-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--crema);
}

.btn-volver {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  color: var(--cafe);
  border: 2px solid var(--cafe);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-volver:hover {
  background: var(--cafe);
  color: white;
}

.busqueda-info h1 {
  color: var(--cafe);
  margin: 0 0 8px 0;
  font-size: 2rem;
}

.termino {
  color: var(--gris-claro);
  margin: 0;
  font-size: 1.1rem;
}

.termino strong {
  color: var(--cafe);
}

/* Loading */
.loading {
  text-align: center;
  padding: 80px 20px;
  color: var(--gris-claro);
}

.loading i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: var(--naranja-opaco);
}

/* Resumen de resultados */
.resumen-resultados {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  border-radius: 15px;
  color: white;
}

.resumen-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
}

.resumen-item i {
  font-size: 1.5rem;
}

/* Secciones */
.seccion-resultados {
  margin-bottom: 50px;
}

.seccion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 3px solid var(--cafe-claro);
}

.seccion-header h2 {
  color: var(--cafe);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem;
}

.seccion-header i {
  color: var(--naranja-opaco);
}

.contador {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Separador */
.separador {
  display: flex;
  align-items: center;
  margin: 50px 0;
}

.separador span {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cafe-claro), transparent);
}

/* Grid de Tiendas */
.tiendas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.tienda-card {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: row;
}

.tienda-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(111, 72, 39, 0.2);
  border-color: var(--naranja-opaco);
}

.tienda-imagen {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  display: flex;
  align-items: center;
  justify-content: center;
}

.tienda-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagen-placeholder {
  color: white;
  font-size: 3rem;
}

.tienda-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tienda-info h3 {
  color: var(--cafe);
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.tienda-descripcion {
  color: var(--gris-claro);
  margin: 0;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.tienda-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.propietario,
.telefono {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--gris-oscuro);
}

.propietario i,
.telefono i {
  color: var(--naranja-opaco);
  font-size: 1rem;
}

.btn-ver-tienda {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-ver-tienda:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(111, 72, 39, 0.3);
}

/* Grid de Productos */
.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

/* Sin resultados */
.sin-resultados {
  text-align: center;
  padding: 80px 20px;
  color: var(--gris-claro);
}

.sin-resultados i {
  font-size: 5rem;
  color: var(--cafe-claro);
  margin-bottom: 20px;
}

.sin-resultados h2 {
  color: var(--cafe);
  margin: 0 0 10px 0;
}

.sin-resultados p {
  font-size: 1.1rem;
  margin: 0 0 30px 0;
}

.sugerencias {
  max-width: 500px;
  margin: 0 auto 30px;
  padding: 25px;
  background: var(--crema);
  border-radius: 15px;
  text-align: left;
}

.sugerencias h3 {
  color: var(--cafe);
  margin: 0 0 15px 0;
  text-align: center;
}

.sugerencias ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sugerencias li {
  padding: 8px 0;
  color: var(--gris-oscuro);
  display: flex;
  align-items: center;
  gap: 10px;
}

.sugerencias li::before {
  content: "✓";
  color: var(--naranja-opaco);
  font-weight: bold;
  font-size: 1.2rem;
}

.btn-inicio {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-inicio:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

/* Error */
.error-container {
  text-align: center;
  padding: 80px 20px;
  color: var(--gris-claro);
}

.error-container i {
  font-size: 4rem;
  color: #f44336;
  margin-bottom: 20px;
}

.error-container h2 {
  color: var(--cafe);
  margin: 0 0 10px 0;
}

.btn-reintentar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  background: var(--cafe);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.btn-reintentar:hover {
  background: var(--naranja-opaco);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .busqueda-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .busqueda-info h1 {
    font-size: 1.5rem;
  }

  .resumen-resultados {
    flex-direction: column;
    gap: 10px;
  }

  .tiendas-grid {
    grid-template-columns: 1fr;
  }

  .tienda-card {
    flex-direction: column;
  }

  .tienda-imagen {
    width: 100%;
    height: 200px;
  }

  .productos-grid {
    grid-template-columns: 1fr;
  }

  .seccion-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .contador {
    align-self: flex-end;
  }
}
</style>