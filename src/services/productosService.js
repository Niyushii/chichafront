// src/services/productosService.js
import client from '../apollo/apolloClient'
import {
  GET_PRODUCTOS_TIENDA,
  GET_PRODUCTO,
  CREAR_PRODUCTO,
  EDITAR_PRODUCTO,
  ELIMINAR_PRODUCTO,
  SUBIR_IMAGEN_PRODUCTO,
  ELIMINAR_IMAGEN_PRODUCTO,
  ACTUALIZAR_STOCK_PRECIO
} from '../graphql/productos'

export const productosService = {
    async obtenerProductosTienda(tiendaId) {
    try {
        const { data } = await client.query({
        query: GET_PRODUCTOS_TIENDA,
        variables: { tiendaId },
        fetchPolicy: 'network-only'
        })
        return data.productosDeTienda 
    } catch (error) {
        console.error('Error al obtener productos:', error)
        throw new Error(this.getErrorMessage(error))
    }
    },

  async obtenerProducto(id) {
    try {
      const { data } = await client.query({
        query: GET_PRODUCTO,
        variables: { id },
        fetchPolicy: 'network-only'
      })
      return data.productoPorId  // ⚡ aquí va el campo correcto de tu query
    } catch (error) {
      console.error('Error al obtener producto:', error)
      throw new Error(this.getErrorMessage(error))
    }
  },

  async crear(input) {
    try {
      const { data } = await client.mutate({
        mutation: CREAR_PRODUCTO,
        variables: { input }
      })
      return data.crearProducto
    } catch (error) {
      console.error('Error al crear producto:', error)
      throw new Error(this.getErrorMessage(error))
    }
  },

  async editar(input) {
    try {
      const { data } = await client.mutate({
        mutation: EDITAR_PRODUCTO,
        variables: { input }
      })
      return data.editarProducto
    } catch (error) {
      console.error('Error al editar producto:', error)
      throw new Error(this.getErrorMessage(error))
    }
  },

  async eliminar(id) {
    try {
      const { data } = await client.mutate({
        mutation: ELIMINAR_PRODUCTO,
        variables: { id }
      })
      return data.eliminarProducto
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      throw new Error(this.getErrorMessage(error))
    }
  },

  async subirImagen(id, imagen) {
    try {
      const { data } = await client.mutate({
        mutation: SUBIR_IMAGEN_PRODUCTO,
        variables: { id, imagen }
      })
      return data.subirImagenProducto
    } catch (error) {
      console.error('Error al subir imagen:', error)
      throw new Error(this.getErrorMessage(error))
    }
  },

  async eliminarImagen(id) {
    try {
      const { data } = await client.mutate({
        mutation: ELIMINAR_IMAGEN_PRODUCTO,
        variables: { id }
      })
      return data.eliminarImagenProducto
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
      throw new Error(this.getErrorMessage(error))
    }
  },

  async actualizarStockPrecio(id, precio, stock) {
    try {
      const { data } = await client.mutate({
        mutation: ACTUALIZAR_STOCK_PRECIO,
        variables: { id, precio, stock }
      })
      return data.actualizarStockPrecio
    } catch (error) {
      console.error('Error al actualizar stock/precio:', error)
      throw new Error(this.getErrorMessage(error))
    }
  },

  getErrorMessage(error) {
    if (error.networkError) {
      return `Error de red: ${error.networkError.message}`
    } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message
    }
    return error.message || 'Error desconocido'
  }
}