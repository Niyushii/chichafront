<template>
    <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <div>
            <h1 style="margin: 0 0 5px 0;">Panel de Super Administrador</h1>
            <p style="margin: 0; color: #666; font-size: 16px;">Bienvenido, {{ superAdminData?.username || 'Administrador' }}</p>
        </div>
        <button 
            @click="handleLogout"
            style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
        >
            Cerrar Sesión
        </button>
        </div>

        <!-- Estadísticas -->
        <div v-if="estadisticas" style="margin-bottom: 40px;">
        <h2>Estadísticas de Moderadores</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px;">
            <div style="padding: 20px; border: 2px solid #4CAF50; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 32px; color: #4CAF50;">{{ estadisticas.total }}</h3>
            <p style="margin: 5px 0 0 0; color: #666;">Total</p>
            </div>
            <div style="padding: 20px; border: 2px solid #2196F3; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 32px; color: #2196F3;">{{ estadisticas.activos }}</h3>
            <p style="margin: 5px 0 0 0; color: #666;">Activos</p>
            </div>
            <div style="padding: 20px; border: 2px solid #FF9800; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 32px; color: #FF9800;">{{ estadisticas.inactivos }}</h3>
            <p style="margin: 5px 0 0 0; color: #666;">Inactivos</p>
            </div>
            <div style="padding: 20px; border: 2px solid #9C27B0; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 32px; color: #9C27B0;">{{ estadisticas.nuevosUltimos30Dias }}</h3>
            <p style="margin: 5px 0 0 0; color: #666;">Nuevos (30 días)</p>
            </div>
        </div>
        </div>

        <!-- Mensajes -->
        <div v-if="error" style="color: red; padding: 10px; border: 1px solid red; margin-bottom: 20px; border-radius: 4px;">
        {{ error }}
        </div>
        <div v-if="success" style="color: green; padding: 10px; border: 1px solid green; margin-bottom: 20px; border-radius: 4px;">
        {{ success }}
        </div>

        <!-- Botón crear moderador -->
        <div style="margin-bottom: 20px;">
        <button 
            @click="mostrarFormularioCrear = !mostrarFormularioCrear"
            style="padding: 12px 24px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
        >
            {{ mostrarFormularioCrear ? 'Cancelar' : '+ Crear Moderador' }}
        </button>
        </div>

        <!-- Formulario crear moderador -->
        <div v-if="mostrarFormularioCrear" style="border: 2px solid #4CAF50; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
        <h3>Crear Nuevo Moderador</h3>
        <form @submit.prevent="crearModerador">
            <div style="margin-bottom: 15px;">
            <label>Email: *</label>
            <input 
                v-model="nuevoModerador.email" 
                type="email" 
                required
                style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
            />
            </div>
            <div style="margin-bottom: 15px;">
            <label>Username: *</label>
            <input 
                v-model="nuevoModerador.username" 
                type="text" 
                required
                style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
            />
            </div>
            <div style="margin-bottom: 15px;">
            <label>Contraseña: * (mínimo 8 caracteres)</label>
            <input 
                v-model="nuevoModerador.password" 
                type="password" 
                required
                minlength="8"
                style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
            />
            </div>
            <div style="margin-bottom: 15px;">
            <label>Nombre: *</label>
            <input 
                v-model="nuevoModerador.nombre" 
                type="text" 
                required
                style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
            />
            </div>
            <div style="margin-bottom: 15px;">
            <label>Apellidos: *</label>
            <input 
                v-model="nuevoModerador.apellidos" 
                type="text" 
                required
                style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
            />
            </div>
            <div style="margin-bottom: 15px;">
            <label>Celular:</label>
            <input 
                v-model="nuevoModerador.celular" 
                type="tel"
                style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
            />
            </div>
            <button 
            type="submit" 
            :disabled="loading"
            style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
            {{ loading ? 'Creando...' : 'Crear Moderador' }}
            </button>
        </form>
        </div>

        <!-- Lista de moderadores -->
        <div>
        <h2>Lista de Moderadores</h2>
        
        <div v-if="loading && !moderadores.length" style="padding: 20px; text-align: center;">
            Cargando moderadores...
        </div>

        <table v-else style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
            <tr style="background-color: #f5f5f5;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Nombre</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Email</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Username</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Celular</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Estado</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Acciones</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="moderador in moderadores" :key="moderador.id" style="border: 1px solid #ddd;">
                <td style="padding: 12px; border: 1px solid #ddd;">{{ moderador.nombre }} {{ moderador.apellidos }}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">{{ moderador.email }}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">{{ moderador.username }}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">{{ moderador.celular || '-' }}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">
                <span :style="{ 
                    color: moderador.estado.nombre === 'activo' ? '#4CAF50' : '#f44336', 
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                }">
                    {{ moderador.estado.nombre }}
                </span>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd;">
                <button 
                    @click="seleccionarParaEditar(moderador)"
                    style="padding: 6px 12px; margin-right: 8px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    Editar
                </button>
                <button 
                    @click="confirmarEliminar(moderador)"
                    style="padding: 6px 12px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    Eliminar
                </button>
                </td>
            </tr>
            </tbody>
        </table>

        <p v-if="!loading && moderadores.length === 0" style="text-align: center; padding: 40px; color: #666;">
            No hay moderadores registrados
        </p>
        </div>

        <!-- Formulario editar moderador (modal simple) -->
        <div v-if="moderadorEditando" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%;">
            <h3>Editar Moderador</h3>
            <form @submit.prevent="editarModerador">
            <div style="margin-bottom: 15px;">
                <label>Nombre: *</label>
                <input 
                v-model="moderadorEditando.nombre" 
                type="text" 
                required
                style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
                />
            </div>
            <div style="margin-bottom: 15px;">
                <label>Apellidos: *</label>
                <input 
                v-model="moderadorEditando.apellidos" 
                type="text" 
                required
                style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
                />
            </div>
            <div style="margin-bottom: 20px;">
                <label>Celular:</label>
                <input 
                v-model="moderadorEditando.celular" 
                type="tel"
                style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
                />
            </div>
            <div style="display: flex; gap: 10px;">
                <button 
                type="submit" 
                :disabled="loading"
                style="flex: 1; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                {{ loading ? 'Guardando...' : 'Guardar' }}
                </button>
                <button 
                type="button"
                @click="cancelarEdicion"
                style="flex: 1; padding: 10px; background-color: #666; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                Cancelar
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
import { authService } from '../services/authService'
import { moderadoresService } from '../services/moderadorService'

