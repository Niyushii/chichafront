<template>
  <nav class="navbar">
    <!-- Sección Superior: Buscador y Perfil -->
    <div class="navbar-top">
      <div class="navbar-container">
        <!-- Logo/Nombre -->
        <router-link to="/" class="navbar-logo">
          <img src="../assets/img/logo.png" alt="Chichawasi" class="logo-img">
        </router-link>

        <!-- Buscador -->
        <div class="search-container">
          <i class="pi pi-search search-icon"></i>
          <input 
            v-model="searchQuery"
            @keyup.enter="realizarBusqueda"
            type="text"
            placeholder="Buscar productos, tiendas..."
            class="search-input"
          />
        </div>

        <!-- Perfil y Accesos -->
        <div class="user-section">
          <template v-if="isAuthenticated">
            <!-- Accesos Rápidos -->
            <div class="quick-actions">
              <!-- Favoritos -->
              <router-link to="/favoritos" class="action-btn" title="Mis Favoritos">
                <i class="pi pi-heart"></i>
                <span class="action-label">Favoritos</span>
              </router-link>

              <!-- Mis Tiendas -->
              <router-link to="/tiendas" class="action-btn" title="Mis Tiendas">
                <i class="pi pi-shop"></i>
                <span class="action-label">Tiendas</span>
              </router-link>

              <!-- Notificaciones -->
              <router-link to="/notificaciones" class="action-btn notif-btn" title="Notificaciones">
                <i class="pi pi-bell"></i>
                <span v-if="notificacionesNoLeidas > 0" class="badge-notificaciones">
                  {{ notificacionesNoLeidas }}
                </span>
                <span class="action-label">Notificaciones</span>
              </router-link>
            </div>

            <!-- Perfil del Usuario -->
            <router-link to="/perfil" class="user-info">
              <img 
                :src="userPhoto" 
                alt="Perfil"
                class="user-photo"
              />
              <div class="user-details">
                <span class="greeting">Hola,</span>
                <span class="username">{{ userName }}</span>
              </div>
              <i class="pi pi-angle-down arrow-icon"></i>
            </router-link>
          </template>

          <template v-else>
            <router-link to="/login" class="btn-login">
              <i class="pi pi-sign-in"></i>
              <span>Iniciar Sesión</span>
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <!-- Sección Inferior: Categorías y Enlaces -->
    <div class="navbar-bottom">
      <div class="navbar-container">
        <!-- Categorías -->
        <div class="categories-section">
          <router-link 
            v-for="categoria in categorias" 
            :key="categoria.id"
            :to="`/categorias/${categoria.id}`"
            class="category-link"
          >
            <span>{{ categoria.icono }}</span>
            <span>{{ categoria.nombre }}</span>
          </router-link>
        </div>

        <!-- Enlaces Adicionales -->
        <div class="extra-links">
          <router-link to="/about" class="extra-link">
            <i class="pi pi-info-circle"></i>
            <span>Sobre Nosotros</span>
          </router-link>
          <router-link to="/como-funciona" class="extra-link">
            <i class="pi pi-question-circle"></i>
            <span>¿Cómo Funciona?</span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import categoriasService from '../services/categoriasService'
import { gql } from '@apollo/client/core'
import { useQuery } from '@vue/apollo-composable'

const router = useRouter()

// Estado
const searchQuery = ref('')
const categorias = ref([])

// Datos del usuario
const userData = computed(() => authService.getUserData())
const isAuthenticated = computed(() => authService.isAuthenticated())
const userName = computed(() => userData.value ? userData.value.nombre : '')
const userPhoto = computed(() => {
  return userData.value?.fotoPerfil || '/src/assets/img/fotoPerfil.png'
})

const notificacionesNoLeidas = ref(0)

// Query para notificaciones no leídas
const CONTAR_NO_LEIDAS = gql`
  query ContarNoLeidas {
    misNotificaciones(soloNoLeidas: true) {
      id
    }
  }
`

// Solo ejecutar si está autenticado
if (isAuthenticated.value) {
  const { result } = useQuery(CONTAR_NO_LEIDAS, {}, {
    pollInterval: 30000 // Actualizar cada 30 segundos
  })

  watch(result, (newResult) => {
    if (newResult?.misNotificaciones) {
      notificacionesNoLeidas.value = newResult.misNotificaciones.length
    }
  })
}

// Cargar categorías principales
onMounted(async () => {
  try {
    const result = await categoriasService.obtenerTodasCategorias(true, true)
    categorias.value = result
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
})

// Función de búsqueda
const realizarBusqueda = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/busqueda',
      query: { q: searchQuery.value }
    })
  }
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Sección Superior */
.navbar-top {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  padding: 15px 0;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 30px;
}

/* Logo */
.navbar-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-img {
  height: 50px;
  width: auto;
}

/* Buscador */
.search-container {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gris-claro);
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

/* Sección de Usuario */
.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
}

/* Acciones Rápidas */
.quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 70px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.action-btn i {
  font-size: 1.4rem;
}

.action-label {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Botón de Notificaciones Especial */
.notif-btn {
  position: relative;
}

.badge-notificaciones {
  position: absolute;
  top: 4px;
  right: 8px;
  background: #ff4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Perfil del Usuario */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  border: 2px solid transparent;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.user-photo {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-details {
  display: flex;
  flex-direction: column;
  color: white;
}

.greeting {
  font-size: 0.85rem;
  opacity: 0.9;
}

.username {
  font-weight: 600;
  font-size: 1rem;
}

.arrow-icon {
  color: white;
  font-size: 1rem;
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.user-info:hover .arrow-icon {
  transform: translateY(2px);
}

/* Botón de login */
.btn-login {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  color: var(--cafe);
  text-decoration: none;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Sección Inferior */
.navbar-bottom {
  background: white;
  border-bottom: 1px solid var(--crema);
  padding: 15px 0;
}

.navbar-bottom .navbar-container {
  justify-content: space-between;
}

/* Categorías */
.categories-section {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.category-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: var(--cafe);
  text-decoration: none;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.category-link:hover {
  background: var(--crema);
  transform: translateY(-2px);
}

.category-link span:first-child {
  font-size: 1.3rem;
}

/* Enlaces Adicionales */
.extra-links {
  display: flex;
  gap: 15px;
}

.extra-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: var(--gris-oscuro);
  text-decoration: none;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.extra-link:hover {
  background: var(--crema);
  color: var(--cafe);
}

.extra-link i {
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar-container {
    flex-wrap: wrap;
  }

  .search-container {
    order: 3;
    width: 100%;
    max-width: 100%;
    margin-top: 15px;
  }

  .action-label {
    display: none;
  }

  .action-btn {
    min-width: 50px;
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .navbar-top {
    padding: 10px 0;
  }

  .logo-img {
    height: 40px;
  }

  .user-details {
    display: none;
  }

  .arrow-icon {
    display: none;
  }

  .quick-actions {
    gap: 5px;
  }

  .action-btn {
    padding: 8px;
    min-width: 45px;
  }

  .action-btn i {
    font-size: 1.2rem;
  }

  .categories-section {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
    width: 100%;
  }

  .category-link {
    justify-content: center;
  }

  .extra-links {
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }

  .navbar-bottom .navbar-container {
    flex-direction: column;
  }
}
</style>