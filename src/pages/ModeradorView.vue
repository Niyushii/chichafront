<template>
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
      <div>
        <h1 style="margin: 0 0 5px 0;">Panel de Moderador</h1>
        <p style="margin: 0; color: #666; font-size: 16px;">Bienvenido, {{ moderadorData?.username || 'Moderador' }}</p>
      </div>
      <button 
        @click="handleLogout"
        style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
      >
        Cerrar Sesión
      </button>
    </div>

    <!-- Estadísticas de Categorías -->
    <div v-if="estadisticas" style="margin-bottom: 40px;">
      <h2>Estadísticas de Categorías</h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px;">
        <div style="padding: 20px; border: 2px solid #4CAF50; border-radius: 8px;">
          <h3 style="margin: 0; font-size: 32px; color: #4CAF50;">{{ estadisticas.total }}</h3>
          <p style="margin: 5px 0 0 0; color: #666;">Total Categorías</p>
        </div>
        <div style="padding: 20px; border: 2px solid #2196F3; border-radius: 8px;">
          <h3 style="margin: 0; font-size: 32px; color: #2196F3;">{{ estadisticas.principales }}</h3>
          <p style="margin: 5px 0 0 0; color: #666;">Principales</p>
        </div>
        <div style="padding: 20px; border: 2px solid #FF9800; border-radius: 8px;">
          <h3 style="margin: 0; font-size: 32px; color: #FF9800;">{{ estadisticas.subcategorias }}</h3>
          <p style="margin: 5px 0 0 0; color: #666;">Subcategorías</p>
        </div>
        <div style="padding: 20px; border: 2px solid #9C27B0; border-radius: 8px;">
          <h3 style="margin: 0; font-size: 32px; color: #9C27B0;">{{ estadisticas.activas }}</h3>
          <p style="margin: 5px 0 0 0; color: #666;">Activas</p>
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

    <!-- Botones de acción -->
    <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center;">
      <button 
        @click="mostrarFormularioCrear = !mostrarFormularioCrear"
        style="padding: 12px 24px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
      >
        {{ mostrarFormularioCrear ? 'Cancelar' : '+ Crear Categoría' }}
      </button>
      
      <button 
        @click="toggleVistaJerarquia"
        style="padding: 12px 24px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
      >
        {{ vistaJerarquia ? 'Ver Lista' : 'Ver Jerarquía' }}
      </button>

      <input 
        v-model="busqueda"
        @input="buscarCategorias"
        type="text"
        placeholder="Buscar categorías..."
        style="flex: 1; padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;"
      />
    </div>

    <!-- Formulario crear categoría -->
    <div v-if="mostrarFormularioCrear" style="border: 2px solid #4CAF50; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
      <h3>Crear Nueva Categoría</h3>
      <form @submit.prevent="crearCategoria">
        <div style="margin-bottom: 15px;">
          <label>Nombre: *</label>
          <input 
            v-model="nuevaCategoria.nombre" 
            type="text" 
            required
            style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
          />
        </div>
        <div style="margin-bottom: 15px;">
          <label>Ícono:</label>
          <input 
            v-model="nuevaCategoria.icono" 
            type="text" 
            placeholder="Ej: 📱, 🎮, 👕"
            style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
          />
        </div>
        <div style="margin-bottom: 15px;">
          <label>Categoría Padre (opcional):</label>
          <select 
            v-model="nuevaCategoria.categoriaPadreId"
            style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
          >
            <option :value="null">-- Sin categoría padre (Principal) --</option>
            <option v-for="cat in categoriasPrincipales" :key="cat.id" :value="cat.id">
              {{ cat.icono }} {{ cat.nombre }}
            </option>
          </select>
        </div>
        <button 
          type="submit" 
          :disabled="loading"
          style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          {{ loading ? 'Creando...' : 'Crear Categoría' }}
        </button>
      </form>
    </div>

    <!-- Vista Jerarquía -->
    <div v-if="vistaJerarquia">
      <h2>Jerarquía de Categorías</h2>
      
      <div v-if="loading && !jerarquia.length" style="padding: 20px; text-align: center;">
        Cargando categorías...
      </div>

      <div v-else style="margin-top: 20px;">
        <div v-for="categoria in jerarquia" :key="categoria.id" style="margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <!-- Categoría Principal -->
          <div style="background-color: #f5f5f5; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">{{ categoria.icono || '📁' }}</span>
              <div>
                <h3 style="margin: 0;">{{ categoria.nombre }}</h3>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                  {{ categoria.subcategorias?.length || 0 }} subcategorías | {{ categoria.totalProductos || 0 }} productos
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button 
                @click="seleccionarParaEditar(categoria)"
                style="padding: 6px 12px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;"
              >
                Editar
              </button>
              <button 
                @click="confirmarEliminar(categoria)"
                style="padding: 6px 12px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;"
              >
                Eliminar
              </button>
            </div>
          </div>
          
          <!-- Subcategorías -->
          <div v-if="categoria.subcategorias && categoria.subcategorias.length > 0" style="padding: 10px 15px 10px 40px;">
            <div v-for="sub in categoria.subcategorias" :key="sub.id" style="padding: 10px; margin: 5px 0; background-color: #fafafa; border-left: 3px solid #2196F3; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">{{ sub.icono || '📄' }}</span>
                <div>
                  <strong>{{ sub.nombre }}</strong>
                  <span style="color: #666; font-size: 14px; margin-left: 10px;">{{ sub.totalProductos || 0 }} productos</span>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button 
                  @click="seleccionarParaEditar(sub)"
                  style="padding: 4px 10px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
                >
                  Editar
                </button>
                <button 
                  @click="confirmarEliminar(sub)"
                  style="padding: 4px 10px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="!loading && jerarquia.length === 0" style="text-align: center; padding: 40px; color: #666;">
          No hay categorías registradas
        </p>
      </div>
    </div>

    <!-- Vista Lista -->
    <div v-else>
      <h2>Lista de Categorías</h2>
      
      <div v-if="loading && !categorias.length" style="padding: 20px; text-align: center;">
        Cargando categorías...
      </div>

      <table v-else style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Ícono</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Nombre</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Categoría Padre</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Productos</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Estado</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="categoria in categorias" :key="categoria.id" style="border: 1px solid #ddd;">
            <td style="padding: 12px; border: 1px solid #ddd; font-size: 24px; text-align: center;">
              {{ categoria.icono || '📁' }}
            </td>
            <td style="padding: 12px; border: 1px solid #ddd;">
              <strong>{{ categoria.nombre }}</strong>
            </td>
            <td style="padding: 12px; border: 1px solid #ddd;">
              {{ categoria.categoriaPadre ? `${categoria.categoriaPadre.icono || '📁'} ${categoria.categoriaPadre.nombre}` : 'Principal' }}
            </td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
              {{ categoria.totalProductos || 0 }}
            </td>
            <td style="padding: 12px; border: 1px solid #ddd;">
              <span :style="{ 
                color: categoria.estado.nombre === 'activo' ? '#4CAF50' : '#f44336', 
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }">
                {{ categoria.estado.nombre }}
              </span>
            </td>
            <td style="padding: 12px; border: 1px solid #ddd;">
              <button 
                @click="seleccionarParaEditar(categoria)"
                style="padding: 6px 12px; margin-right: 8px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;"
              >
                Editar
              </button>
              <button 
                @click="confirmarEliminar(categoria)"
                style="padding: 6px 12px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="!loading && categorias.length === 0" style="text-align: center; padding: 40px; color: #666;">
        No hay categorías registradas
      </p>
    </div>

    <!-- Formulario editar categoría (modal) -->
    <div v-if="categoriaEditando" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%;">
        <h3>Editar Categoría</h3>
        <form @submit.prevent="editarCategoria">
          <div style="margin-bottom: 15px;">
            <label>Nombre: *</label>
            <input 
              v-model="categoriaEditando.nombre" 
              type="text" 
              required
              style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
            />
          </div>
          <div style="margin-bottom: 15px;">
            <label>Ícono:</label>
            <input 
              v-model="categoriaEditando.icono" 
              type="text"
              placeholder="Ej: 📱, 🎮, 👕"
              style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
            />
          </div>
          <div style="margin-bottom: 20px;">
            <label>Categoría Padre:</label>
            <select 
              v-model="categoriaEditando.categoriaPadreId"
              style="display: block; width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
            >
              <option :value="null">-- Sin categoría padre (Principal) --</option>
              <option 
                v-for="cat in categoriasPrincipales.filter(c => c.id !== categoriaEditando.id)" 
                :key="cat.id" 
                :value="cat.id"
              >
                {{ cat.icono }} {{ cat.nombre }}
              </option>
            </select>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import categoriasService from '../services/categoriasService'

