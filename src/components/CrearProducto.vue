<template>
  <div class="crear-producto-container">
    <div class="header">
      <button @click="volver" class="btn-volver">
        <i class="pi pi-arrow-left"></i>
        <span>Volver</span>
      </button>
      <h1>Agregar Producto</h1>
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

    <form @submit.prevent="crearProducto" class="formulario">
      <!-- Información básica -->
      <div class="seccion">
        <h2><i class="pi pi-info-circle"></i> Información del Producto</h2>
        
        <div class="campo">
          <label for="nombre">Nombre del producto *</label>
          <input 
            id="nombre"
            v-model="formulario.nombre"
            type="text"
            required
            placeholder="Ej: Polera de algodón"
            class="input"
          />
        </div>

        <div class="campo">
          <label for="descripcion">Descripción</label>
          <textarea 
            id="descripcion"
            v-model="formulario.descripcion"
            rows="4"
            placeholder="Describe tu producto..."
            class="input"
          ></textarea>
        </div>

        <div class="campo">
          <label for="precio">Precio (Bs) *</label>
          <input 
            id="precio"
            v-model.number="formulario.precio"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            class="input"
            style="max-width: 300px;"
          />
        </div>
      </div>

      <!-- Categoría -->
      <div class="seccion">
        <h2><i class="pi pi-tag"></i> Categoría</h2>
        
        <div class="campo">
          <label for="categoria-padre">Categoría Principal *</label>
          <select 
            id="categoria-padre"
            v-model="categoriaPadreSeleccionada"
            @change="onCategoriaPadreChange"
            required
            class="input"
          >
            <option value="">Selecciona una categoría</option>
            <option 
              v-for="cat in categoriasPrincipales" 
              :key="cat.id" 
              :value="cat.id"
            >
              {{ cat.nombre }}
            </option>
          </select>
        </div>

        <div v-if="subcategorias.length > 0" class="campo">
          <label for="subcategoria">Subcategoría *</label>
          <select 
            id="subcategoria"
            v-model="formulario.categoria_id"
            required
            class="input"
          >
            <option value="">Selecciona una subcategoría</option>
            <option 
              v-for="sub in subcategorias" 
              :key="sub.id" 
              :value="sub.id"
            >
              {{ sub.nombre }}
            </option>
          </select>
        </div>

        <div v-else-if="categoriaPadreSeleccionada" class="campo">
          <p class="info-text">
            <i class="pi pi-info-circle"></i>
            Esta categoría no tiene subcategorías. Se usará la categoría principal.
          </p>
        </div>
      </div>

      <!-- Talla -->
      <div class="seccion">
        <h2><i class="pi pi-clone"></i> Talla</h2>
        
        <div class="campo">
          <label for="talla">Selecciona una talla</label>
          <select 
            id="talla"
            v-model="formulario.talla_id"
            class="input"
          >
            <option value="">Sin talla específica</option>
            <option 
              v-for="talla in tallas" 
              :key="talla.id" 
              :value="talla.id"
            >
              {{ talla.nombre }}
            </option>
          </select>
        </div>
      </div>

      <!-- Imágenes -->
      <div class="seccion">
        <h2><i class="pi pi-image"></i> Imágenes del Producto</h2>
        
        <div class="campo">
          <label for="imagenes">Subir imágenes (opcional)</label>
          <input 
            id="imagenes"
            type="file"
            accept="image/*"
            multiple
            @change="handleImagenes"
            class="input-file"
          />
          <small>Puedes seleccionar múltiples imágenes</small>
        </div>

        <!-- Preview de imágenes -->
        <div v-if="imagenesPreview.length > 0" class="imagenes-preview">
          <div 
            v-for="(img, index) in imagenesPreview" 
            :key="index"
            class="imagen-preview"
          >
            <img :src="img.url" :alt="`Preview ${index + 1}`" />
            <button 
              type="button"
              @click="eliminarImagen(index)"
              class="btn-eliminar-img"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="acciones">
        <button 
          type="button"
          @click="volver"
          class="btn-secundario"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          :disabled="loading"
          class="btn-primario"
        >
          <i class="pi pi-check"></i>
          <span>{{ loading ? 'Creando...' : 'Crear Producto' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productosService } from '../services/productosService'
import  categoriasService  from '../services/categoriasService'
import { tallasService } from '../services/tallasService'

const router = useRouter()
const route = useRoute()

const tiendaId = route.params.id

const formulario = ref({
  nombre: '',
  descripcion: '',
  precio: null,
  categoria_id: '',
  talla_id: '',
  tienda_id: tiendaId
})

const categoriaPadreSeleccionada = ref('')
const categoriasPrincipales = ref([])
const subcategorias = ref([])
const tallas = ref([])

const imagenesArchivos = ref([])
const imagenesPreview = ref([])

const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(async () => {
  await cargarDatos()
})

const cargarDatos = async () => {
  try {
    // Cargar categorías principales
    const resultCategorias = await categoriasService.obtenerTodasCategorias(true, true)
    categoriasPrincipales.value = resultCategorias

    // Cargar tallas
    const resultTallas = await tallasService.obtenerTodas()
    tallas.value = resultTallas
  } catch (err) {
    error.value = 'Error al cargar datos: ' + err.message
  }
}

const onCategoriaPadreChange = async () => {
  subcategorias.value = []
  formulario.value.categoria_id = ''

  if (!categoriaPadreSeleccionada.value) return

  try {
    // Obtener subcategorías de la categoría padre seleccionada
    const result = await categoriasService.obtenerSubcategorias(categoriaPadreSeleccionada.value)
    
    if (result && result.length > 0) {
      subcategorias.value = result
    } else {
      // Si no tiene subcategorías, usar la categoría padre como categoría del producto
      formulario.value.categoria_id = categoriaPadreSeleccionada.value
    }
  } catch (err) {
    error.value = 'Error al cargar subcategorías: ' + err.message
  }
}

const handleImagenes = (e) => {
  const files = Array.from(e.target.files)
  
  files.forEach(file => {
    imagenesArchivos.value.push(file)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      imagenesPreview.value.push({
        url: event.target.result,
        file: file
      })
    }
    reader.readAsDataURL(file)
  })
}

