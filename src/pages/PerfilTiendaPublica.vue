<!-- src/pages/PerfilTiendaPublica.vue -->
<template>
  <div class="perfil-publico-container">
    <!-- Header -->
    <div class="header">
      <button @click="router.push('/')" class="btn-volver">
        <i class="pi pi-arrow-left"></i>
        <span>Volver</span>
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
          <p class="propietario">
            <i class="pi pi-user"></i>
            {{ tienda.propietario.nombre }} {{ tienda.propietario.apellidos }}
          </p>
        </div>
      </div>

      <!-- Información de la tienda -->
      <div class="tienda-detalles">
        <div class="seccion">
          <h2><i class="pi pi-info-circle"></i> Información de Contacto</h2>
          <div class="info-grid">
            <div v-if="tienda.descripcion" class="info-item">
              <i class="pi pi-align-left"></i>
              <div>
                <strong>Descripción</strong>
                <p>{{ tienda.descripcion }}</p>
              </div>
            </div>
            
            <!-- WhatsApp Button -->
            <div v-if="tienda.telefono" class="info-item whatsapp-item">
              <i class="pi pi-whatsapp whatsapp-icon"></i>
              <div>
                <strong>WhatsApp</strong>
                <a 
                  :href="getWhatsAppLink(tienda.telefono)" 
                  target="_blank"
                  class="whatsapp-link"
                >
                  <i class="pi pi-whatsapp"></i>
                  {{ formatearTelefono(tienda.telefono) }}
                  <span class="whatsapp-badge">Contactar</span>
                </a>
              </div>
            </div>
            
            <div v-if="tienda.direccion" class="info-item">
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
            <p class="qr-text">Escanea para guardar el contacto</p>
          </div>
        </div>

        <!-- Sección de productos -->
        <div class="seccion">
          <div class="productos-header">
            <h2><i class="pi pi-shopping-bag"></i> Productos Disponibles</h2>
            <span v-if="productos.length > 0" class="productos-count">
              {{ productos.length }} {{ productos.length === 1 ? 'producto' : 'productos' }}
            </span>
          </div>

          <!-- Loading productos -->
          <div v-if="loadingProductos" class="productos-loading">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Cargando productos...</p>
          </div>

          <!-- Grid de productos -->
          <div v-else-if="productos.length > 0" class="productos-grid">
            <TarjetaProductoPublica 
              v-for="producto in productos" 
              :key="producto.id"
              :producto="producto"
              :tienda="tienda"
            />
          </div>

          <!-- Sin productos -->
          <div v-else class="productos-empty">
            <i class="pi pi-shopping-bag"></i>
            <p>Esta tienda aún no tiene productos disponibles</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <h2>Error al cargar la tienda</h2>
      <p>{{ error }}</p>
      <button @click="router.push('/')" class="btn-volver-error">
        Volver al inicio
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { tiendasService } from '../services/tiendasService'
import { productosService } from '../services/productosService'
import TarjetaProductoPublica from '../components/TarjetaProductoPublica.vue'

const router = useRouter()
const route = useRoute()

const tienda = ref(null)
const productos = ref([])
const loading = ref(false)
const loadingProductos = ref(false)
const error = ref('')

onMounted(() => {
  cargarTienda()
  cargarProductos()
})

const cargarTienda = async () => {
  loading.value = true
  const tiendaId = route.params.id
  
  const result = await tiendasService.obtenerTiendaPublica(tiendaId)
  loading.value = false

  if (result.success) {
    tienda.value = result.data
  } else {
    error.value = result.error
  }
}

const cargarProductos = async () => {
  loadingProductos.value = true
  const tiendaId = route.params.id
  
  try {
    const productosData = await productosService.obtenerProductosTienda(tiendaId)
    // Filtrar solo productos disponibles para el público
    productos.value = productosData.filter(p => 
      !p.fecha_eliminacion
    )
  } catch (err) {
    console.error('Error al cargar productos:', err)
  } finally {
    loadingProductos.value = false
  }
}

const getWhatsAppLink = (telefono) => {
  // Limpiar el número (quitar espacios, guiones, paréntesis)
  const numeroLimpio = telefono.replace(/[^\d+]/g, '')
  
  // Mensaje predeterminado
  const mensaje = encodeURIComponent(
    `Hola! Vi tus productos en ${tienda.value?.nombre || 'tu tienda'} y me gustaría más información.`
  )
  
  return `https://wa.me/${numeroLimpio}?text=${mensaje}`
}

const formatearTelefono = (telefono) => {
  // Formatear el número para mostrarlo bonito
  // Ej: +591 12345678 -> +591 1234 5678
  return telefono.replace(/(\+\d{1,3})(\d{4})(\d{4})/, '$1 $2 $3')
}
</script>

<style scoped>
.perfil-publico-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--crema) 0%, white 100%);
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
  box-shadow: 0 8px 24px rgba(111, 72, 39, 0.3);
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
}

.tienda-info-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
}

.propietario {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.1rem;
  opacity: 0.95;
  margin: 0;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.seccion h2 {
  color: var(--cafe);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  padding: 15px;
  background: var(--crema);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(111, 72, 39, 0.1);
}

.info-item i {
  font-size: 1.8rem;
  color: var(--naranja-opaco);
  margin-top: 5px;
}

.info-item strong {
  display: block;
  color: var(--cafe);
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.info-item p {
  margin: 0;
  color: var(--gris-oscuro);
  line-height: 1.6;
}

/* WhatsApp Styles */
.whatsapp-item {
  background: linear-gradient(135deg, #dcf8c6, #e8f5e9);
  border: 2px solid #25D366;
}

.whatsapp-icon {
  color: #25D366 !important;
}

.whatsapp-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #25D366;
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 10px 15px;
  background: white;
  border-radius: 10px;
  margin-top: 8px;
}

.whatsapp-link:hover {
  background: #25D366;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.whatsapp-link i {
  font-size: 1.5rem;
}

.whatsapp-badge {
  background: #25D366;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-left: auto;
}

.whatsapp-link:hover .whatsapp-badge {
  background: white;
  color: #25D366;
}

.qr-container {
  text-align: center;
}

.qr-image {
  max-width: 300px;
  border: 5px solid var(--cafe-claro);
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-text {
  margin-top: 15px;
  color: var(--gris-claro);
  font-style: italic;
}

.productos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.productos-header h2 {
  margin: 0;
}

.productos-count {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.productos-loading {
  text-align: center;
  padding: 40px;
  color: var(--gris-claro);
}

.productos-loading i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.productos-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--gris-claro);
}

.productos-empty i {
  font-size: 4rem;
  margin-bottom: 15px;
  color: var(--cafe-claro);
}

.error-container h2 {
  color: var(--cafe);
  margin: 10px 0;
}

.btn-volver-error {
  margin-top: 20px;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-volver-error:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

@media (max-width: 768px) {
  .tienda-banner {
    padding: 30px 20px;
  }
  
  .tienda-info-header h1 {
    font-size: 2rem;
  }
  
  .productos-grid {
    grid-template-columns: 1fr;
  }
  
  .productos-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>