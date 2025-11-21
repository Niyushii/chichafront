<template>
  <div class="superadmin-container">
    <!-- Header -->
    <div class="header">
      <div class="header-info">
        <h1>Panel de Super Administrador</h1>
        <p>Bienvenido, {{ superAdminData?.username || 'Administrador' }}</p>
      </div>
      <button @click="handleLogout" class="btn-logout">
        <i class="pi pi-sign-out"></i>
        <span>Cerrar Sesión</span>
      </button>
    </div>

    <!-- Pestañas de Navegación -->
    <div class="tabs">
      <button 
        :class="['tab', { active: vistaActual === 'moderadores' }]"
        @click="vistaActual = 'moderadores'"
      >
        <i class="pi pi-users"></i>
        <span>Moderadores</span>
      </button>
      
      <button 
        :class="['tab', { active: vistaActual === 'auditoria' }]"
        @click="cambiarVista('auditoria')"
      >
        <i class="pi pi-history"></i>
        <span>Registros</span>
      </button>
    </div>

    <!-- Mensajes -->
    <div v-if="error" class="mensaje mensaje-error">
      <i class="pi pi-times-circle"></i>
      <span>{{ error }}</span>
      <button @click="error = ''" class="btn-cerrar-mensaje">
        <i class="pi pi-times"></i>
      </button>
    </div>
    <div v-if="success" class="mensaje mensaje-success">
      <i class="pi pi-check-circle"></i>
      <span>{{ success }}</span>
      <button @click="success = ''" class="btn-cerrar-mensaje">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- Vista: Moderadores -->
    <div v-if="vistaActual === 'moderadores'">
      <!-- Estadísticas -->
      <div v-if="estadisticasMods" class="estadisticas">
        <div class="stat-card stat-total">
          <i class="pi pi-users"></i>
          <div class="stat-content">
            <h3>{{ estadisticasMods.total }}</h3>
            <p>Total Moderadores</p>
          </div>
        </div>
        <div class="stat-card stat-activos">
          <i class="pi pi-check-circle"></i>
          <div class="stat-content">
            <h3>{{ contarPorEstado('activo') }}</h3>
            <p>Activos</p>
          </div>
        </div>
        <div class="stat-card stat-inactivos">
          <i class="pi pi-times-circle"></i>
          <div class="stat-content">
            <h3>{{ contarPorEstado('inactivo') }}</h3>
            <p>Inactivos</p>
          </div>
        </div>
        <div class="stat-card stat-suspendidos">
          <i class="pi pi-ban"></i>
          <div class="stat-content">
            <h3>{{ contarPorEstado('suspendido') }}</h3>
            <p>Suspendidos</p>
          </div>
        </div>
        <div class="stat-card stat-bloqueados">
          <i class="pi pi-lock"></i>
          <div class="stat-content">
            <h3>{{ contarPorEstado('bloqueado') }}</h3>
            <p>Bloqueados</p>
          </div>
        </div>
        <div class="stat-card stat-nuevos">
          <i class="pi pi-user-plus"></i>
          <div class="stat-content">
            <h3>{{ estadisticasMods.nuevosUltimos30Dias }}</h3>
            <p>Nuevos (30 días)</p>
          </div>
        </div>
      </div>

      <!-- Controles -->
      <div class="controles">
        <button @click="mostrarFormCrearMod = true" class="btn-primario">
          <i class="pi pi-plus"></i>
          <span>Crear Moderador</span>
        </button>
        <select v-model="filtroEstadoMod" class="select-filtro">
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="suspendido">Suspendidos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>
        <input 
          v-model="busquedaMods"
          type="text"
          placeholder="Buscar moderadores..."
          class="input-buscar"
        />
      </div>

      <!-- Formulario Crear Moderador -->
      <div v-if="mostrarFormCrearMod" class="formulario-card">
        <div class="formulario-header">
          <h3>Crear Nuevo Moderador</h3>
          <button @click="cerrarFormCrearMod" class="btn-icono">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="crearModerador" class="formulario">
          <div class="campo-grupo">
            <div class="campo">
              <label for="mod-email">Email *</label>
              <input 
                id="mod-email"
                v-model="nuevoMod.email" 
                type="email" 
                required
                class="input"
              />
            </div>
            <div class="campo">
              <label for="mod-username">Username *</label>
              <input 
                id="mod-username"
                v-model="nuevoMod.username" 
                type="text" 
                required
                class="input"
              />
            </div>
          </div>

          <div class="campo">
            <label for="mod-password">Contraseña * (mínimo 8 caracteres)</label>
            <input 
              id="mod-password"
              v-model="nuevoMod.password" 
              type="password" 
              required
              minlength="8"
              class="input"
            />
          </div>

          <div class="campo-grupo">
            <div class="campo">
              <label for="mod-nombre">Nombre *</label>
              <input 
                id="mod-nombre"
                v-model="nuevoMod.nombre" 
                type="text" 
                required
                class="input"
              />
            </div>
            <div class="campo">
              <label for="mod-apellidos">Apellidos *</label>
              <input 
                id="mod-apellidos"
                v-model="nuevoMod.apellidos" 
                type="text" 
                required
                class="input"
              />
            </div>
          </div>

          <div class="campo">
            <label for="mod-celular">Celular</label>
            <input 
              id="mod-celular"
              v-model="nuevoMod.celular" 
              type="tel"
              class="input"
            />
          </div>

          <div class="acciones">
            <button type="button" @click="cerrarFormCrearMod" class="btn-secundario">
              Cancelar
            </button>
            <button type="submit" :disabled="loading" class="btn-primario">
              <i class="pi pi-save"></i>
              <span>{{ loading ? 'Creando...' : 'Crear Moderador' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Loading -->
      <div v-if="loading && !moderadores.length" class="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando moderadores...</p>
      </div>

      <!-- Tabla de Moderadores -->
      <div v-else class="tabla-container">
        <table class="tabla">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Username</th>
              <th>Celular</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mod in moderadoresFiltrados" :key="mod.id">
              <td>
                <div class="celda-nombre">
                  <div class="avatar">{{ mod.nombre[0] }}{{ mod.apellidos[0] }}</div>
                  <span>{{ mod.nombre }} {{ mod.apellidos }}</span>
                </div>
              </td>
              <td>{{ mod.email }}</td>
              <td>@{{ mod.username }}</td>
              <td>{{ mod.celular || '-' }}</td>
              <td>
                <div class="estado-control">
                  <span :class="['badge-estado', `badge-${mod.estado.nombre}`]">
                    {{ mod.estado.nombre }}
                  </span>
                  <button 
                    @click="abrirMenuEstado(mod)"
                    class="btn-icono-tabla"
                    title="Cambiar estado"
                  >
                    <i class="pi pi-cog"></i>
                  </button>
                </div>
              </td>
              <td>
                <div class="acciones-tabla">
                  <button 
                    @click="abrirEditarMod(mod)"
                    class="btn-icono-tabla btn-editar"
                    title="Editar"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button 
                    @click="confirmarEliminarMod(mod)"
                    class="btn-icono-tabla btn-eliminar"
                    title="Eliminar"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="!loading && moderadores.length === 0" class="sin-datos">
          No hay moderadores registrados
        </p>
      </div>
    </div>

    <!-- Vista: Usuarios -->
    <div v-if="vistaActual === 'usuarios'">
      <!-- Estadísticas -->
      <div v-if="estadisticasUsers" class="estadisticas">
        <div class="stat-card stat-total">
          <i class="pi pi-users"></i>
          <div class="stat-content">
            <h3>{{ estadisticasUsers.total }}</h3>
            <p>Total Usuarios</p>
          </div>
        </div>
        <div class="stat-card stat-activos">
          <i class="pi pi-check-circle"></i>
          <div class="stat-content">
            <h3>{{ estadisticasUsers.activos }}</h3>
            <p>Activos</p>
          </div>
        </div>
        <div class="stat-card stat-vendedores">
          <i class="pi pi-shopping-bag"></i>
          <div class="stat-content">
            <h3>{{ estadisticasUsers.vendedores }}</h3>
            <p>Vendedores</p>
          </div>
        </div>
        <div class="stat-card stat-nuevos">
          <i class="pi pi-user-plus"></i>
          <div class="stat-content">
            <h3>{{ estadisticasUsers.nuevosUltimos30Dias }}</h3>
            <p>Nuevos (30 días)</p>
          </div>
        </div>
      </div>

      <!-- Controles -->
      <div class="controles">
        <input 
          v-model="busquedaUsers"
          type="text"
          placeholder="Buscar usuarios por nombre, email o username..."
          class="input-buscar"
        />
        <select v-model="filtroVendedor" class="select-filtro">
          <option :value="null">Todos</option>
          <option :value="true">Solo Vendedores</option>
          <option :value="false">Solo Compradores</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loadingUsers && !usuarios.length" class="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando usuarios...</p>
      </div>

      <!-- Tabla de Usuarios -->
      <div v-else class="tabla-container">
        <table class="tabla">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Username</th>
              <th>Celular</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usuariosFiltrados" :key="user.id">
              <td>
                <div class="celda-nombre">
                  <div class="avatar">{{ user.nombre[0] }}{{ user.apellidos[0] }}</div>
                  <span>{{ user.nombre }} {{ user.apellidos }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>@{{ user.username }}</td>
              <td>{{ user.celular || '-' }}</td>
              <td>
                <span :class="['badge-tipo', { 'badge-vendedor': user.isSeller }]">
                  {{ user.isSeller ? 'Vendedor' : 'Comprador' }}
                </span>
              </td>
              <td>
                <span :class="['badge-estado', `badge-${user.estado.nombre}`]">
                  {{ user.estado.nombre }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="!loadingUsers && usuarios.length === 0" class="sin-datos">
          No hay usuarios registrados
        </p>
      </div>
    </div>

    <!-- Vista: Auditoría -->
    <div v-if="vistaActual === 'auditoria'">
      <div class="auditoria-header">
        <h2><i class="pi pi-history"></i> Registro de acciones</h2>
        <button @click="cargarAuditoria" class="btn-secundario" :disabled="loadingAudit">
          <i :class="['pi', loadingAudit ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>
          <span>Actualizar</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loadingAudit && !auditorias.length" class="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando registros...</p>
      </div>

      <!-- Lista de Auditorías -->
      <div v-else class="auditoria-lista">
        <div v-for="audit in auditorias" :key="audit.id" class="auditoria-item">
          <div class="auditoria-icon">
            <i :class="getAuditoriaIcon(audit.accion)"></i>
          </div>
          <div class="auditoria-content">
            <div class="auditoria-header-item">
              <strong>{{ audit.accion }}</strong>
              <span class="auditoria-fecha">{{ formatearFecha(audit.fecha) }}</span>
            </div>
            <p class="auditoria-descripcion">{{ audit.descripcion }}</p>
            <div class="auditoria-meta">
              <span class="badge-tipo">{{ audit.usuarioTipo }}</span>
            </div>
          </div>
        </div>

        <p v-if="!loadingAudit && auditorias.length === 0" class="sin-datos">
          No hay registros de auditoría
        </p>
      </div>
    </div>

    <!-- Modal Editar Moderador -->
    <div v-if="modEditando" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h3>Editar Moderador</h3>
          <button @click="cerrarEditarMod" class="btn-icono">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="guardarModerador" class="modal-body">
          <div class="campo-grupo">
            <div class="campo">
              <label for="edit-nombre">Nombre *</label>
              <input 
                id="edit-nombre"
                v-model="modEditando.nombre" 
                type="text" 
                required
                class="input"
              />
            </div>
            <div class="campo">
              <label for="edit-apellidos">Apellidos *</label>
              <input 
                id="edit-apellidos"
                v-model="modEditando.apellidos" 
                type="text" 
                required
                class="input"
              />
            </div>
          </div>

          <div class="campo">
            <label for="edit-celular">Celular</label>
            <input 
              id="edit-celular"
              v-model="modEditando.celular" 
              type="tel"
              class="input"
            />
          </div>

          <div class="modal-footer">
            <button type="button" @click="cerrarEditarMod" class="btn-secundario">
              Cancelar
            </button>
            <button type="submit" :disabled="loading" class="btn-primario">
              <i class="pi pi-save"></i>
              <span>{{ loading ? 'Guardando...' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Cambiar Estado -->
    <div v-if="modCambiarEstado" class="modal">
      <div class="modal-contenido modal-pequeño">
        <div class="modal-header">
          <h3>Cambiar Estado</h3>
          <button @click="modCambiarEstado = null" class="btn-icono">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Selecciona el nuevo estado para <strong>{{ modCambiarEstado.nombre }}</strong>:</p>
          
          <div class="estados-opciones">
            <button 
              @click="cambiarEstadoMod('activo')"
              :class="['estado-opcion', { active: modCambiarEstado.estado.nombre === 'activo' }]"
              :disabled="loading"
            >
              <i class="pi pi-check-circle"></i>
              <span>Activo</span>
            </button>
            <button 
              @click="cambiarEstadoMod('inactivo')"
              :class="['estado-opcion', { active: modCambiarEstado.estado.nombre === 'inactivo' }]"
              :disabled="loading"
            >
              <i class="pi pi-times-circle"></i>
              <span>Inactivo</span>
            </button>
            <button 
              @click="cambiarEstadoMod('suspendido')"
              :class="['estado-opcion', { active: modCambiarEstado.estado.nombre === 'suspendido' }]"
              :disabled="loading"
            >
              <i class="pi pi-ban"></i>
              <span>Suspendido</span>
            </button>
            <button 
              @click="cambiarEstadoMod('bloqueado')"
              :class="['estado-opcion', { active: modCambiarEstado.estado.nombre === 'bloqueado' }]"
              :disabled="loading"
            >
              <i class="pi pi-lock"></i>
              <span>Bloqueado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import { moderadoresService } from '../services/moderadorService'
import { usuariosService } from '../services/usuariosService'
import { auditoriaService } from '../services/auditoriaService'

const router = useRouter()

// Estado general
const superAdminData = ref(null)
const vistaActual = ref('moderadores')
const loading = ref(false)
const loadingUsers = ref(false)
const loadingAudit = ref(false)
const error = ref('')
const success = ref('')

// Moderadores
const moderadores = ref([])
const estadisticasMods = ref(null)
const busquedaMods = ref('')
const filtroEstadoMod = ref('todos')
const mostrarFormCrearMod = ref(false)
const modEditando = ref(null)
const modCambiarEstado = ref(null)
const nuevoMod = ref({
  email: '',
  username: '',
  password: '',
  nombre: '',
  apellidos: '',
  celular: ''
})

// Usuarios
const usuarios = ref([])
const estadisticasUsers = ref(null)
const busquedaUsers = ref('')
const filtroVendedor = ref(null)

// Auditoría
const auditorias = ref([])

// Computed
const moderadoresFiltrados = computed(() => {
  let filtrados = moderadores.value

  // Filtro por estado
  if (filtroEstadoMod.value !== 'todos') {
    filtrados = filtrados.filter(mod => 
      mod.estado.nombre.toLowerCase() === filtroEstadoMod.value.toLowerCase()
    )
  }

  // Filtro por búsqueda
  if (busquedaMods.value) {
    const busqueda = busquedaMods.value.toLowerCase()
    filtrados = filtrados.filter(mod => 
      mod.nombre.toLowerCase().includes(busqueda) ||
      mod.apellidos.toLowerCase().includes(busqueda) ||
      mod.email.toLowerCase().includes(busqueda) ||
      mod.username.toLowerCase().includes(busqueda)
    )
  }

  return filtrados
})

const usuariosFiltrados = computed(() => {
  let filtrados = usuarios.value

  // Filtro por tipo (vendedor/comprador)
  if (filtroVendedor.value !== null) {
    filtrados = filtrados.filter(u => u.isSeller === filtroVendedor.value)
  }

  // Filtro por búsqueda
  if (busquedaUsers.value) {
    const busqueda = busquedaUsers.value.toLowerCase()
    filtrados = filtrados.filter(u => 
      u.nombre.toLowerCase().includes(busqueda) ||
      u.apellidos.toLowerCase().includes(busqueda) ||
      u.email.toLowerCase().includes(busqueda) ||
      u.username.toLowerCase().includes(busqueda)
    )
  }

  return filtrados
})

onMounted(() => {
  superAdminData.value = authService.getUserData()
  cargarModeradores()
  cargarEstadisticasMods()
})

// Funciones de cambio de vista
const cambiarVista = async (vista) => {
  vistaActual.value = vista
  
  if (vista === 'usuarios' && usuarios.value.length === 0) {
    await cargarUsuarios()
    await cargarEstadisticasUsers()
  } else if (vista === 'auditoria' && auditorias.value.length === 0) {
    await cargarAuditoria()
  }
}

// Funciones de Moderadores
const cargarModeradores = async () => {
  loading.value = true
  const result = await moderadoresService.obtenerTodos(false) // ✅ Traer TODOS
  loading.value = false

  if (result.success) {
    moderadores.value = result.data
  } else {
    mostrarError(result.error)
  }
}

const cargarEstadisticasMods = async () => {
  const result = await moderadoresService.obtenerEstadisticas()
  if (result.success) {
    estadisticasMods.value = result.data
  }
}

// Función auxiliar para contar por estado
const contarPorEstado = (estado) => {
  return moderadores.value.filter(m => 
    m.estado.nombre.toLowerCase() === estado.toLowerCase()
  ).length
}

const crearModerador = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  const modData = { ...nuevoMod.value }
  if (!modData.celular) delete modData.celular

  const result = await moderadoresService.crear(modData)
  loading.value = false

  if (result.success) {
    mostrarExito(result.data.mensaje)
    cerrarFormCrearMod()
    await cargarModeradores()
    await cargarEstadisticasMods()
  } else {
    mostrarError(result.error)
  }
}

const abrirEditarMod = (mod) => {
  modEditando.value = {
    id: mod.id,
    nombre: mod.nombre,
    apellidos: mod.apellidos,
    celular: mod.celular || ''
  }
}

const guardarModerador = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  const { id, ...datos } = modEditando.value
  const result = await moderadoresService.editar(id, datos)
  loading.value = false

  if (result.success) {
    mostrarExito(result.data.mensaje)
    cerrarEditarMod()
    await cargarModeradores()
  } else {
    mostrarError(result.error)
  }
}

const confirmarEliminarMod = async (mod) => {
  if (!confirm(`¿Estás seguro de eliminar a ${mod.nombre} ${mod.apellidos}?`)) {
    return
  }

  loading.value = true
  const result = await moderadoresService.eliminar(mod.id)
  loading.value = false

  if (result.success) {
    mostrarExito(result.data.mensaje)
    await cargarModeradores()
    await cargarEstadisticasMods()
  } else {
    mostrarError(result.error)
  }
}

const abrirMenuEstado = (mod) => {
  modCambiarEstado.value = mod
}

const cambiarEstadoMod = async (nuevoEstado) => {
  if (modCambiarEstado.value.estado.nombre === nuevoEstado) {
    modCambiarEstado.value = null
    return
  }

  loading.value = true
  const result = await moderadoresService.cambiarEstado(modCambiarEstado.value.id, nuevoEstado)
  loading.value = false

  if (result.success) {
    mostrarExito(result.data.mensaje)
    modCambiarEstado.value = null
    await cargarModeradores()
    await cargarEstadisticasMods()
  } else {
    mostrarError(result.error)
  }
}

const cerrarFormCrearMod = () => {
  mostrarFormCrearMod.value = false
  nuevoMod.value = {
    email: '',
    username: '',
    password: '',
    nombre: '',
    apellidos: '',
    celular: ''
  }
}

const cerrarEditarMod = () => {
  modEditando.value = null
}

// Funciones de Usuarios
const cargarUsuarios = async () => {
  loadingUsers.value = true
  const result = await usuariosService.obtenerTodos(true)
  loadingUsers.value = false

  if (result.success) {
    usuarios.value = result.data
  } else {
    mostrarError(result.error)
  }
}

const cargarEstadisticasUsers = async () => {
  const result = await usuariosService.obtenerEstadisticas()
  if (result.success) {
    estadisticasUsers.value = result.data
  }
}

// Funciones de Auditoría
const cargarAuditoria = async () => {
  loadingAudit.value = true
  const result = await auditoriaService.obtenerTodas()
  loadingAudit.value = false

  if (result.success) {
    auditorias.value = result.data
  } else {
    mostrarError(result.error)
  }
}

const getAuditoriaIcon = (accion) => {
  const iconos = {
    'crear_moderador': 'pi-user-plus',
    'editar_moderador': 'pi-user-edit',
    'eliminar_moderador': 'pi-user-minus',
    'cambiar_estado_moderador': 'pi-cog',
    'eliminar_tienda': 'pi-trash',
    'eliminar_producto': 'pi-trash',
    'default': 'pi-info-circle'
  }
  return `pi ${iconos[accion] || iconos.default}`
}

const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  const opciones = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return date.toLocaleDateString('es-ES', opciones)
}

// Utilidades
const mostrarError = (mensaje) => {
  error.value = mensaje
  setTimeout(() => error.value = '', 5000)
}

const mostrarExito = (mensaje) => {
  success.value = mensaje
  setTimeout(() => success.value = '', 3000)
}

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.superadmin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  border-radius: 15px;
  color: white;
}

.header-info h1 {
  margin: 0 0 5px 0;
  font-size: 2rem;
}

.header-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  color: var(--gris-claro);
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.tab:hover {
  color: var(--cafe);
}

.tab.active {
  color: var(--cafe);
  border-bottom-color: var(--naranja-opaco);
}

/* Mensajes */
.mensaje {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  position: relative;
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

.btn-cerrar-mensaje {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.btn-cerrar-mensaje:hover {
  opacity: 1;
}

/* Estadísticas */
.estadisticas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: white;
  border-radius: 15px;
  border: 2px solid;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.stat-card i {
  font-size: 3rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 2.5rem;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: var(--gris-claro);
  font-size: 0.9rem;
}

.stat-total {
  border-color: var(--cafe);
}

.stat-total i {
  color: var(--cafe);
}

.stat-activos {
  border-color: #4CAF50;
}

.stat-activos i {
  color: #4CAF50;
}

.stat-inactivos {
  border-color: #f44336;
}

.stat-inactivos i {
  color: #f44336;
}

.stat-suspendidos {
  border-color: #FF9800;
}

.stat-suspendidos i {
  color: #FF9800;
}

.stat-bloqueados {
  border-color: #9C27B0;
}

.stat-bloqueados i {
  color: #9C27B0;
}

.stat-nuevos,
.stat-vendedores {
  border-color: var(--naranja-opaco);
}

.stat-nuevos i,
.stat-vendedores i {
  color: var(--naranja-opaco);
}

/* Controles */
.controles {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-primario {
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
  white-space: nowrap;
}

.btn-primario:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

.btn-primario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-buscar {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-buscar:focus {
  outline: none;
  border-color: var(--naranja-opaco);
  box-shadow: 0 0 0 3px rgba(178, 113, 57, 0.1);
}

.select-filtro {
  padding: 12px 20px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-filtro:focus {
  outline: none;
  border-color: var(--naranja-opaco);
}

/* Formulario Card */
.formulario-card {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
}

.formulario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.formulario-header h3 {
  color: var(--cafe);
  margin: 0;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.campo-grupo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.campo {
  display: flex;
  flex-direction: column;
}

.campo label {
  color: var(--cafe);
  font-weight: 600;
  margin-bottom: 8px;
}

.input {
  padding: 12px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--naranja-opaco);
  box-shadow: 0 0 0 3px rgba(178, 113, 57, 0.1);
}

.acciones {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-secundario {
  padding: 12px 24px;
  background: transparent;
  color: var(--cafe);
  border: 2px solid var(--cafe);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secundario:hover {
  background: var(--cafe);
  color: white;
}

.btn-icono {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--gris-claro);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-icono:hover {
  background: var(--crema);
  color: var(--cafe);
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--gris-claro);
}

.loading i {
  font-size: 3rem;
  margin-bottom: 15px;
}

/* Tabla */
.tabla-container {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  overflow: hidden;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
}

.tabla thead {
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
}

.tabla th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
}

.tabla tbody tr {
  border-bottom: 1px solid var(--crema);
  transition: background 0.3s ease;
}

.tabla tbody tr:hover {
  background: var(--crema);
}

.tabla td {
  padding: 15px;
}

.celda-nombre {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.badge-estado {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-activo {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-inactivo {
  background: #ffebee;
  color: #c62828;
}

.badge-suspendido {
  background: #fff3e0;
  color: #e65100;
}

.badge-bloqueado {
  background: #fce4ec;
  color: #880e4f;
}

.badge-tipo {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #e3f2fd;
  color: #1976d2;
}

.badge-vendedor {
  background: #f3e5f5;
  color: #7b1fa2;
}

.estado-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.acciones-tabla {
  display: flex;
  gap: 8px;
}

.btn-icono-tabla {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: var(--crema);
  color: var(--cafe);
}

.btn-icono-tabla:hover {
  transform: scale(1.1);
}

.btn-editar:hover {
  background: #2196F3;
  color: white;
}

.btn-eliminar:hover {
  background: #f44336;
  color: white;
}

.sin-datos {
  text-align: center;
  padding: 40px;
  color: var(--gris-claro);
}

/* Auditoría */
.auditoria-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.auditoria-header h2 {
  color: var(--cafe);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.auditoria-lista {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.auditoria-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.auditoria-item:hover {
  border-color: var(--naranja-opaco);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.auditoria-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.auditoria-content {
  flex: 1;
}

.auditoria-header-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.auditoria-header-item strong {
  color: var(--cafe);
  text-transform: capitalize;
}

.auditoria-fecha {
  color: var(--gris-claro);
  font-size: 0.85rem;
}

.auditoria-descripcion {
  margin: 0 0 10px 0;
  color: var(--gris-oscuro);
}

.auditoria-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--gris-claro);
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

.modal-pequeño {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid var(--crema);
}

.modal-header h3 {
  color: var(--cafe);
  margin: 0;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px 25px;
  border-top: 2px solid var(--crema);
}

.estados-opciones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}

.estado-opcion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.estado-opcion:hover:not(:disabled) {
  border-color: var(--naranja-opaco);
  transform: translateY(-2px);
}

.estado-opcion.active {
  border-color: var(--cafe);
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
}

.estado-opcion:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.estado-opcion i {
  font-size: 2rem;
}

.estado-opcion span {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .estadisticas {
    grid-template-columns: 1fr;
  }

  .controles {
    flex-direction: column;
  }

  .campo-grupo {
    grid-template-columns: 1fr;
  }

  .tabla-container {
    overflow-x: auto;
  }

  .estados-opciones {
    grid-template-columns: 1fr;
  }

  .acciones {
    flex-direction: column;
  }

.btn-primario,
.btn-secundario {
    width: 100%;
    justify-content: center;
    background-color: rgba(255,255,255,0.2);
    color: white;
    border: 2px solid white;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
.btn-logout:hover {
  background-color: white;
  color: var(--cafe);
}
}
/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--crema);
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;

}

</style>