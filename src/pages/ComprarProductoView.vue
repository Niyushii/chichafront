<!-- src/pages/CompraProductoView.vue -->
<template>
  <div class="compra-container">
    <div class="header">
      <button @click="router.back()" class="btn-volver">
        <i class="pi pi-arrow-left"></i>
        <span>Volver</span>
      </button>
      <h1>Confirmar Compra</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Cargando información...</p>
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

    <!-- Contenido principal -->
    <div v-if="!loading && producto" class="compra-content">
      <!-- Detalles del producto -->
      <div class="seccion producto-detalle">
        <h2><i class="pi pi-shopping-cart"></i> Producto a Comprar</h2>
        
        <div class="producto-info">
          <div class="producto-imagen">
            <img 
              v-if="producto.imagenes && producto.imagenes.length > 0"
              :src="producto.imagenes[0].archivo"
              :alt="producto.producto.nombre"
            />
            <div v-else class="imagen-placeholder">
              <i class="pi pi-image"></i>
            </div>
          </div>

          <div class="producto-datos">
            <h3>{{ producto.producto.nombre }}</h3>
            <p v-if="producto.descripcion" class="descripcion">
              {{ producto.descripcion }}
            </p>

            <div class="detalles">
              <div class="detalle-item">
                <i class="pi pi-tag"></i>
                <span class="precio">Bs {{ formatearPrecio(producto.precio) }}</span>
              </div>

              <div v-if="producto.talla" class="detalle-item">
                <i class="pi pi-clone"></i>
                <span>Talla: {{ producto.talla.nombre }}</span>
              </div>

              <div v-if="producto.producto.categoria" class="detalle-item">
                <i class="pi pi-bookmark"></i>
                <span>{{ producto.producto.categoria.nombre }}</span>
              </div>
            </div>

            <!-- Info de la tienda -->
            <div class="tienda-info">
              <i class="pi pi-shop"></i>
              <div>
                <strong>Tienda:</strong>
                <span>{{ producto.tienda.nombre }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de pago -->
      <div class="seccion pago-info">
        <h2><i class="pi pi-wallet"></i> Información de Pago</h2>

        <!-- Si tiene código QR -->
        <div v-if="producto.tienda.codigoQr" class="qr-section">
          <div class="qr-container">
            <img :src="producto.tienda.codigoQr" alt="Código QR" class="qr-image" />
            <p class="qr-instrucciones">
              Escanea este código QR para realizar el pago y sube tu comprobante abajo
            </p>
          </div>
        </div>

        <!-- Si NO tiene código QR -->
        <div v-else class="contacto-vendedor">
          <div class="alerta-contacto">
            <i class="pi pi-info-circle"></i>
            <div>
              <strong>Contacta al vendedor</strong>
              <p>Esta tienda no tiene código QR disponible. Por favor, contacta al vendedor por WhatsApp para coordinar el pago.</p>
            </div>
          </div>

          <a 
            :href="getWhatsAppLink()" 
            target="_blank"
            class="btn-whatsapp"
          >
            <i class="pi pi-whatsapp"></i>
            <span>Contactar por WhatsApp</span>
          </a>
        </div>

        <!-- Formulario de comprobante -->
        <div class="comprobante-section">
          <h3>Subir Comprobante de Pago</h3>
          
          <div class="campo">
            <label for="cantidad">Cantidad *</label>
            <input 
              id="cantidad"
              v-model.number="formulario.cantidad"
              type="number"
              min="1"
              :max="producto.stock"
              required
              class="input"
            />
            <small>Disponibles: {{ producto.stock }}</small>
          </div>

          <div class="campo">
            <label for="comprobante">Comprobante de Pago *</label>
            <input 
              id="comprobante"
              type="file"
              accept="image/*"
              @change="handleComprobante"
              required
              class="input-file"
            />
            <small>Sube una foto de tu comprobante de pago</small>
          </div>

          <!-- Preview del comprobante -->
          <div v-if="comprobantePreview" class="comprobante-preview">
            <img :src="comprobantePreview" alt="Preview comprobante" />
            <button 
              type="button"
              @click="eliminarComprobante"
              class="btn-eliminar-preview"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Resumen -->
          <div class="resumen-compra">
            <div class="resumen-item">
              <span>Subtotal:</span>
              <strong>Bs {{ calcularSubtotal() }}</strong>
            </div>
            <div class="resumen-item total">
              <span>Total a Pagar:</span>
              <strong>Bs {{ calcularSubtotal() }}</strong>
            </div>
          </div>

          <!-- Botón de confirmar -->
          <button 
            @click="confirmarCompra"
            :disabled="!comprobanteArchivo || loadingCompra"
            class="btn-confirmar"
          >
            <i :class="loadingCompra ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
            <span>{{ loadingCompra ? 'Procesando...' : 'Confirmar Compra' }}</span>
          </button>

          <p class="nota-info">
            <i class="pi pi-info-circle"></i>
            Al confirmar, el vendedor recibirá una notificación para validar tu pago
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { productosService } from '../services/productosService'

const router = useRouter()
const route = useRoute()

const producto = ref(null)
const loading = ref(false)
const loadingCompra = ref(false)
const error = ref('')
const success = ref('')

const formulario = ref({
  cantidad: 1
})

const comprobanteArchivo = ref(null)
const comprobantePreview = ref(null)

// Mutation para crear venta
const CREAR_VENTA = gql`
  mutation CrearVenta($input: CrearVentaInput!, $comprobante: Upload!) {
    crearVenta(input: $input, comprobante: $comprobante) {
      venta {
        id
        total
        estado {
          nombre
        }
      }
      mensaje
    }
  }
`

const { mutate: crearVenta } = useMutation(CREAR_VENTA)

onMounted(async () => {
  await cargarDatos()
})

const cargarDatos = async () => {
  loading.value = true
  const productoId = route.params.productoId
  
  try {
    const productosData = await productosService.obtenerProductosTienda(route.params.tiendaId)
    producto.value = productosData.find(p => p.id === productoId)
    
    if (!producto.value) {
      error.value = 'Producto no encontrado'
      return
    }
  } catch (err) {
    error.value = 'Error al cargar los datos: ' + err.message
  } finally {
    loading.value = false
  }
}

const handleComprobante = (e) => {
  const file = e.target.files[0]
  if (file) {
    comprobanteArchivo.value = file
    
    const reader = new FileReader()
    reader.onload = (event) => {
      comprobantePreview.value = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const eliminarComprobante = () => {
  comprobanteArchivo.value = null
  comprobantePreview.value = null
  document.getElementById('comprobante').value = ''
}

const formatearPrecio = (precio) => {
  return parseFloat(precio).toFixed(2)
}

const calcularSubtotal = () => {
  if (!producto.value) return '0.00'
  const total = producto.value.precio * formulario.value.cantidad
  return total.toFixed(2)
}

const getWhatsAppLink = () => {
  if (!producto.value) return '#'
  
  const telefono = producto.value.tienda.telefono || ''
  const numeroLimpio = telefono.replace(/[^\d+]/g, '')
  
  const mensaje = encodeURIComponent(
    `Hola ${producto.value.tienda.nombre}! Me interesa comprar tu producto "${producto.value.producto.nombre}". ¿Cómo puedo realizar el pago?`
  )
  
  return `https://wa.me/${numeroLimpio}?text=${mensaje}`
}

const confirmarCompra = async () => {
  if (!comprobanteArchivo.value) {
    error.value = 'Debes subir un comprobante de pago'
    return
  }

  if (formulario.value.cantidad > producto.value.stock) {
    error.value = 'No hay suficiente stock disponible'
    return
  }

  loadingCompra.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await crearVenta({
      input: {
        tiendaProductoId: producto.value.id,
        cantidad: formulario.value.cantidad
      },
      comprobante: comprobanteArchivo.value
    })

    if (result?.data?.crearVenta) {
      success.value = result.data.crearVenta.mensaje
      
      setTimeout(() => {
        router.push('/notificaciones')
      }, 2000)
    }
  } catch (err) {
    error.value = err.message || 'Error al procesar la compra'
    console.error('Error al crear venta:', err)
  } finally {
    loadingCompra.value = false
  }
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