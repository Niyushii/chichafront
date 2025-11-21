<template>
  <div class="compra-container">
    <!-- HEADER -->
    <div class="header">
      <button @click="router.back()" class="btn-volver">
        <i class="pi pi-arrow-left"></i>
        <span>Volver</span>
      </button>
      <h1>Confirmar Compra</h1>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Cargando información...</p>
    </div>

    <!-- MENSAJES -->
    <div v-if="error" class="mensaje mensaje-error">
      <i class="pi pi-times-circle"></i>
      <span>{{ error }}</span>
    </div>

    <div v-if="success" class="mensaje mensaje-success">
      <i class="pi pi-check-circle"></i>
      <span>{{ success }}</span>
    </div>

    <!-- CONTENIDO -->
    <div v-if="!loading && producto" class="compra-content">

      <!-- DETALLES PRODUCTO -->
      <div class="seccion producto-detalle">
        <h2><i class="pi pi-shopping-cart"></i> Producto a Comprar</h2>

        <div class="producto-info">
          <div class="producto-imagen-container">
            <img 
              v-if="producto.imagenes && producto.imagenes.length > 0"
              :src="producto.imagenes[0].archivo"
              alt="Imagen del producto"
              class="producto-imagen"
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

            <div class="producto-detalles-grid">
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

            <!-- Info tienda -->
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

      <!-- INFORMACIÓN DE PAGO -->
      <div class="seccion pago-info">
        <h2><i class="pi pi-wallet"></i> Información de Pago</h2>

        <!-- TIENE QR -->
      <div v-if="producto.tienda.codigoQr" class="contenido-con-qr">

        <!-- Texto arriba del QR -->
        <p class="qr-instrucciones qr-arriba">
          <i class="pi pi-info-circle"></i>
          Escanea este código QR para realizar el pago
        </p>

        <!-- QR centrado -->
        <div class="qr-center">
          <img :src="producto.tienda.codigoQr" alt="Código QR" class="qr-img" />
        </div>

        <!-- Resumen centrado -->
        <div class="resumen-compra resumen-centered">
          <div class="resumen-line">
            <span>Subtotal:</span>
            <strong>Bs {{ calcularSubtotal() }}</strong>
          </div>
          <div class="resumen-line total">
            <span>Total a Pagar:</span>
            <strong>Bs {{ calcularSubtotal() }}</strong>
          </div>
        </div>
        <!-- Formulario comprobante -->
        <div class="comprobante-section">
          <h3>Subir Comprobante de Pago</h3>

          <div class="campo">
            <label for="comprobante"></label>
            <input 
              id="comprobante"
              type="file"
              accept="image/*"
              @change="handleComprobante"
              required
              class="input-file"
            />
          </div>

          <div v-if="comprobantePreview" class="comprobante-preview">
            <img :src="comprobantePreview" alt="Preview comprobante" class="comprobante-preview-img"/>
            <button 
              type="button"
              @click="eliminarComprobante"
              class="btn-eliminar-preview"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
          <!-- Botón centrado -->
                   <p class="nota-info">
          <i class="pi pi-info-circle"></i>
          Al confirmar, el vendedor recibirá una notificación.
        </p>
        <div class="btn-center">
          <button 
            class="btn-confirmar-pago"
            @click="confirmarPagoQR"
          >
            <i class="pi pi-check-circle"></i>
            <span> Confirmar Pago Realizado</span>
          </button>
        </div>
        </div>

      </div>
        <!-- NO TIENE QR -->
        <div v-else class="no-qr-box">
          <div class="alerta-sin-qr">
            <i class="pi pi-info-circle icono-alerta"></i>
            <div>
              <h3>Contacta al Vendedor</h3>
              <p>Esta tienda no tiene QR, coordina el pago directamente.</p>
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

          <div class="info-adicional">
            <h4>Detalles de tu compra:</h4>

            <div class="detalle-compra">
              <span>Producto:</span>
              <strong>{{ producto.producto.nombre }}</strong>
            </div>

            <div class="detalle-compra">
              <span>Precio unitario:</span>
              <strong>Bs {{ formatearPrecio(producto.precio) }}</strong>
            </div>

            <div v-if="producto.talla" class="detalle-compra">
              <span>Talla:</span>
              <strong>{{ producto.talla.nombre }}</strong>
            </div>
          </div>
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
const confirmarPagoQR = () => {
  console.log("Enviando notificación al vendedor... (pendiente de implementar)");
  
  // Aquí después implementaremos:
  // - notificación al vendedor
  // - registro del intento de pago
  // - cambio de estado del pedido si quieres
}

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
  console.log("TIENDA:", producto.value?.tienda)
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
    `Hola! Me interesa comprar tu producto "${producto.value.producto.nombre}" por Bs ${formatearPrecio(producto.value.precio)}. ¿Cómo puedo realizar el pago?`
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
.compra-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
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
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-volver:hover {
  background-color: var(--cafe);
  color: white;
}

/* Mensajes */
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

/* Contenido */
.compra-content {
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
  font-size: 1.4rem;
}

/* Producto Detalle */
.producto-info {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
}

