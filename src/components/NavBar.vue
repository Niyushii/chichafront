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
            <div class="user-info">
              <img 
                :src="userPhoto" 
                alt="Perfil"
                class="user-photo"
              />
              <div class="user-details">
                <span class="greeting">Hola,</span>
                <span class="username">{{ userName }}</span>
              </div>
            </div>

            <!-- Menú desplegable -->
            <div class="user-menu">
              <router-link to="/tiendas" class="menu-item">
                <i class="pi pi-shop"></i>
                <span>Mis Tiendas</span>
              </router-link>
              <router-link to="/favoritos" class="menu-item">
                <i class="pi pi-heart"></i>
                <span>Favoritos</span>
              </router-link>
              <router-link to="/perfil" class="menu-item">
                <i class="pi pi-user"></i>
                <span>Mi Perfil</span>
              </router-link>
            </div>
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
            :to="`/categoria/${categoria.id}`"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import categoriasService from '../services/categoriasService'

const router = useRouter()

// Estado
const searchQuery = ref('')
const categorias = ref([])

// Datos del usuario
const userData = computed(() => authService.getUserData())
const isAuthenticated = computed(() => authService.isAuthenticated())
const userName = computed(() => userData.value ? userData.value.nombre : '')
const userPhoto = computed(() => {
  // Ruta a la imagen por defecto
  return userData.value?.fotoPerfil || '/src/assets/img/fotoPerfil.png'
})

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
  gap: 15px;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.3);
}

.user-info:hover + .user-menu {
  display: flex;
}

.user-photo {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
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

/* Menú desplegable */
.user-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-direction: column;
  min-width: 200px;
  overflow: hidden;
}

.user-menu:hover {
  display: flex;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  color: var(--cafe);
  text-decoration: none;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: var(--crema);
}

.menu-item i {
  font-size: 1.2rem;
  color: var(--naranja-opaco);
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