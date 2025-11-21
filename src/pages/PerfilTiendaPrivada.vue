<!-- src/pages/PerfilTiendaPrivada.vue -->
<template>
  <div class="perfil-container">
    <!-- Header -->
    <div class="header">
      <button @click="router.push('/tiendas')" class="btn-volver">
        <i class="pi pi-arrow-left"></i>
        <span>Volver a mis tiendas</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Cargando tienda...</p>
    </div>

    <!-- Tienda -->
    <div v-else-if="tienda" class="perfil-tienda">
      <!-- Banner/Header de la tienda -->
      <div class="tienda-banner">
        <div class="banner-foto">
          <img 
            v-if="tienda.fotoPerfil" 
            :src="tienda.fotoPerfil" 
            :alt="tienda.nombre"
          />
          <div v-else class="foto-placeholder">
            <i class="pi pi-shop"></i>
          </div>
        </div>
        
        <div class="tienda-info-header">
          <h1>{{ tienda.nombre }}</h1>
          <span 
            class="badge"
            :class="tienda.estado.nombre === 'activo' ? 'badge-activo' : 'badge-inactivo'"
          >
            {{ tienda.estado.nombre }}
          </span>
        </div>

        <div class="acciones-rapidas">
          <button @click="mostrarModalEditar = true" class="btn-editar">
            <i class="pi pi-pencil"></i>
            <span>Editar Tienda</span>
          </button>
          <button @click="confirmarEliminar" class="btn-eliminar">
            <i class="pi pi-trash"></i>
            <span>Eliminar Tienda</span>
          </button>
        </div>
      </div>

      <!-- Información de la tienda -->
      <div class="tienda-detalles">
        <div class="seccion">
          <h2><i class="pi pi-info-circle"></i> Información</h2>
          <div class="info-grid">
            <div class="info-item">
              <i class="pi pi-align-left"></i>
              <div>
                <strong>Descripción</strong>
                <p>{{ tienda.descripcion || 'Sin descripción' }}</p>
              </div>
            </div>
            <div class="info-item" v-if="tienda.telefono">
              <i class="pi pi-phone"></i>
              <div>
                <strong>Teléfono</strong>
                <p>{{ tienda.telefono }}</p>
              </div>
            </div>
            <div class="info-item" v-if="tienda.direccion">
              <i class="pi pi-map-marker"></i>
              <div>
                <strong>Dirección</strong>
                <p>{{ tienda.direccion }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Código QR -->
        <div class="seccion" v-if="tienda.codigoQr">
          <h2><i class="pi pi-qrcode"></i> Código QR</h2>
          <div class="qr-container">
            <img :src="tienda.codigoQr" alt="Código QR" class="qr-image"/>
          </div>
        </div>

        <!-- Sección de productos (por hacer) -->
        <div class="seccion">
          <h2><i class="pi pi-shopping-bag"></i> Productos</h2>
          <div class="productos-empty">
            <i class="pi pi-shopping-bag"></i>
            <p>Aún no tienes productos en esta tienda</p>
            <button @click="router.push(`/tienda/${tienda.id}/producto/crear`)" class="btn-agregar">
            <i class="pi pi-plus"></i>
            <span>Agregar Producto</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <h2>Error al cargar la tienda</h2>
      <p>{{ error }}</p>
      <button @click="router.push('/tiendas')" class="btn-volver-error">
        Volver a mis tiendas
      </button>
    </div>

    <!-- Modal Editar (Reutiliza el del TiendasView) -->
    <div v-if="mostrarModalEditar" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>Editar Tienda</h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="guardarCambios" class="modal-body">
          <div class="campo">
            <label for="nombre">Nombre de la tienda *</label>
            <input 
              id="nombre"
              v-model="formulario.nombre"
              type="text"
              required
              class="input"
            />
          </div>

          <div class="campo">
            <label for="descripcion">Descripción</label>
            <textarea 
              id="descripcion"
              v-model="formulario.descripcion"
              rows="3"
              class="input"
            ></textarea>
          </div>

          <div class="campo">
            <label for="telefono">Teléfono</label>
            <input 
              id="telefono"
              v-model="formulario.telefono"
              type="tel"
              class="input"
            />
          </div>

          <div class="campo">
            <label for="direccion">Dirección</label>
            <input 
              id="direccion"
              v-model="formulario.direccion"
              type="text"
              class="input"
            />
          </div>

          <div class="campo">
            <label for="fotoPerfil">Foto de perfil</label>
            <input 
              id="fotoPerfil"
              type="file"
              accept="image/*"
              @change="handleFotoPerfil"
              class="input-file"
            />
          </div>

          <div class="campo">
            <label for="codigoQr">Código QR</label>
            <input 
              id="codigoQr"
              type="file"
              accept="image/*"
              @change="handleCodigoQr"
              class="input-file"
            />
          </div>

          <div class="modal-footer">
            <button 
              type="button" 
              @click="cerrarModal"
              class="btn-secundario"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="loadingEditar"
              class="btn-primario"
            >
              <i class="pi pi-save"></i>
              <span>{{ loadingEditar ? 'Guardando...' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { tiendasService } from '../services/tiendasService'

const router = useRouter()
const route = useRoute()

const tienda = ref(null)
const loading = ref(false)
const loadingEditar = ref(false)
const error = ref('')

const mostrarModalEditar = ref(false)
const formulario = ref({
  nombre: '',
  descripcion: '',
  telefono: '',
  direccion: ''
})

const archivoFotoPerfil = ref(null)
const archivoCodigoQr = ref(null)

onMounted(() => {
  cargarTienda()
})

const cargarTienda = async () => {
  loading.value = true
  const tiendaId = route.params.id
  
  const result = await tiendasService.obtenerMiTienda(tiendaId)
  loading.value = false

  if (result.success) {
    tienda.value = result.data
  } else {
    error.value = result.error
  }
}

const abrirEditar = () => {
  formulario.value = {
    nombre: tienda.value.nombre,
    descripcion: tienda.value.descripcion || '',
    telefono: tienda.value.telefono || '',
    direccion: tienda.value.direccion || ''
  }
  mostrarModalEditar.value = true
}

const handleFotoPerfil = (e) => {
  const file = e.target.files[0]
  if (file) {
    archivoFotoPerfil.value = file
  }
}

const handleCodigoQr = (e) => {
  const file = e.target.files[0]
  if (file) {
    archivoCodigoQr.value = file
  }
}

const guardarCambios = async () => {
  loadingEditar.value = true

  const result = await tiendasService.editar(
    tienda.value.id,
    formulario.value,
    archivoFotoPerfil.value,
    archivoCodigoQr.value
  )

  loadingEditar.value = false

  if (result.success) {
    cerrarModal()
    await cargarTienda()
  } else {
    error.value = result.error
  }
}

const confirmarEliminar = async () => {
  if (!confirm(`¿Estás seguro de eliminar la tienda "${tienda.value.nombre}"?`)) {
    return
  }

  loading.value = true
  const result = await tiendasService.eliminar(tienda.value.id)
  loading.value = false

  if (result.success) {
    router.push('/tiendas')
  } else {
    error.value = result.error
  }
}

const cerrarModal = () => {
  mostrarModalEditar.value = false
  archivoFotoPerfil.value = null
  archivoCodigoQr.value = null
}
</script>

<style scoped>
.perfil-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.btn-volver {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: transparent;
  color: var(--cafe);
  border: 2px solid var(--cafe);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-volver:hover {
  background-color: var(--cafe);
  color: var(--crema);
}

.loading, .error-container {
  text-align: center;
  padding: 60px 20px;
  color: var(--gris-claro);
}

.loading i, .error-container i {
  font-size: 3rem;
  margin-bottom: 15px;
}

.tienda-banner {
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  border-radius: 20px;
  padding: 40px;
  color: white;
  margin-bottom: 30px;
  position: relative;
}

.banner-foto {
  width: 150px;
  height: 150px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.banner-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.foto-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.2);
  font-size: 4rem;
}

.tienda-info-header {
  text-align: center;
  margin-bottom: 20px;
}

.tienda-info-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
}

.badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-activo {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.badge-inactivo {
  background-color: #ffebee;
  color: #c62828;
}

.acciones-rapidas {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-editar, .btn-eliminar, .btn-agregar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-editar {
  background-color: white;
  color: var(--cafe);
}

.btn-editar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-eliminar {
  background-color: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
}

.btn-eliminar:hover {
  background-color: #f44336;
}

.tienda-detalles {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.seccion {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  padding: 30px;
}

.seccion h2 {
  color: var(--cafe);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.info-item i {
  font-size: 1.5rem;
  color: var(--naranja-opaco);
  margin-top: 5px;
}

.info-item strong {
  display: block;
  color: var(--cafe);
  margin-bottom: 5px;
}

.info-item p {
  margin: 0;
  color: var(--gris-oscuro);
}

.qr-container {
  text-align: center;
}

.qr-image {
  max-width: 300px;
  border: 5px solid var(--cafe-claro);
  border-radius: 15px;
}

.productos-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--gris-claro);
}

.productos-empty i {
  font-size: 4rem;
  margin-bottom: 15px;
  color: var(--cafe-claro);
}

.btn-agregar {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  margin-top: 20px;
}

/* Modal styles (igual que TiendasView) */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-contenido {
  background: white;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid var(--crema);
}

.modal-header h2 {
  color: var(--cafe);
  margin: 0;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gris-claro);
  cursor: pointer;
}

.modal-body {
  padding: 25px;
}

.campo {
  margin-bottom: 20px;
}

.campo label {
  display: block;
  color: var(--cafe);
  font-weight: 600;
  margin-bottom: 8px;
}

.input, textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-family: inherit;
}

.input-file {
  padding: 8px;
  border: 2px dashed var(--cafe-claro);
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px 25px;
  border-top: 2px solid var(--crema);
}

.btn-secundario {
  padding: 10px 20px;
  background: transparent;
  color: var(--cafe);
  border: 2px solid var(--cafe);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primario {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 768px) {
  .tienda-banner {
    padding: 30px 20px;
  }
  
  .tienda-info-header h1 {
    font-size: 2rem;
  }
  
  .acciones-rapidas {
    flex-direction: column;
  }
}
</style>