.producto-imagen {
  width: 100%;
  height: 250px;
  border-radius: 15px;
  overflow: hidden;
  border: 2px solid var(--cafe-claro);
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
  font-size: 4rem;
}

.producto-datos h3 {
  color: var(--cafe);
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.descripcion {
  color: var(--gris-claro);
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.detalles {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.detalle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gris-oscuro);
}

.detalle-item i {
  color: var(--naranja-opaco);
  font-size: 1.2rem;
}

.precio {
  color: var(--cafe);
  font-weight: 700;
  font-size: 1.5rem;
}

.tienda-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: var(--crema);
  border-radius: 10px;
  margin-top: 20px;
}

.tienda-info i {
  color: var(--naranja-opaco);
  font-size: 1.3rem;
}

.tienda-info div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tienda-info strong {
  color: var(--cafe);
  font-size: 0.9rem;
}

.tienda-info span {
  color: var(--gris-oscuro);
  font-size: 1.1rem;
}

/* Contenido con QR */
.contenido-con-qr {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.qr-section {
  display: flex;
  flex-direction: column;
}

.qr-container {
  background: var(--crema);
  padding: 20px;
  border-radius: 15px;
  text-align: center;
}

.qr-image {
  width: 100%;
  max-width: 250px;
  height: auto;
  border-radius: 10px;
  border: 3px solid var(--cafe);
  margin-bottom: 15px;
}

.qr-instrucciones {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gris-oscuro);
  font-size: 0.9rem;
  text-align: left;
  margin: 0;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.qr-instrucciones i {
  color: var(--naranja-opaco);
  font-size: 1.2rem;
}

/* Comprobante Section */
.comprobante-section h3 {
  color: var(--cafe);
  margin: 0 0 20px 0;
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

.input {
  width: 100%;
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

.input-file {
  width: 100%;
  padding: 10px;
  border: 2px dashed var(--cafe-claro);
  border-radius: 10px;
  cursor: pointer;
}

small {
  display: block;
  color: var(--gris-claro);
  font-size: 0.85rem;
  margin-top: 5px;
}

.comprobante-preview {
  position: relative;
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--cafe-claro);
}

.comprobante-preview img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.btn-eliminar-preview {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(244, 67, 54, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-eliminar-preview:hover {
  background: #f44336;
  transform: scale(1.1);
}

/* Resumen */
.resumen-compra {
  background: var(--crema);
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
}

.resumen-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  color: var(--gris-oscuro);
}

.resumen-item.total {
  border-top: 2px solid var(--cafe-claro);
  margin-top: 10px;
  padding-top: 15px;
  font-size: 1.2rem;
  color: var(--cafe);
}

.btn-confirmar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 30px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirmar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

.btn-confirmar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.nota-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gris-claro);
  font-size: 0.9rem;
  margin-top: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.nota-info i {
  color: var(--naranja-opaco);
}

/* Contenido sin QR */
.contenido-sin-qr {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.alerta-sin-qr {
  display: flex;
  gap: 20px;
  padding: 25px;
  background: linear-gradient(135deg, #fff9e6, #ffe6cc);
  border: 2px solid var(--naranja-opaco);
  border-radius: 15px;
  align-items: start;
}

.icono-alerta {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icono-alerta i {
  font-size: 2rem;
  color: var(--naranja-opaco);
}

.contenido-alerta h3 {
  color: var(--cafe);
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.contenido-alerta p {
  color: var(--gris-oscuro);
  margin: 0;
  line-height: 1.6;
}

.btn-whatsapp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 35px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
}

.btn-whatsapp:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
}

.btn-whatsapp i {
  font-size: 1.8rem;
}

.info-adicional {
  background: var(--crema);
  padding: 20px;
  border-radius: 10px;
  border: 2px solid var(--cafe-claro);
}

.info-adicional h4 {
  color: var(--cafe);
  margin: 0 0 15px 0;
}

.detalle-compra {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--cafe-claro);
  color: var(--gris-oscuro);
}

.detalle-compra:last-child {
  border-bottom: none;
}

.detalle-compra strong {
  color: var(--cafe);
}

/* Responsive */
@media (max-width: 1024px) {
  .contenido-con-qr {
    grid-template-columns: 1fr;
  }

  .qr-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .producto-info {
    grid-template-columns: 1fr;
  }

  .producto-imagen {
    height: 200px;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-volver {
    width: 100%;
    justify-content: center;
  }
}
/* =============================
   FIX COMPLETO PARA CENTRAR TODO
   ============================= */
.contenido-con-qr {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  gap: 20px !important;
}

/* Quitar ese fondo feo del bloque QR original */
.qr-section, 
.qr-container {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

/* Texto arriba del QR */
.qr-arriba {
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 5px;
}

/* QR centrado */
.qr-img {
  display: block;
  margin: 0 auto;
}

/* Centrar resumen */
.resumen-centered {
  width: 100%;
  max-width: 300px;
  background: var(--crema);
  padding: 20px;
  border-radius: 10px;
}

/* Centrar el botón */
.btn-center {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Mejor apariencia del botón */
.btn-confirmar-pago {
  padding: 14px 28px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.3s ease;
}

.btn-confirmar-pago:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

</style>