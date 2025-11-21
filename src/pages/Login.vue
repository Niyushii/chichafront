<template>
  <div class="login-container">
    <!-- Botón volver -->
    <button class="boton-volver" @click="router.push('/')">
      <i class="pi pi-arrow-left"></i>
      <span>Volver al inicio</span>
    </button>

    <div class="login-card">
      <div class="card-header">
        <img src="../assets/img/logo.png" alt="" class="icono-usuario" width="170px">
        <h2>Bienvenido a Chichawasi</h2>
        <p>Inicia sesión para continuar</p>
      </div>
      
      <div class="card-content">
        <div v-if="error" class="mensaje mensaje-error">
          <i class="pi pi-times-circle"></i>
          <span>{{ error }}</span>
        </div>
        <div v-if="success" class="mensaje mensaje-success">
          <i class="pi pi-check-circle"></i>
          <span>{{ success }}</span>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="field">
            <label for="email" class="label-custom">Correo electrónico</label>
            <input 
              id="email"
              v-model="email" 
              type="email"
              placeholder="tu@correo.com"
              required
              class="input-custom"
              :class="{ 'input-error': error }"
            />
          </div>

          <div class="field">
            <label for="password" class="label-custom">Contraseña</label>
            <div class="password-container">
              <input 
                id="password"
                v-model="password"
                :type="mostrarPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="input-custom"
              />
              <button 
                type="button"
                class="toggle-password"
                @click="mostrarPassword = !mostrarPassword"
              >
                <i :class="mostrarPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="field-checkbox">
            <input 
              type="checkbox"
              v-model="recordarSesion" 
              id="recordar"
              class="checkbox-custom"
            />
            <label for="recordar" class="label-recordar">
              Mantener sesión iniciada
            </label>
          </div>

          <button 
            type="submit" 
            class="boton-entrar"
            :disabled="loading"
          >
            <i class="pi pi-sign-in"></i>
            <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
          </button>
        </form>

        <div class="link-container">
          <router-link to="/registro" class="link-registro">
            ¿No tienes cuenta? Regístrate aquí
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

const router = useRouter()
const email = ref('')
const password = ref('')
const recordarSesion = ref(false)
const mostrarPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

// Redirigir automáticamente si ya hay token guardado
onMounted(() => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    router.push('/') // O al dashboard según tu lógica
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await authService.login(email.value, password.value)
    loading.value = false

    // Detecta loginData según la estructura real de la respuesta
    const loginData = result?.data?.login || result?.login

    if (loginData) {
      success.value = loginData.mensaje

      // Guardar token según checkbox
      if (recordarSesion.value) {
        localStorage.setItem('token', loginData.token)
        sessionStorage.removeItem('token')
      } else {
        sessionStorage.setItem('token', loginData.token)
        localStorage.removeItem('token')
      }

      // Esperar a que Vue procese cambios
      await nextTick()

      // Redirigir según tipo de usuario
      const userType = loginData.userType
      if (userType === 'superadmin') {
        router.push('/admin/dashboard')
      } else if (userType === 'moderador') {
        router.push('/moderador/dashboard')
      } else {
        router.push('/') // Redirige al home
      }
    } else {
      error.value = 'Error en la respuesta del servidor'
      console.error('Respuesta inesperada:', result)
    }
  } catch (err) {
    loading.value = false
    error.value = 'Error al iniciar sesión: ' + (err.message || err)
    console.error(err)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/img/LoginFondo1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.boton-volver {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
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
  font-size: 0.95rem;
}

.boton-volver:hover {
  background-color: var(--cafe);
  color: var(--crema);
}

.login-card {
  width: 100%;
  max-width: 450px;
  z-index: 2;
  box-shadow: 0 8px 32px rgba(61, 57, 54, 0.15);
  border-radius: 20px;
  border: 2px solid var(--cafe-claro);
  background-color: var(--crema);
  overflow: hidden;
}

.card-header {
  text-align: center;
  padding: 40px 20px 30px;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
}

.icono-usuario {
  font-size: 3.5rem;
  margin-bottom: 15px;
  padding: 20px;
  display: inline-block;
}

.card-header h2 {
  margin: 10px 0 5px;
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
}

.card-header p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.95;
  color: var(--crema);
}

.card-content {
  padding: 30px;
}

.mensaje {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.mensaje i {
  font-size: 1.2rem;
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

.field {
  margin-bottom: 20px;
}

.label-custom {
  color: var(--cafe);
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  font-size: 0.95rem;
}

.input-custom {
  width: 100%;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: white;
  color: var(--gris-oscuro);
  font-family: inherit;
}

.input-custom:focus {
  outline: none;
  border-color: var(--naranja-opaco);
  box-shadow: 0 0 0 3px rgba(178, 113, 57, 0.1);
}

.input-error {
  border-color: #c33;
}

.password-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gris-claro);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: var(--cafe);
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--naranja-opaco);
}

.label-recordar {
  color: var(--gris-oscuro);
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
}

.boton-entrar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  border: none;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(111, 72, 39, 0.3);
}

.boton-entrar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

.boton-entrar:active:not(:disabled) {
  transform: translateY(0);
}

.boton-entrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-container {
  text-align: center;
  margin-top: 25px;
}

.link-registro {
  color: var(--cafe);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.link-registro:hover {
  color: var(--naranja-opaco);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-card {
    max-width: 100%;
  }
  
  .card-header {
    padding: 30px 20px 20px;
  }
  
  .card-header h2 {
    font-size: 1.5rem;
  }
  
  .icono-usuario {
    font-size: 3rem;
    padding: 15px;
  }
  
  .card-content {
    padding: 20px;
  }
}
</style>