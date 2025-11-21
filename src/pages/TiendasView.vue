<template>
  <div class="tiendas-container">
    <div class="header">
      <button @click="router.push('/')" class="btn-volver">
                <i class="pi pi-arrow-left"></i>
                <span>Volver</span>
      </button>
      <h1>Mis Tiendas</h1>
      <button @click="mostrarFormularioCrear = true" class="btn-crear">
        <i class="pi pi-plus"></i>
        <span>Nueva Tienda</span>
      </button>
    </div>

    <!-- Mensajes -->
    <div v-if="error" class="mensaje mensaje-error">
      <i class="pi pi-times-circle"></i>
      <span>{{ error }}</span>
    </div>
    <div v-if="success" class="mensaje mensaje-success">
      <i class="pi pi-check-circle"></i>
      <span>{{ success }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading && !tiendas.length" class="loading">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Cargando tus tiendas...</p>
    </div>

    <!-- Lista de tiendas -->
    <div v-else-if="tiendas.length > 0" class="tiendas-grid">
      <div 
        v-for="tienda in tiendas" 
        :key="tienda.id" 
        class="tienda-card"
        @click="verPerfil(tienda.id)"
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
          <p class="descripcion">{{ tienda.descripcion || 'Sin descripción' }}</p>
          
          <div class="tienda-detalles">
            <span v-if="tienda.telefono">
              <i class="pi pi-phone"></i>
              {{ tienda.telefono }}
            </span>
            <span v-if="tienda.direccion">
              <i class="pi pi-map-marker"></i>
              {{ tienda.direccion }}
            </span>
          </div>

          <div class="tienda-estado">
            <span 
              class="badge"
              :class="tienda.estado.nombre === 'activo' ? 'badge-activo' : 'badge-inactivo'"
            >
              {{ tienda.estado.nombre }}
            </span>
          </div>
        </div>

        <div class="tienda-acciones" @click.stop>
          <button 
            @click="editarTienda(tienda)"
            class="btn-icono btn-editar"
            title="Editar"
          >
            <i class="pi pi-pencil"></i>
          </button>
          <button 
            @click="confirmarEliminar(tienda)"
            class="btn-icono btn-eliminar"
            title="Eliminar"
          >
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Sin tiendas -->
    <div v-else class="sin-tiendas">
      <i class="pi pi-shop"></i>
      <h3>No tienes tiendas aún</h3>
      <p>Crea tu primera tienda para empezar a vender</p>
      <button @click="mostrarFormularioCrear = true" class="btn-crear">
        <i class="pi pi-plus"></i>
        <span>Crear mi primera tienda</span>
      </button>
    </div>

    <!-- Modal Crear/Editar Tienda -->
    <div v-if="mostrarFormularioCrear || tiendaEditando" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>{{ tiendaEditando ? 'Editar Tienda' : 'Nueva Tienda' }}</h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="guardarTienda" class="modal-body">
          <div class="campo">
            <label for="nombre">Nombre de la tienda *</label>
            <input 
              id="nombre"
              v-model="formulario.nombre"
              type="text"
              required
              placeholder="Ej: Tienda de Ropa"
              class="input"
            />
          </div>

          <div class="campo">
            <label for="descripcion">Descripción</label>
            <textarea 
              id="descripcion"
              v-model="formulario.descripcion"
              rows="3"
              placeholder="Describe tu tienda..."
              class="input"
            ></textarea>
          </div>

          <div class="campo">
            <label for="telefono">Teléfono</label>
            <input 
              id="telefono"
              v-model="formulario.telefono"
              type="tel"
              placeholder="Ej: +591 123456789"
              class="input"
            />
          </div>

          <div class="campo">
            <label for="direccion">Dirección</label>
            <input 
              id="direccion"
              v-model="formulario.direccion"
              type="text"
              placeholder="Ej: Calle Principal #123"
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
            <small v-if="tiendaEditando?.fotoPerfil">
              Ya tienes una foto. Sube una nueva para cambiarla.
            </small>
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
            <small v-if="tiendaEditando?.codigoQr">
              Ya tienes un código QR. Sube uno nuevo para cambiarlo.
            </small>
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
              :disabled="loading"
              class="btn-primario"
            >
              <i class="pi pi-save"></i>
              <span>{{ loading ? 'Guardando...' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { tiendasService } from '../services/tiendasService'

const router = useRouter()

const tiendas = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')

const mostrarFormularioCrear = ref(false)
const tiendaEditando = ref(null)

const formulario = ref({
  nombre: '',
  descripcion: '',
  telefono: '',
  direccion: ''
})

const archivoFotoPerfil = ref(null)
const archivoCodigoQr = ref(null)

onMounted(() => {
  cargarTiendas()
})

const cargarTiendas = async () => {
  loading.value = true
  const result = await tiendasService.obtenerMisTiendas()
  loading.value = false

  if (result.success) {
    tiendas.value = result.data
  } else {
    error.value = result.error
    setTimeout(() => error.value = '', 5000)
  }
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

const guardarTienda = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  let result

  if (tiendaEditando.value) {
    // Editar
    result = await tiendasService.editar(
      tiendaEditando.value.id,
      formulario.value,
      archivoFotoPerfil.value,
      archivoCodigoQr.value
    )
  } else {
    // Crear
    result = await tiendasService.crear(
      formulario.value,
      archivoFotoPerfil.value,
      archivoCodigoQr.value
    )
  }

  loading.value = false

  if (result.success) {
    success.value = result.data.mensaje
    cerrarModal()
    await cargarTiendas()
    
    setTimeout(() => success.value = '', 3000)
  } else {
    error.value = result.error
  }
}

const editarTienda = (tienda) => {
  tiendaEditando.value = tienda
  formulario.value = {
    nombre: tienda.nombre,
    descripcion: tienda.descripcion || '',
    telefono: tienda.telefono || '',
    direccion: tienda.direccion || ''
  }
  archivoFotoPerfil.value = null
  archivoCodigoQr.value = null
}

const confirmarEliminar = async (tienda) => {
  if (!confirm(`¿Estás seguro de eliminar la tienda "${tienda.nombre}"?`)) {
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  const result = await tiendasService.eliminar(tienda.id)
  loading.value = false

  if (result.success) {
    success.value = result.data.mensaje
    await cargarTiendas()
    
    setTimeout(() => success.value = '', 3000)
  } else {
    error.value = result.error
  }
}

const verPerfil = (tiendaId) => {
  router.push(`/tienda/${tiendaId}`)
}

const cerrarModal = () => {
  mostrarFormularioCrear.value = false
  tiendaEditando.value = null
  formulario.value = {
    nombre: '',
    descripcion: '',
    telefono: '',
    direccion: ''
  }
  archivoFotoPerfil.value = null
  archivoCodigoQr.value = null
}
</script>

<style scoped>
.tiendas-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  color: var(--cafe);
  font-size: 2rem;
  margin: 0;
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

.btn-crear {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(111, 72, 39, 0.3);
}

.btn-crear:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

.mensaje {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.mensaje-error {
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.mensaje-success {
  background-color: #efe;
  color: #3a3;
  border: 1px solid #cfc;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--gris-claro);
}

.loading i {
  font-size: 3rem;
  margin-bottom: 15px;
}

.tiendas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.tienda-card {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tienda-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(111, 72, 39, 0.2);
  border-color: var(--naranja-opaco);
}

.tienda-imagen {
  width: 100%;
  height: 200px;
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
  font-size: 4rem;
}

.tienda-info {
  padding: 20px;
}

.tienda-info h3 {
  color: var(--cafe);
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.descripcion {
  color: var(--gris-claro);
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tienda-detalles {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.tienda-detalles span {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gris-oscuro);
  font-size: 0.85rem;
}

.tienda-detalles i {
  color: var(--naranja-opaco);
}

.tienda-estado {
  margin-top: 15px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
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

.tienda-acciones {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.btn-icono {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.btn-editar {
  color: #2196F3;
}

.btn-editar:hover {
  background: #2196F3;
  color: white;
}

.btn-eliminar {
  color: #f44336;
}

.btn-eliminar:hover {
  background: #f44336;
  color: white;
}

.sin-tiendas {
  text-align: center;
  padding: 80px 20px;
  color: var(--gris-claro);
}

.sin-tiendas i {
  font-size: 5rem;
  color: var(--cafe-claro);
  margin-bottom: 20px;
}

.sin-tiendas h3 {
  color: var(--cafe);
  margin: 0 0 10px 0;
}

.sin-tiendas p {
  margin: 0 0 30px 0;
}

/* Modal */
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
  padding: 5px;
}

.btn-cerrar:hover {
  color: var(--cafe);
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

.input,
textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.input:focus,
textarea:focus {
  outline: none;
  border-color: var(--naranja-opaco);
  box-shadow: 0 0 0 3px rgba(178, 113, 57, 0.1);
}

.input-file {
  padding: 8px;
  border: 2px dashed var(--cafe-claro);
}

small {
  display: block;
  color: var(--gris-claro);
  font-size: 0.85rem;
  margin-top: 5px;
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
  transition: all 0.3s ease;
}

.btn-secundario:hover {
  background: var(--cafe);
  color: white;
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
  transition: all 0.3s ease;
}

.btn-primario:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .tiendas-grid {
    grid-template-columns: 1fr;
  }
}
</style>