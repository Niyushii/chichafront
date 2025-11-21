<template>
  <div class="notificaciones-container">
    <div class="header">
      <button @click="router.push('/')" class="btn-volver">
        <i class="pi pi-arrow-left"></i>
        <span>Volver</span>
      </button>
      <h1>Mis Notificaciones</h1>
      <button 
        v-if="notificacionesNoLeidas > 0"
        @click="marcarTodasLeidas"
        class="btn-marcar-leidas"
      >
        <i class="pi pi-check-circle"></i>
        <span>Marcar todas como leídas</span>
      </button>
    </div>

    <!-- Filtros -->
    <div class="filtros">
      <button 
        @click="filtroActivo = 'todas'"
        :class="['btn-filtro', { 'activo': filtroActivo === 'todas' }]"
      >
        Todas ({{ notificaciones.length }})
      </button>
      <button 
        @click="filtroActivo = 'noLeidas'"
        :class="['btn-filtro', { 'activo': filtroActivo === 'noLeidas' }]"
      >
        No leídas ({{ notificacionesNoLeidas }})
      </button>
      <button 
        @click="filtroActivo = 'compras'"
        :class="['btn-filtro', { 'activo': filtroActivo === 'compras' }]"
      >
        Mis Compras
      </button>
      <button 
        @click="filtroActivo = 'ventas'"
        :class="['btn-filtro', { 'activo': filtroActivo === 'ventas' }]"
      >
        Mis Ventas
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Cargando notificaciones...</p>
    </div>

    <!-- Lista de notificaciones -->
    <div v-else-if="notificacionesFiltradas.length > 0" class="notificaciones-lista">
      <div 
        v-for="notif in notificacionesFiltradas" 
        :key="notif.id"
        :class="['notificacion-card', { 'no-leida': !notif.leida }]"
        @click="verDetalle(notif)"
      >
        <div class="notif-icono" :class="getTipoClase(notif.tipo)">
          <i :class="getTipoIcono(notif.tipo)"></i>
        </div>

        <div class="notif-contenido">
          <div class="notif-header">
            <h3>{{ notif.titulo }}</h3>
            <span class="notif-fecha">{{ formatearFecha(notif.fechaCreacion) }}</span>
          </div>
          
          <p class="notif-mensaje">{{ notif.mensaje }}</p>

          <!-- Badge de tipo -->
          <div class="notif-badges">
            <span :class="['badge', getBadgeClase(notif.tipo)]">
              {{ getTipoTexto(notif.tipo) }}
            </span>
            <span v-if="!notif.leida" class="badge badge-no-leida">
              Nueva
            </span>
          </div>
        </div>

        <div class="notif-acciones">
          <button 
            v-if="notif.tipo === 'venta_pendiente' && notif.ventaRelacionada"
            @click.stop="abrirModalResponder(notif)"
            class="btn-accion btn-responder"
          >
            <i class="pi pi-reply"></i>
            <span>Responder</span>
          </button>
          <button 
            v-if="!notif.leida"
            @click.stop="marcarLeida(notif.id)"
            class="btn-accion btn-marcar"
            title="Marcar como leída"
          >
            <i class="pi pi-check"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Sin notificaciones -->
    <div v-else class="sin-notificaciones">
      <i class="pi pi-bell"></i>
      <h3>No tienes notificaciones</h3>
      <p>Cuando recibas nuevas notificaciones aparecerán aquí</p>
    </div>

    <!-- Modal Responder Venta -->
    <div v-if="ventaResponder" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>Verificar Pago</h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
            <div v-if="ventaResponder">
                <!-- Info de la venta / producto -->
                <div class="venta-info">
                <h3><i class="pi pi-shopping-cart"></i> Información de la Venta</h3>
                <div class="info-grid">
                    <div class="info-item">
                    <span class="label">Cliente:</span>
                    <span class="value">{{ ventaResponder.usuario?.nombre }} {{ ventaResponder.usuario?.apellidos }}</span>
                    </div>
                    <div class="info-item">
                    <span class="label">Email:</span>
                    <span class="value">{{ ventaResponder.usuario?.email }}</span>
                    </div>
                    <div class="info-item total">
                    <span class="label">Total:</span>
                    <span class="value precio">Bs {{ ventaResponder.total }}</span>
                    </div>
                </div>
                </div>

                <!-- Comprobante -->
                <div v-if="ventaResponder.comprobante" class="comprobante-section">
                <h3><i class="pi pi-image"></i> Comprobante de Pago</h3>
                <div class="comprobante-container">
                    <img 
                    :src="ventaResponder.comprobante" 
                    alt="Comprobante de pago" 
                    class="comprobante-img"
                    @click="ampliarImagen(ventaResponder.comprobante)"
                    />
                    <p class="comprobante-tip">
                    <i class="pi pi-info-circle"></i>
                    Clic en la imagen para ampliar
                    </p>
                </div>
                </div>

                <!-- Mensaje para comprador si la venta ya fue respondida -->
                <div v-if="modalEsRespuesta && !modalEsVendedor" class="mensaje-respuesta">
                <p>
                    <strong>Estado del pago:</strong> 
                    <span v-if="ventaResponder.estadoPago === 'aceptado'">Pago Aceptado ✅</span>
                    <span v-else-if="ventaResponder.estadoPago === 'rechazado'">Pago Rechazado ❌</span>
                </p>
                <p v-if="ventaResponder.motivoRechazo && ventaResponder.estadoPago === 'rechazado'">
                    <strong>Motivo:</strong> {{ ventaResponder.motivoRechazo }}
                </p>
                </div>

                <!-- Opciones de aceptación/rechazo para vendedor -->
                <div v-if="modalEsVendedor">
                <div class="opciones-section">
                    <h3><i class="pi pi-check-square"></i> ¿El pago es válido?</h3>
                    <div class="opciones-respuesta">
                    <button 
                        @click="respuestaSeleccionada = 'aceptar'"
                        :class="['btn-opcion btn-aceptar', { 'seleccionado': respuestaSeleccionada === 'aceptar' }]"
                    >
                        <i class="pi pi-check-circle"></i>
                        <span>Sí, Aceptar Pago</span>
                    </button>
                    <button 
                        @click="respuestaSeleccionada = 'rechazar'"
                        :class="['btn-opcion btn-rechazar', { 'seleccionado': respuestaSeleccionada === 'rechazar' }]"
                    >
                        <i class="pi pi-times-circle"></i>
                        <span>No, Rechazar</span>
                    </button>
                    </div>
                </div>

                <!-- Motivo de rechazo -->
                <div v-if="respuestaSeleccionada === 'rechazar'" class="campo motivo-campo">
                    <label for="motivo">Motivo del rechazo *</label>
                    <textarea 
                    id="motivo"
                    v-model="motivoRechazo"
                    rows="3"
                    placeholder="Explica por qué rechazas el pago"
                    class="input"
                    ></textarea>
                </div>
                </div>
            </div>
            </div>


        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secundario">
            <i class="pi pi-times"></i>
            Cancelar
          </button>
          <button 
            @click="confirmarRespuesta"
            :disabled="loadingRespuesta || !respuestaSeleccionada || (respuestaSeleccionada === 'rechazar' && !motivoRechazo)"
            :class="['btn-primario', respuestaSeleccionada === 'aceptar' ? 'btn-success' : 'btn-danger']"
          >
            <i :class="loadingRespuesta ? 'pi pi-spin pi-spinner' : 'pi pi-send'"></i>
            <span>{{ loadingRespuesta ? 'Enviando...' : 'Confirmar Decisión' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Imagen Ampliada -->
    <div v-if="imagenAmpliada" class="modal-imagen" @click="imagenAmpliada = null">
      <img :src="imagenAmpliada" alt="Comprobante ampliado" />
      <button class="btn-cerrar-imagen">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'

const router = useRouter()

const notificaciones = ref([])
const loading = ref(false)
const filtroActivo = ref('todas')

const ventaResponder = ref(null)
const respuestaSeleccionada = ref('')
const motivoRechazo = ref('')
const loadingRespuesta = ref(false)
const imagenAmpliada = ref(null)

const modalEsVendedor = computed(() => {
  const role = 'vendedor' // cambiar según tu lógica real
  return ventaResponder.value && role === 'vendedor' && !ventaResponder.value.estadoPago
})

// Modal para comprador que ya recibió respuesta
const modalEsRespuesta = computed(() => {
  return ventaResponder.value && ventaResponder.value.estadoPago
})

// Query para obtener notificaciones
const MIS_NOTIFICACIONES = gql`
  query MisNotificaciones($soloNoLeidas: Boolean) {
    misNotificaciones(soloNoLeidas: $soloNoLeidas) {
      id
      tipo
      titulo
      mensaje
      leida
      fechaCreacion
      ventaRelacionada {
        id
        total
        comprobante
        usuario {
          id
          nombre
          apellidos
          email
        }
        detalles {
          cantidad
          precioUnitario
          tiendaProducto {
            producto {
              nombre
            }
          }
        }
      }
    }
  }
`

// Mutation para marcar como leída
const MARCAR_LEIDA = gql`
  mutation MarcarNotificacionLeida($notificacionId: ID!) {
    marcarNotificacionLeida(notificacionId: $notificacionId) {
      ok
    }
  }
`

// Mutation para responder venta
const RESPONDER_VENTA = gql`
  mutation ResponderVenta($ventaId: ID!, $aceptar: Boolean!, $motivoRechazo: String) {
    responderVenta(ventaId: $ventaId, aceptar: $aceptar, motivoRechazo: $motivoRechazo) {
      ok
      mensaje
    }
  }
`

const { refetch } = useQuery(MIS_NOTIFICACIONES, {
  soloNoLeidas: false
})

const { mutate: marcarLeidaMutation } = useMutation(MARCAR_LEIDA)
const { mutate: responderVentaMutation } = useMutation(RESPONDER_VENTA)

onMounted(async () => {
  await cargarNotificaciones()
})

const cargarNotificaciones = async () => {
  loading.value = true
  try {
    const result = await refetch()
    if (result?.data?.misNotificaciones) {
      notificaciones.value = result.data.misNotificaciones
    }
  } catch (err) {
    console.error('Error al cargar notificaciones:', err)
  } finally {
    loading.value = false
  }
}

const notificacionesNoLeidas = computed(() => {
  return notificaciones.value.filter(n => !n.leida).length
})

const notificacionesFiltradas = computed(() => {
  let filtradas = [...notificaciones.value]

  switch (filtroActivo.value) {
    case 'noLeidas':
      filtradas = filtradas.filter(n => !n.leida)
      break
    case 'compras':
      filtradas = filtradas.filter(n => 
        n.tipo === 'venta_confirmada' || n.tipo === 'venta_rechazada'
      )
      break
    case 'ventas':
      filtradas = filtradas.filter(n => n.tipo === 'venta_pendiente')
      break
  }

  return filtradas.sort((a, b) => 
    new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
  )
})

const getTipoClase = (tipo) => {
  const clases = {
    'venta_pendiente': 'tipo-pendiente',
    'venta_confirmada': 'tipo-confirmada',
    'venta_rechazada': 'tipo-rechazada',
    'nuevo_producto': 'tipo-producto'
  }
  return clases[tipo] || 'tipo-default'
}

const getTipoIcono = (tipo) => {
  const iconos = {
    'venta_pendiente': 'pi pi-clock',
    'venta_confirmada': 'pi pi-check-circle',
    'venta_rechazada': 'pi pi-times-circle',
    'nuevo_producto': 'pi pi-shopping-bag'
  }
  return iconos[tipo] || 'pi pi-bell'
}

const getTipoTexto = (tipo) => {
  const textos = {
    'venta_pendiente': 'Venta Pendiente',
    'venta_confirmada': 'Compra Confirmada',
    'venta_rechazada': 'Compra Rechazada',
    'nuevo_producto': 'Nuevo Producto'
  }
  return textos[tipo] || 'Notificación'
}

const getBadgeClase = (tipo) => {
  const clases = {
    'venta_pendiente': 'badge-pendiente',
    'venta_confirmada': 'badge-confirmada',
    'venta_rechazada': 'badge-rechazada',
    'nuevo_producto': 'badge-producto'
  }
  return clases[tipo] || 'badge-default'
}

const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  const ahora = new Date()
  const diff = ahora - date
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (minutos < 1) return 'Ahora'
  if (minutos < 60) return `Hace ${minutos} min`
  if (horas < 24) return `Hace ${horas}h`
  if (dias < 7) return `Hace ${dias}d`
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const marcarLeida = async (notifId) => {
  try {
    await marcarLeidaMutation({ notificacionId: notifId })
    
    const notif = notificaciones.value.find(n => n.id === notifId)
    if (notif) {
      notif.leida = true
    }
  } catch (err) {
    console.error('Error al marcar como leída:', err)
  }
}

const marcarTodasLeidas = async () => {
  const noLeidas = notificaciones.value.filter(n => !n.leida)
  
  for (const notif of noLeidas) {
    await marcarLeida(notif.id)
  }
}


const verDetalle = async (notif) => {
  if (!notif.leida) {
    await marcarLeida(notif.id) 
  }
  if (notif.ventaRelacionada){
    abrirModalResponder(notif)
  }
}

const abrirModalResponder = (notif) => {
  if (notif.ventaRelacionada) {
    ventaResponder.value = {
      ...notif.ventaRelacionada,
      estadoPago: notif.tipo === 'venta_confirmada' ? 'aceptado' :
                  notif.tipo === 'venta_rechazada' ? 'rechazado' : null,
      motivoRechazo: notif.motivoRechazo || ''
    }
    respuestaSeleccionada.value = ''
    motivoRechazo.value = ''
  }
}

const ampliarImagen = (url) => {
  imagenAmpliada.value = url
}

const confirmarRespuesta = async () => {
  if (!respuestaSeleccionada.value) return

  const aceptar = respuestaSeleccionada.value === 'aceptar'

  if (!aceptar && !motivoRechazo.value.trim()) {
    alert('Debes proporcionar un motivo de rechazo')
    return
  }

  loadingRespuesta.value = true

  try {
    const result = await responderVentaMutation({
      ventaId: ventaResponder.value.id,
      aceptar,
      motivoRechazo: aceptar ? null : motivoRechazo.value
    })

    if (result?.data?.responderVenta?.ok) {
      alert(result.data.responderVenta.mensaje)
      cerrarModal()
      await cargarNotificaciones()
    }
  } catch (err) {
    alert('Error al responder: ' + err.message)
  } finally {
    loadingRespuesta.value = false
  }
}

const cerrarModal = () => {
  ventaResponder.value = null
  respuestaSeleccionada.value = ''
  motivoRechazo.value = ''
}
</script>

<style scoped>
.notificaciones-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.header h1 {
  color: var(--cafe);
  margin: 0;
  flex: 1;
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

.btn-marcar-leidas {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--crema);
  color: var(--cafe);
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-marcar-leidas:hover {
  border-color: var(--naranja-opaco);
}

/* Filtros */
.filtros {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn-filtro {
  padding: 10px 20px;
  background: white;
  color: var(--gris-oscuro);
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-filtro:hover {
  border-color: var(--naranja-opaco);
}

.btn-filtro.activo {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border-color: var(--cafe);
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
  display: block;
}

/* Lista de notificaciones */
.notificaciones-lista {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notificacion-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notificacion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(111, 72, 39, 0.2);
  border-color: var(--naranja-opaco);
}

.notificacion-card.no-leida {
  background: linear-gradient(to right, #fff9f0, white);
  border-left: 4px solid var(--naranja-opaco);
}

.notif-icono {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tipo-pendiente {
  background: #fff3cd;
  color: #856404;
}

.tipo-confirmada {
  background: #d4edda;
  color: #155724;
}

.tipo-rechazada {
  background: #f8d7da;
  color: #721c24;
}

.tipo-producto {
  background: #d1ecf1;
  color: #0c5460;
}

.notif-contenido {
  flex: 1;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.notif-header h3 {
  color: var(--cafe);
  margin: 0;
  font-size: 1.1rem;
}

.notif-fecha {
  color: var(--gris-claro);
  font-size: 0.85rem;
}

.notif-mensaje {
  color: var(--gris-oscuro);
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.notif-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-pendiente {
  background: #fff3cd;
  color: #856404;
}

.badge-confirmada {
  background: #d4edda;
  color: #155724;
}

.badge-rechazada {
  background: #f8d7da;
  color: #721c24;
}

.badge-producto {
  background: #d1ecf1;
  color: #0c5460;
}

.badge-no-leida {
  background: var(--naranja-opaco);
  color: white;
}

.notif-acciones {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-accion {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-responder {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
}

.btn-responder:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(111, 72, 39, 0.4);
}

.btn-marcar {
  background: var(--crema);
  color: var(--cafe);
}

.btn-marcar:hover {
  background: var(--cafe-claro);
  color: white;
}

/* Sin notificaciones */
.sin-notificaciones {
  text-align: center;
  padding: 80px 20px;
  color: var(--gris-claro);
}

.sin-notificaciones i {
  font-size: 5rem;
  color: var(--cafe-claro);
  margin-bottom: 20px;
  display: block;
}

.sin-notificaciones h3 {
  color: var(--cafe);
  margin: 0 0 10px 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-contenido {
  background: white;
  border-radius: 20px;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid var(--crema);
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  border-radius: 20px 20px 0 0;
}

.modal-header h2 {
  color: white;
  margin: 0;
}

.btn-cerrar {
  background: rgba(255,255,255,0.2);
  border: none;
  font-size: 1.3rem;
  color: white;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-cerrar:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 25px;
}

.venta-info, .comprobante-section, .opciones-section {
  margin-bottom: 25px;
}

.venta-info h3, .comprobante-section h3, .opciones-section h3 {
  color: var(--cafe);
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
}

.venta-info h3 i, .comprobante-section h3 i, .opciones-section h3 i {
  color: var(--naranja-opaco);
}

.info-grid {
  background: var(--crema);
  padding: 15px;
  border-radius: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--cafe-claro);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: var(--gris-claro);
  font-weight: 500;
}

.info-item .value {
  color: var(--cafe);
  font-weight: 600;
}

.info-item.total .value.precio {
  font-size: 1.3rem;
  color: var(--naranja-opaco);
}

.comprobante-container {
  text-align: center;
}

.comprobante-img {
  max-width: 100%;
  max-height: 350px;
  border-radius: 10px;
  border: 2px solid var(--cafe-claro);
  cursor: zoom-in;
  transition: all 0.3s ease;
}

.comprobante-img:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.comprobante-tip {
  color: var(--gris-claro);
  font-size: 0.85rem;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.sin-comprobante {
  text-align: center;
  padding: 30px;
  background: #fff3cd;
  border-radius: 10px;
  color: #856404;
}

.sin-comprobante i {
  font-size: 2.5rem;
  margin-bottom: 10px;
  display: block;
}

.opciones-respuesta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.btn-opcion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-opcion:hover {
  border-color: var(--naranja-opaco);
}

.btn-opcion.seleccionado {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border-color: var(--cafe);
}

.btn-opcion i {
  font-size: 2rem;
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
  font-family: inherit;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--naranja-opaco);
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
    align-items: stretch;
  }
  
  .notificacion-card {
    flex-direction: column;
  }
  
  .notif-header {
    flex-direction: column;
    gap: 5px;
  }
  
  .opciones-respuesta {
    grid-template-columns: 1fr;
  }
}
</style>