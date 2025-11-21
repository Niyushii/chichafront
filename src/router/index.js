// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../services/authService'

// Importar las páginas
import LoginPage from '../pages/Login.vue'
import RegistroPage from '../pages/RegistroPage.vue'
import HomeView from '../pages/HomeView.vue'
import ModeradorView from '../pages/ModeradorView.vue'
import SuperAdminView from '../pages/SuperAdminView.vue'
import PerfilUsuario from '../pages/PerfilUsuario.vue'
import TiendasView from '../pages/TiendasView.vue'
import PerfilTiendaPrivada from '../pages/PerfilTiendaPrivada.vue'
import PerfilTiendaPublica from '../pages/PerfilTiendaPublica.vue'
import CrearProducto from '../components/CrearProducto.vue'
import EditarProducto from '../components/EditarProducto.vue'
import AboutView from '../pages/AboutView.vue'
import ComoFuncionaView from '../pages/ComoFuncionaView.vue'
import CategoriasView from '../pages/CategoriasView.vue'

const routes = [
  // Login y Registro (sin autenticación)
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/registro',
    name: 'Registro',
    component: RegistroPage,
    meta: { requiresAuth: false }
  },
  
  // Páginas públicas
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: { requiresAuth: false }
  },
  {
    path: '/como-funciona',
    name: 'ComoFunciona',
    component: ComoFuncionaView,
    meta: { requiresAuth: false }
  },
  
  // Home - Página principal para usuarios normales
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true, allowedRoles: ['usuario'] }
  },
  
  // Dashboard SuperAdmin
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: SuperAdminView,
    meta: { requiresAuth: true, allowedRoles: ['superadmin'] }
  },
  
  // Dashboard Moderador
  {
    path: '/moderador/dashboard',
    name: 'ModeradorDashboard',
    component: ModeradorView,
    meta: { requiresAuth: true, allowedRoles: ['moderador'] }
  },

  // Perfil de usuario
  {
    path: '/perfil',
    name: 'PerfilUsuario',
    component: PerfilUsuario,
    meta: { requiresAuth: true, allowedRoles: ['usuario'] }
  },

  // Lista de tiendas
  {
    path: '/tiendas',
    name: 'Tiendas',
    component: TiendasView,
    meta: { requiresAuth: true, allowedRoles: ['usuario'] }
  },

  // Perfil de tienda privada
  {
    path: '/tienda/:id',
    name: 'TiendaPerfilPrivada',
    component: PerfilTiendaPrivada,
    meta: { requiresAuth: true, allowedRoles: ['usuario'] }
  },

  // Perfil de tienda pública
  {
    path: '/tienda-publica/:id',
    name: 'TiendaPerfilPublica',
    component: PerfilTiendaPublica,
    meta: { requiresAuth: false }
  },

  // Crear producto
  {
    path: '/tienda/:id/producto/crear',
    name: 'CrearProducto',
    component: CrearProducto,
    meta: { requiresAuth: true, allowedRoles: ['usuario'] }
  },

  // Editar producto
  {
    path: '/tienda/:id/producto/:productoId/editar',
    name: 'EditarProducto',
    component: EditarProducto,
    meta: { requiresAuth: true, allowedRoles: ['usuario'] }
  },

  //Categorias
  {
    path: '/categorias/:categoriaId',
    name: 'Categorias',
    component: CategoriasView,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const userType = authService.getUserType()

  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next('/login')
      return
    }

    // Verificar roles permitidos
    if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userType)) {
      // Redirigir a su dashboard correspondiente
      if (userType === 'superadmin') {
        next('/admin/dashboard')
      } else if (userType === 'moderador') {
        next('/moderador/dashboard')
      } else {
        next('/')
      }
      return
    }
  }

  // Si está autenticado e intenta ir al login o registro, redirigir a su página correspondiente
  if ((to.path === '/login' || to.path === '/registro') && isAuthenticated) {
    if (userType === 'superadmin') {
      next('/admin/dashboard')
    } else if (userType === 'moderador') {
      next('/moderador/dashboard')
    } else {
      next('/')
    }
    return
  }

  next()
})

export default router