const router = useRouter()

// Estado
const moderadorData = ref(null)
const categorias = ref([])
const jerarquia = ref([])
const categoriasPrincipales = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const busqueda = ref('')
const vistaJerarquia = ref(false)

const mostrarFormularioCrear = ref(false)
const nuevaCategoria = ref({
  nombre: '',
  icono: '',
  categoriaPadreId: null
})

const categoriaEditando = ref(null)

// Estadísticas computadas
const estadisticas = computed(() => {
  if (!categorias.value.length) return null
  
  const activas = categorias.value.filter(c => c.estado?.nombre === 'activo').length
  const principales = categorias.value.filter(c => !c.categoriaPadre).length
  const subcategorias = categorias.value.filter(c => c.categoriaPadre).length
  
  return {
    total: categorias.value.length,
    activas,
    principales,
    subcategorias
  }
})

onMounted(() => {
  moderadorData.value = authService.getUserData()
  cargarDatos()
})

const cargarDatos = async () => {
  await Promise.all([
    cargarCategorias(),
    cargarCategoriasPrincipales()
  ])
}

const cargarCategorias = async () => {
  loading.value = true
  try {
    categorias.value = await categoriasService.obtenerTodasCategorias(true, false)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const cargarJerarquia = async () => {
  loading.value = true
  try {
    jerarquia.value = await categoriasService.obtenerJerarquia()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const cargarCategoriasPrincipales = async () => {
  try {
    categoriasPrincipales.value = await categoriasService.obtenerCategoriasPrincipales()
  } catch (err) {
    console.error('Error al cargar categorías principales:', err)
  }
}

const toggleVistaJerarquia = async () => {
  vistaJerarquia.value = !vistaJerarquia.value
  if (vistaJerarquia.value) {
    await cargarJerarquia()
  }
}

const buscarCategorias = async () => {
  if (busqueda.value.trim() === '') {
    await cargarCategorias()
    return
  }

  loading.value = true
  try {
    categorias.value = await categoriasService.buscarCategorias(busqueda.value)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const crearCategoria = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const input = {
      nombre: nuevaCategoria.value.nombre,
      ...(nuevaCategoria.value.icono && { icono: nuevaCategoria.value.icono }),
      ...(nuevaCategoria.value.categoriaPadreId && { categoriaPadreId: nuevaCategoria.value.categoriaPadreId })
    }

    const result = await categoriasService.crearCategoria(input)
    success.value = result.mensaje
    mostrarFormularioCrear.value = false
    nuevaCategoria.value = { nombre: '', icono: '', categoriaPadreId: null }
    
    await cargarDatos()
    if (vistaJerarquia.value) await cargarJerarquia()
    
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const seleccionarParaEditar = (categoria) => {
  categoriaEditando.value = {
    id: categoria.id,
    nombre: categoria.nombre,
    icono: categoria.icono || '',
    categoriaPadreId: categoria.categoriaPadre?.id || null
  }
}

const editarCategoria = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const { id, ...input } = categoriaEditando.value

    const result = await categoriasService.editarCategoria(id, input)
    success.value = result.mensaje
    categoriaEditando.value = null
    
    await cargarDatos()
    if (vistaJerarquia.value) await cargarJerarquia()
    
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const cancelarEdicion = () => {
  categoriaEditando.value = null
}

const confirmarEliminar = async (categoria) => {
  if (!confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await categoriasService.eliminarCategoria(categoria.id)
    success.value = result.mensaje
    
    await cargarDatos()
    if (vistaJerarquia.value) await cargarJerarquia()
    
    setTimeout(() => { success.value = '' }, 3000)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
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

input:focus, select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  transition: all 0.2s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>