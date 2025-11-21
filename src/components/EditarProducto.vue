<!-- src/components/EditarProducto.vue -->
<template>
  <div class="crear-producto-container">
    <div class="header">
      <button @click="volver" class="btn-volver">
        <i class="pi pi-arrow-left"></i>
        <span>Volver</span>
      </button>
      <h1>Editar Producto</h1>
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

    <form @submit.prevent="actualizarProducto" class="formulario">

      <!-- Información básica -->
      <div class="seccion">
        <h2><i class="pi pi-info-circle"></i> Información del Producto</h2>

        <div class="campo">
          <label>Nombre *</label>
          <input v-model="formulario.nombre" type="text" required class="input"/>
        </div>

        <div class="campo">
          <label>Descripción</label>
          <textarea v-model="formulario.descripcion" rows="4" class="input"></textarea>
        </div>

        <div class="campo">
          <label>Precio (Bs) *</label>
          <input v-model.number="formulario.precio" type="number" min="0" step="0.01" required class="input"/>
        </div>
      </div>

      <!-- Categoría -->
      <div class="seccion">
        <h2><i class="pi pi-tag"></i> Categoría</h2>

        <div class="campo">
          <label>Categoría Principal *</label>
          <select v-model="categoriaPadreSeleccionada" @change="onCategoriaPadreChange" class="input">
            <option value="">Selecciona</option>
            <option v-for="cat in categoriasPrincipales" :value="cat.id">{{ cat.nombre }}</option>
          </select>
        </div>

        <div class="campo" v-if="subcategorias.length > 0">
          <label>Subcategoría *</label>
          <select v-model="formulario.categoria_id" class="input">
            <option value="">Selecciona</option>
            <option v-for="sub in subcategorias" :value="sub.id">{{ sub.nombre }}</option>
          </select>
        </div>
      </div>

      <!-- Talla -->
      <div class="seccion">
        <h2><i class="pi pi-clone"></i> Talla</h2>

        <div class="campo">
          <label>Talla</label>
          <select v-model="formulario.talla_id" class="input">
            <option value="">Sin talla</option>
            <option v-for="t in tallas" :value="t.id">{{ t.nombre }}</option>
          </select>
        </div>
      </div>

      <!-- Imágenes -->
      <div class="seccion">
        <h2><i class="pi pi-image"></i> Imágenes</h2>

        <!-- Imágenes ya existentes -->
        <div class="imagenes-preview" v-if="imagenesExistentes.length">
          <div class="imagen-preview" v-for="img in imagenesExistentes" :key="img.id">
            <img :src="img.url" />
          </div>
        </div>

        <!-- Nueva subida -->
        <div class="campo">
          <label>Nuevas imágenes</label>
          <input type="file" multiple accept="image/*" @change="handleImagenes" />
        </div>

        <div class="imagenes-preview" v-if="imagenesPreview.length">
          <div v-for="(img, i) in imagenesPreview" :key="i" class="imagen-preview">
            <img :src="img.url" />
            <button type="button" @click="eliminarImagen(i)" class="btn-eliminar-img">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="acciones">
        <button @click="volver" class="btn-secundario">Cancelar</button>
        <button type="submit" class="btn-primario">
          <i class="pi pi-check"></i> Actualizar Producto
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import categoriasService from '../services/categoriasService'
import { tallasService } from '../services/tallasService'
import { productosService } from '../services/productosService'

const router = useRouter()
const route = useRoute()

const tiendaId = route.params.id
const productoId = route.params.productoId

const formulario = ref({
  nombre: '',
  descripcion: '',
  precio: 0,
  categoria_id: '',
  talla_id: ''
})

const categoriaPadreSeleccionada = ref('')
const categoriasPrincipales = ref([])
const subcategorias = ref([])
const tallas = ref([])

const imagenesExistentes = ref([])
const imagenesArchivos = ref([])
const imagenesPreview = ref([])

const success = ref('')
const error = ref('')

onMounted(() => {
  cargarDatos()
})

async function cargarDatos() {
  try {
    // Categorías y tallas
    categoriasPrincipales.value = await categoriasService.obtenerTodasCategorias(true, true)
    tallas.value = await tallasService.obtenerTodas()

    // Datos del producto
    const p = await productosService.obtenerProducto(productoId)

    formulario.value = {
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      categoria_id: p.categoria.id,
      talla_id: p.talla ? p.talla.id : ''
    }

    categoriaPadreSeleccionada.value = p.categoria.padreId || p.categoria.id

    imagenesExistentes.value = p.imagenes.map(img => ({
      id: img.id,
      url: img.url
    }))

    // Subcategorías
    const subs = await categoriasService.obtenerSubcategorias(categoriaPadreSeleccionada.value)
    subcategorias.value = subs

  } catch (err) {
    error.value = 'Error cargando producto: ' + err.message
  }
}

function handleImagenes(e) {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    imagenesArchivos.value.push(file)
    const reader = new FileReader()
    reader.onload = r => imagenesPreview.value.push({ url: r.target.result, file })
    reader.readAsDataURL(file)
  })
}

function eliminarImagen(i) {
  imagenesArchivos.value.splice(i, 1)
  imagenesPreview.value.splice(i, 1)
}

async function actualizarProducto() {
  try {
    const input = {
      productoId,
      nombre: formulario.value.nombre,
      descripcion: formulario.value.descripcion,
      precio: formulario.value.precio,
      categoriaId: formulario.value.categoria_id,
      tallaId: formulario.value.talla_id || null,
      nuevasImagenes: imagenesArchivos.value.length ? imagenesArchivos.value : null
    }

    const res = await productosService.actualizar(input)

    success.value = res.mensaje || 'Producto actualizado ✨'

    setTimeout(() => {
      router.push(`/tienda/${tiendaId}`)
    }, 1200)

  } catch (err) {
    error.value = err.message
  }
}

function volver() {
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