const eliminarImagen = (index) => {
  imagenesArchivos.value.splice(index, 1)
  imagenesPreview.value.splice(index, 1)
}

const crearProducto = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const input = {
      tiendaId: tiendaId,  // ✅ camelCase
      nombre: formulario.value.nombre,
      descripcion: formulario.value.descripcion,
      precio: parseFloat(formulario.value.precio),
      stock: 0,  // ✅ Siempre 0
      categoriaId: formulario.value.categoria_id || categoriaPadreSeleccionada.value,  // ✅ camelCase
      imagenes: imagenesArchivos.value.length > 0 ? imagenesArchivos.value : undefined
    }

    // Solo agregar talla si se seleccionó una
    if (formulario.value.talla_id) {
      input.tallaId = formulario.value.talla_id  // ✅ camelCase
    }

    console.log('Input a enviar:', input) // ✅ Para debug

    const result = await productosService.crear(input)
    
    loading.value = false
    success.value = result.mensaje || 'Producto creado exitosamente'

    setTimeout(() => {
      router.push(`/tienda/${tiendaId}`)
    }, 1500)

  } catch (err) {
    loading.value = false
    error.value = err.message || 'Error al crear el producto'
  }
}

const volver = () => {
  router.push(`/tienda/${tiendaId}`)
}
</script>

<style scoped>
.crear-producto-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.header h1 {
  color: var(--cafe);
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
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-volver:hover {
  background-color: var(--cafe);
  color: var(--crema);
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

.formulario {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.seccion {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  padding: 25px;
}

.seccion h2 {
  color: var(--cafe);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
}

.campo {
  margin-bottom: 20px;
}

.campo:last-child {
  margin-bottom: 0;
}

.campo-grupo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.campo label {
  display: block;
  color: var(--cafe);
  font-weight: 600;
  margin-bottom: 8px;
}

.input, textarea, select {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--naranja-opaco);
  box-shadow: 0 0 0 3px rgba(178, 113, 57, 0.1);
}

.input-file {
  padding: 8px;
  border: 2px dashed var(--cafe-claro);
  cursor: pointer;
}

small {
  display: block;
  color: var(--gris-claro);
  font-size: 0.85rem;
  margin-top: 5px;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gris-claro);
  font-size: 0.9rem;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.imagenes-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.imagen-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--cafe-claro);
}

.imagen-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-eliminar-img {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(244, 67, 54, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-eliminar-img:hover {
  background-color: #f44336;
  transform: scale(1.1);
}

.acciones {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn-secundario, .btn-primario {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secundario {
  background-color: transparent;
  color: var(--cafe);
  border: 2px solid var(--cafe);
}

.btn-secundario:hover {
  background-color: var(--cafe);
  color: white;
}

.btn-primario {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border: none;
}

.btn-primario:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

.btn-primario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .campo-grupo {
    grid-template-columns: 1fr;
  }
  
  .acciones {
    flex-direction: column;
  }
  
  .btn-secundario, .btn-primario {
    width: 100%;
    justify-content: center;
  }
}
</style>