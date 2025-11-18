<template>
  <div>
    <h1>Registro de Usuario</h1>
    
    <!-- Mensajes de error o éxito -->
    <div v-if="error" style="color: red; margin-bottom: 20px; padding: 10px; border: 1px solid red;">
      {{ error }}
    </div>

    <div v-if="success" style="color: green; margin-bottom: 20px; padding: 10px; border: 1px solid green;">
      {{ success }}
    </div>

    <!-- Formulario de registro -->
    <form @submit.prevent="handleRegistro">
      <div style="margin-bottom: 15px;">
        <label for="email">Correo electrónico: *</label>
        <input 
          id="email"
          v-model="formData.email" 
          type="email" 
          required
          placeholder="ejemplo@correo.com"
          style="display: block; width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label for="username">Nombre de usuario: *</label>
        <input 
          id="username"
          v-model="formData.username" 
          type="text" 
          required
          placeholder="Tu nombre de usuario"
          style="display: block; width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label for="password">Contraseña: * (mínimo 8 caracteres)</label>
        <input 
          id="password"
          v-model="formData.password" 
          type="password" 
          required
          minlength="8"
          placeholder="Mínimo 8 caracteres"
          style="display: block; width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label for="nombre">Nombre: *</label>
        <input 
          id="nombre"
          v-model="formData.nombre" 
          type="text" 
          required
          placeholder="Tu nombre"
          style="display: block; width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label for="apellidos">Apellidos: *</label>
        <input 
          id="apellidos"
          v-model="formData.apellidos" 
          type="text" 
          required
          placeholder="Tus apellidos"
          style="display: block; width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
        />
      </div>

      <div style="margin-bottom: 20px;">
        <label for="celular">Celular: (opcional)</label>
        <input 
          id="celular"
          v-model="formData.celular" 
          type="tel" 
          placeholder="Tu número de celular"
          style="display: block; width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;"
        />
      </div>

      <button 
        type="submit" 
        :disabled="loading"
        style="padding: 12px 30px; cursor: pointer; font-size: 16px;"
      >
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </button>
    </form>

    <div style="margin-top: 20px;">
      <p>¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>
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

  // Preparar datos (solo enviar celular si tiene valor)
  const userData = {
    email: formData.value.email,
    username: formData.value.username,
    password: formData.value.password,
    nombre: formData.value.nombre,
    apellidos: formData.value.apellidos
  }

  // Solo agregar celular si no está vacío
  if (formData.value.celular.trim() !== '') {
    userData.celular = formData.value.celular
  }

  const result = await authService.registrarUsuario(userData)

  loading.value = false

  if (result.success) {
    success.value = result.data.mensaje
    
    // Redirigir al dashboard después de 1 segundo
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
div {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

input {
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  width: 100%;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

label {
  font-weight: bold;
}
</style>