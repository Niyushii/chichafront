<template>
  <div class="registro-container">
    <!-- Botón volver -->
    <button class="boton-volver" @click="router.push('/login')">
      <i class="pi pi-arrow-left"></i>
      <span>Volver al login</span>
    </button>

    <div class="registro-card">
      <div class="card-content">
        <h2 class="titulo-registro">Crear Nueva Cuenta</h2>
        <p class="subtitulo-registro">Completa el formulario para registrarte</p>

        <div v-if="error" class="mensaje mensaje-error">
          <i class="pi pi-times-circle"></i>
          <span>{{ error }}</span>
        </div>

        <div v-if="success" class="mensaje mensaje-success">
          <i class="pi pi-check-circle"></i>
          <span>{{ success }}</span>
        </div>

        <div @submit.prevent="handleRegistro">
          <div class="field">
            <label for="email" class="label-custom">Correo electrónico *</label>
            <input 
              id="email"
              v-model="formData.email" 
              type="email" 
              required
              placeholder="ejemplo@correo.com"
              class="input-custom"
            />
          </div>

          <div class="field">
            <label for="username" class="label-custom">Nombre de usuario *</label>
            <input 
              id="username"
              v-model="formData.username" 
              type="text" 
              required
              placeholder="Tu nombre de usuario"
              class="input-custom"
            />
          </div>

          <div class="field">
            <label for="password" class="label-custom">Contraseña * (mínimo 8 caracteres)</label>
            <input 
              id="password"
              v-model="formData.password" 
              type="password" 
              required
              minlength="8"
              placeholder="Mínimo 8 caracteres"
              class="input-custom"
            />
          </div>

          <div class="field">
            <label for="nombre" class="label-custom">Nombre *</label>
            <input 
              id="nombre"
              v-model="formData.nombre" 
              type="text" 
              required
              placeholder="Tu nombre"
              class="input-custom"
            />
          </div>

          <div class="field">
            <label for="apellidos" class="label-custom">Apellidos *</label>
            <input 
              id="apellidos"
              v-model="formData.apellidos" 
              type="text" 
              required
              placeholder="Tus apellidos"
              class="input-custom"
            />
          </div>

          <div class="field">
            <label for="celular" class="label-custom">Celular (opcional)</label>
            <input 
              id="celular"
              v-model="formData.celular" 
              type="tel" 
              placeholder="Tu número de celular"
              class="input-custom"
            />
          </div>

          <button 
            @click="handleRegistro"
            class="boton-registrar"
            :disabled="loading"
          >
            <i class="pi pi-user-plus"></i>
            <span>{{ loading ? 'Registrando...' : 'Registrarse' }}</span>
          </button>
        </div>

        <div class="link-container">
          <router-link to="/login" class="link-login">
            ¿Ya tienes cuenta? Inicia sesión aquí
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

const router = useRouter()

const formData = ref({
  email: '',
  username: '',
  password: '',
  nombre: '',
  apellidos: '',
  celular: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegistro = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  const userData = {
    email: formData.value.email,
    username: formData.value.username,
    password: formData.value.password,
    nombre: formData.value.nombre,
    apellidos: formData.value.apellidos
  }

  if (formData.value.celular.trim() !== '') {
    userData.celular = formData.value.celular
  }

  const result = await authService.registrarUsuario(userData)

  loading.value = false

  if (result.success) {
    success.value = result.data.mensaje
    
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.registro-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/img/LoginFondo1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  padding: 40px 20px;
}

.registro-container::before {
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

.registro-card {
  width: 100%;
  max-width: 500px;
  z-index: 2;
  box-shadow: 0 8px 32px rgba(61, 57, 54, 0.15);
  border-radius: 20px;
  border: 2px solid var(--cafe-claro);
  background-color: var(--crema);
  overflow: hidden;
}

.card-content {
  padding: 40px 35px;
}

.titulo-registro {
  text-align: center;
  margin: 0 0 8px;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cafe);
}

.subtitulo-registro {
  text-align: center;
  margin: 0 0 30px;
  font-size: 0.95rem;
  color: var(--gris-oscuro);
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
  margin-bottom: 18px;
}

.label-custom {
  color: var(--cafe);
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  font-size: 0.9rem;
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

.boton-registrar {
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
  margin-top: 10px;
}

.boton-registrar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

.boton-registrar:active:not(:disabled) {
  transform: translateY(0);
}

.boton-registrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-container {
  text-align: center;
  margin-top: 25px;
}

.link-login {
  color: var(--cafe);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.link-login:hover {
  color: var(--naranja-opaco);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .registro-container {
    padding: 30px 15px;
  }

  .registro-card {
    max-width: 100%;
  }
  
  .card-content {
    padding: 30px 25px;
  }

  .titulo-registro {
    font-size: 1.5rem;
  }

  .subtitulo-registro {
    font-size: 0.9rem;
  }

  .boton-volver {
    top: 15px;
    left: 15px;
    padding: 8px 15px;
    font-size: 0.85rem;
  }
}
</style>