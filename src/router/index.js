// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../services/authService'

// Importar las páginas
import LoginPage from '../pages/Login.vue'
import RegistroPage from '../pages/RegistroPage.vue'
import HomeView from '../pages/HomeView.vue'
import ModeradorView from '../pages/ModeradorView.vue'
import SuperAdminView from '../pages/SuperAdminView.vue'
import TiendasView from '../pages/TiendasView.vue'  // ✅ Lista de tiendas
import PerfilTiendaPrivada from '../pages/PerfilTiendaPrivada.vue'
import CrearProducto from '../components/CrearProducto.vue'

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


  {
    path: '/tiendas',
    name: 'Tiendas',
    component: TiendasView,
    meta: { requiresAuth: true, allowedRoles: ['usuario'] }
  },

  {
    path: '/tienda/:id',
    name: 'TiendaPerfilPrivada',
    component: PerfilTiendaPrivada,
    meta: { requiresAuth: true, allowedRoles: ['usuario'] }
  },

  {
    path: '/tienda/:id/producto/crear',
    name: 'CrearProducto',
    component: CrearProducto,
    meta: { requiresAuth: true, allowedRoles: ['usuario'] }
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