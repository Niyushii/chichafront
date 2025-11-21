<!-- src/components/TarjetaProducto.vue -->
<template>
  <div class="tarjeta-producto">
    <div class="producto-imagen">
      <img 
        v-if="producto.imagenes && producto.imagenes.length > 0" 
        :src="producto.imagenes[0].archivo" 
        :alt="producto.producto.nombre"
      />
      <div v-else class="imagen-placeholder">
        <i class="pi pi-image"></i>
      </div>
      
      <!-- Badge de talla si existe -->
      <div v-if="producto.talla" class="badge-talla">
        {{ producto.talla.nombre }}
      </div>
    </div>

    <div class="producto-info">
      <h3 class="producto-nombre">{{ producto.producto.nombre }}</h3>
      
      <p v-if="producto.descripcion" class="producto-descripcion">
        {{ producto.descripcion }}
      </p>

      <div class="producto-detalles">
        <div class="precio">
          <i class="pi pi-tag"></i>
          <span>Bs {{ formatearPrecio(producto.precio) }}</span>
        </div>

        <div v-if="producto.producto.categoria" class="categoria">
          <i class="pi pi-bookmark"></i>
          <span>{{ producto.producto.categoria.nombre }}</span>
        </div>
      </div>

      <!-- Galería de imágenes miniatura -->
      <div v-if="producto.imagenes && producto.imagenes.length > 1" class="galeria-mini">
        <div 
          v-for="(img, index) in producto.imagenes.slice(0, 4)" 
          :key="img.id"
          class="mini-imagen"
        >
          <img :src="img.archivo" :alt="`Imagen ${index + 1}`" />
        </div>
        <span v-if="producto.imagenes.length > 4" class="mas-imagenes">
          +{{ producto.imagenes.length - 4 }}
        </span>
      </div>
    </div>

    <div class="producto-acciones">
      <button 
        @click="EditarProducto"
        class="btn-icono btn-editar"
        title="Editar producto"
      >
        <i class="pi pi-pencil"></i>
      </button>
      <button 
        @click="$emit('eliminar', producto)"
        class="btn-icono btn-eliminar"
        title="Eliminar producto"
      >
        <i class="pi pi-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  producto: {
    type: Object,
    required: true
  }
})

defineEmits(['eliminar'])

const formatearPrecio = (precio) => {
  return parseFloat(precio).toFixed(2)
}

const EditarProducto = () => {
  // Obtenemos el ID de la tienda desde la ruta actual
  const tiendaId = route.params.id
  
  // Navegamos a la ruta de edición con el ID de la tienda y el ID del producto
  router.push({
    name: 'EditarProducto',
    params: {
      id: tiendaId,
      productoId: props.producto.id
    }
  })
}
</script>

<style scoped>
.tarjeta-producto {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tarjeta-producto:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(111, 72, 39, 0.2);
  border-color: var(--naranja-opaco);
}

.producto-imagen {
  position: relative;
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  overflow: hidden;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagen-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 4rem;
}

.badge-talla {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.95);
  color: var(--cafe);
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.producto-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.producto-nombre {
  color: var(--cafe);
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.producto-descripcion {
  color: var(--gris-claro);
  font-size: 0.85rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.producto-detalles {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.precio, .categoria {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.precio {
  color: var(--cafe);
  font-weight: 700;
  font-size: 1.2rem;
}

.categoria {
  color: var(--gris-oscuro);
}

.precio i, .categoria i {
  color: var(--naranja-opaco);
  font-size: 1rem;
}

.galeria-mini {
  display: flex;
  gap: 5px;
  margin-top: 10px;
  align-items: center;
}

.mini-imagen {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--cafe-claro);
}

.mini-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mas-imagenes {
  font-size: 0.8rem;
  color: var(--gris-claro);
  font-weight: 600;
}

.producto-acciones {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 2px solid var(--crema);
}

.btn-icono {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-editar {
  background-color: #e3f2fd;
  color: #2196F3;
}

.btn-editar:hover {
  background-color: #2196F3;
  color: white;
}

.btn-eliminar {
  background-color: #ffebee;
  color: #f44336;
}

.btn-eliminar:hover {
  background-color: #f44336;
  color: white;
}

@media (max-width: 768px) {
  .producto-imagen {
    height: 180px;
  }
  
  .producto-nombre {
    font-size: 1rem;
  }
  
  .precio {
    font-size: 1.1rem;
  }
}
</style>