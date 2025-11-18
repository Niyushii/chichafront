<!-- src/pages/HomeView.vue -->
<template>
  <div class="home-container">
    <div class="header">
      <h1>Bienvenido a Chichawasi</h1>
      <button 
        @click="handleLogout"
        class="btn-logout"
      >
        <i class="pi pi-sign-out"></i>
        <span>Cerrar Sesión</span>
      </button>
    </div>
    
    <div v-if="userData" class="user-info">
      <div class="avatar">
        <i class="pi pi-user"></i>
      </div>
      <h2>¡Hola, {{ userData.nombre }} {{ userData.apellidos }}!</h2>
      <div class="info-detalles">
        <p><i class="pi pi-envelope"></i> {{ userData.email }}</p>
        <p><i class="pi pi-at"></i> @{{ userData.username }}</p>
        <p v-if="userData.celular"><i class="pi pi-phone"></i> {{ userData.celular }}</p>
      </div>
    </div>

    <div class="acciones">
      <button 
        @click="router.push('/tiendas')"
        class="btn-tiendas"
      >
        <i class="pi pi-shop"></i>
        <span>Mis Tiendas</span>
      </button>

      <button 
        @click="router.push('/perfil')"
        class="btn-perfil"
      >
        <i class="pi pi-user-edit"></i>
        <span>Editar Perfil</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

const router = useRouter()
const userData = ref(null)

onMounted(() => {
  userData.value = authService.getUserData()
})

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.header h1 {
  color: var(--cafe);
  font-size: 2rem;
  margin: 0;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: transparent;
  color: var(--cafe);
  border: 2px solid var(--cafe);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background-color: var(--cafe);
  color: var(--crema);
}

.user-info {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 3rem;
  color: white;
}

.user-info h2 {
  color: var(--cafe);
  margin: 0 0 20px 0;
  font-size: 1.8rem;
}

.info-detalles {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.info-detalles p {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gris-oscuro);
  margin: 0;
  font-size: 1rem;
}

.info-detalles i {
  color: var(--naranja-opaco);
  font-size: 1.1rem;
}

.acciones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.btn-tiendas,
.btn-perfil {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 30px 20px;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
  color: var(--cafe);
}

.btn-tiendas i,
.btn-perfil i {
  font-size: 3rem;
  color: var(--naranja-opaco);
}

.btn-tiendas:hover,
.btn-perfil:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(111, 72, 39, 0.2);
  border-color: var(--naranja-opaco);
  background: linear-gradient(135deg, var(--cafe-claro) 0%, var(--naranja-opaco) 100%);
  color: white;
}

.btn-tiendas:hover i,
.btn-perfil:hover i {
  color: white;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .user-info {
    padding: 30px 20px;
  }
  
  .acciones {
    grid-template-columns: 1fr;
  }
}
</style>