<!-- src/components/TarjetaProductoPublico.vue -->
<template>
  <div class="tarjeta-producto-publico">
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

      <!-- Botón de favorito en la esquina superior derecha -->
      <button 
        @click.stop="toggleFavorito"
        :class="['btn-favorito', { 'favorito-activo': esFavorito }]"
        :disabled="loadingFavorito"
        :title="esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'"
      >
        <i :class="loadingFavorito ? 'pi pi-spin pi-spinner' : (esFavorito ? 'pi pi-heart-fill' : 'pi pi-heart')"></i>
      </button>
    </div>

    <div class="producto-info">
      <h3 class="producto-nombre">{{ producto.producto.nombre }}</h3>

      <div class="producto-detalles">
        <div class="precio">
          <i class="pi pi-tag"></i>
          <span>Bs {{ formatearPrecio(producto.precio) }}</span>
        </div>

        <div v-if="producto.producto.categoria" class="categoria">
          <i class="pi pi-bookmark"></i>
          <span>{{ producto.producto.categoria.nombre }}</span>
        </div>

        <!-- <div class="stock">
          <i class="pi pi-box"></i>
          <span :class="producto.stock > 0 ? 'en-stock' : 'sin-stock'">
            {{ producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado' }}
          </span>
        </div> -->
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

      <!-- Información de la tienda -->
      <div v-if="mostrarTienda && producto.tienda" class="info-tienda">
        <i class="pi pi-shop"></i>
        <span>{{ producto.tienda.nombre }}</span>
      </div>
    </div>

    <div class="producto-acciones">
      <button 
        @click="$emit('ver-detalle', producto)"
        class="btn-accion btn-ver-mas"
      >
        <i class="pi pi-eye"></i>
        <span>Ver más</span>
      </button>
      
      <button 
        @click="$emit('comprar', producto)"
        class="btn-accion btn-comprar"
      >
        <i class="pi pi-shopping-cart"></i>
        <span>{{ producto.stock >=  0 ? 'Comprar' : 'Agotado' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'

const props = defineProps({
  producto: {
    type: Object,
    required: true
  },
  mostrarTienda: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['ver-detalle', 'comprar', 'favorito-cambiado'])

const esFavorito = ref(false)
const loadingFavorito = ref(false)

// Query para verificar si es favorito
const ES_FAVORITO_QUERY = gql`
  query EsFavorito($tiendaProductoId: ID!) {
    esFavorito(tiendaProductoId: $tiendaProductoId)
  }
`

// Mutation para toggle favorito
const TOGGLE_FAVORITO = gql`
  mutation ToggleFavorito($tiendaProductoId: ID!) {
    toggleFavorito(tiendaProductoId: $tiendaProductoId) {
      accion
      mensaje
      favorito {
        id
      }
    }
  }
`

// Verificar si el producto es favorito al montar
const { refetch: verificarFavorito } = useQuery(ES_FAVORITO_QUERY, {
  tiendaProductoId: props.producto.id
}, {
  fetchPolicy: 'network-only'
})

const { mutate: toggleFavoritoMutation } = useMutation(TOGGLE_FAVORITO)

onMounted(async () => {
  try {
    const result = await verificarFavorito()
    if (result?.data?.esFavorito !== undefined) {
      esFavorito.value = result.data.esFavorito
    }
  } catch (err) {
    console.error('Error al verificar favorito:', err)
  }
})

const formatearPrecio = (precio) => {
  return parseFloat(precio).toFixed(2)
}

const toggleFavorito = async () => {
  loadingFavorito.value = true
  
  try {
    const result = await toggleFavoritoMutation({
      tiendaProductoId: props.producto.id
    })
    
    if (result?.data?.toggleFavorito) {
      const { accion, mensaje } = result.data.toggleFavorito
      esFavorito.value = accion === 'agregado'
      
      // Emitir evento para notificar al componente padre
      emit('favorito-cambiado', {
        producto: props.producto,
        esFavorito: esFavorito.value,
        mensaje
      })
    }
  } catch (err) {
    console.error('Error al cambiar favorito:', err)
    // Aquí podrías mostrar un mensaje de error al usuario
  } finally {
    loadingFavorito.value = false
  }
}
</script>

<style scoped>
.tarjeta-producto-publico {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
}

.tarjeta-producto-publico:hover {
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
  left: 10px;
  background-color: rgba(255, 255, 255, 0.95);
  color: var(--cafe);
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-favorito {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.95);
  color: var(--gris-claro);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 1.2rem;
}

.btn-favorito:hover:not(:disabled) {
  transform: scale(1.1);
  background-color: white;
}

.btn-favorito:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.favorito-activo {
  background-color: #fff0f0;
  color: #e74c3c;
}

.favorito-activo:hover:not(:disabled) {
  background-color: #ffe0e0;
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
  min-height: 2.4rem;
}

.producto-detalles {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.precio, .categoria, .stock {
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

.stock {
  color: var(--gris-oscuro);
}

.en-stock {
  color: #27ae60;
  font-weight: 600;
}

.sin-stock {
  color: #e74c3c;
  font-weight: 600;
}

.precio i, .categoria i, .stock i {
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

.info-tienda {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--crema);
  border-radius: 8px;
  margin-top: 10px;
  font-size: 0.85rem;
  color: var(--gris-oscuro);
}

.info-tienda i {
  color: var(--naranja-opaco);
}

.producto-acciones {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 2px solid var(--crema);
}

.btn-accion {
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

.btn-ver-mas {
  background-color: #e3f2fd;
  color: #2196F3;
}

.btn-ver-mas:hover:not(:disabled) {
  background-color: #2196F3;
  color: white;
}

.btn-comprar {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
}

.btn-comprar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(111, 72, 39, 0.4);
}

.btn-accion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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