const router = useRouter()

const superAdminData = ref(null)
const moderadores = ref([])
const estadisticas = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')

const mostrarFormularioCrear = ref(false)
const nuevoModerador = ref({
    email: '',
    username: '',
    password: '',
    nombre: '',
    apellidos: '',
    celular: ''
})

const moderadorEditando = ref(null)

onMounted(() => {
  // Obtener datos del super admin desde localStorage
    superAdminData.value = authService.getUserData()
    cargarDatos()
})

const cargarDatos = async () => {
    await Promise.all([
        cargarModeradores(),
        cargarEstadisticas()
    ])
}

const cargarModeradores = async () => {
    loading.value = true
    const result = await moderadoresService.obtenerTodos(true)
    loading.value = false

    if (result.success) {
        moderadores.value = result.data
    } else {
        error.value = result.error
    }
}

const cargarEstadisticas = async () => {
    const result = await moderadoresService.obtenerEstadisticas()
    
    if (result.success) {
        estadisticas.value = result.data
    }
}

const crearModerador = async () => {
    loading.value = true
    error.value = ''
    success.value = ''

    const moderadorData = { ...nuevoModerador.value }
    if (!moderadorData.celular) {
        delete moderadorData.celular
    }

    const result = await moderadoresService.crear(moderadorData)
    loading.value = false

    if (result.success) {
        success.value = result.data.mensaje
        mostrarFormularioCrear.value = false
        nuevoModerador.value = {
        email: '',
        username: '',
        password: '',
        nombre: '',
        apellidos: '',
        celular: ''
        }
        await cargarDatos()
        
        setTimeout(() => {
        success.value = ''
        }, 3000)
    } else {
        error.value = result.error
    }
}

const seleccionarParaEditar = (moderador) => {
    moderadorEditando.value = {
        id: moderador.id,
        nombre: moderador.nombre,
        apellidos: moderador.apellidos,
        celular: moderador.celular || ''
    }
}

const editarModerador = async () => {
    loading.value = true
    error.value = ''
    success.value = ''

    const { id, ...datos } = moderadorEditando.value

    const result = await moderadoresService.editar(id, datos)
    loading.value = false

    if (result.success) {
        success.value = result.data.mensaje
        moderadorEditando.value = null
        await cargarDatos()
        
        setTimeout(() => {
        success.value = ''
        }, 3000)
    } else {
        error.value = result.error
    }
}

const cancelarEdicion = () => {
  moderadorEditando.value = null
}

const confirmarEliminar = async (moderador) => {
  if (!confirm(`¿Estás seguro de eliminar a ${moderador.nombre} ${moderador.apellidos}?`)) {
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  const result = await moderadoresService.eliminar(moderador.id)
  loading.value = false

  if (result.success) {
    success.value = result.data.mensaje
    await cargarDatos()
    
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } else {
    error.value = result.error
  }
}

const cambiarEstado = async (moderadorId, nuevoEstado) => {
  loading.value = true
  error.value = ''
  success.value = ''

  const result = await moderadoresService.cambiarEstado(moderadorId, nuevoEstado)
  loading.value = false

  if (result.success) {
    success.value = result.data.mensaje
    await cargarDatos()
    
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } else {
    error.value = result.error
  }
}

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
div {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
}

h2 {
  color: #555;
  margin-top: 30px;
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  color: #555;
}

table {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>