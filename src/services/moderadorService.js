// src/services/moderadorCompleto.js
import client from '../apollo/apolloClient'
import {
  GET_TODOS_USUARIOS,
  GET_USUARIO_POR_ID,
  GET_ESTADISTICAS_USUARIOS,
  GET_TIENDAS_ADMIN,
  GET_TODOS_PRODUCTOS,
  GET_PRODUCTO_POR_ID,
  GET_TALLAS,
  GET_AUDITORIA,
  CREAR_TALLA,
  EDITAR_TALLA,
  ELIMINAR_TALLA,
  CREAR_TALLAS_MASIVAS,
  EDITAR_PRODUCTO_MOD,
  ELIMINAR_PRODUCTO_MOD,
  ELIMINAR_TIENDA_MOD,
  EDITAR_TIENDA_MOD
} from '../graphql/moderadores'

export const moderadoresService = {
  // ========== USUARIOS ==========
  async obtenerTodosUsuarios(soloActivos = true, esVendedor = null, buscar = null) {
    try {
      const { data } = await client.query({
        query: GET_TODOS_USUARIOS,
        variables: { soloActivos, esVendedor, buscar },
        fetchPolicy: 'network-only'
      })
      return {
        success: true,
        data: data.todosUsuarios
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async obtenerUsuarioPorId(id) {
    try {
      const { data } = await client.query({
        query: GET_USUARIO_POR_ID,
        variables: { id },
        fetchPolicy: 'network-only'
      })
      return {
        success: true,
        data: data.usuarioPorId
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async obtenerEstadisticasUsuarios() {
    try {
      const { data } = await client.query({
        query: GET_ESTADISTICAS_USUARIOS,
        fetchPolicy: 'network-only'
      })
      return {
        success: true,
        data: data.estadisticasUsuarios
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  // ========== TIENDAS ==========
  async obtenerTodasTiendas() {
    try {
      const { data } = await client.query({
        query: GET_TIENDAS_ADMIN,
        fetchPolicy: 'network-only'
      })
      return {
        success: true,
        data: data.tiendasAdmin
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async eliminarTienda(id) {
    try {
      const { data } = await client.mutate({
        mutation: ELIMINAR_TIENDA_MOD,
        variables: { id }
      })
      return {
        success: true,
        data: data.eliminarTienda
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  // ========== PRODUCTOS ==========
  async obtenerTodosProductos(limit = 50, offset = 0) {
    try {
      const { data } = await client.query({
        query: GET_TODOS_PRODUCTOS,
        variables: { limit, offset },
        fetchPolicy: 'network-only'
      })
      return {
        success: true,
        data: data.todosProductos
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async obtenerProductoPorId(id) {
    try {
      const { data } = await client.query({
        query: GET_PRODUCTO_POR_ID,
        variables: { id },
        fetchPolicy: 'network-only'
      })
      return {
        success: true,
        data: data.productoPorId
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async editarProducto(input) {
    try {
      const { data } = await client.mutate({
        mutation: EDITAR_PRODUCTO_MOD,
        variables: { input }
      })
      return {
        success: true,
        data: data.editarProducto
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async eliminarProducto(tiendaProductoId) {
    try {
      const { data } = await client.mutate({
        mutation: ELIMINAR_PRODUCTO_MOD,
        variables: { tiendaProductoId }
      })
      return {
        success: true,
        data: data.eliminarProducto
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  // ========== TALLAS ==========
  async obtenerTallas() {
    try {
      const { data } = await client.query({
        query: GET_TALLAS,
        fetchPolicy: 'network-only'
      })
      return {
        success: true,
        data: data.tallas
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async crearTalla(input) {
    try {
      const { data } = await client.mutate({
        mutation: CREAR_TALLA,
        variables: { input }
      })
      return {
        success: true,
        data: data.crearTalla
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async editarTalla(id, input) {
    try {
      const { data } = await client.mutate({
        mutation: EDITAR_TALLA,
        variables: { id, input }
      })
      return {
        success: true,
        data: data.editarTalla
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async eliminarTalla(id) {
    try {
      const { data } = await client.mutate({
        mutation: ELIMINAR_TALLA,
        variables: { id }
      })
      return {
        success: true,
        data: data.eliminarTalla
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async crearTallasMasivas(nombres) {
    try {
      const { data } = await client.mutate({
        mutation: CREAR_TALLAS_MASIVAS,
        variables: { nombres }
      })
      return {
        success: true,
        data: data.crearTallasMasivas
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  // ========== AUDITORÍA ==========
  async obtenerAuditoria() {
    try {
      const { data } = await client.query({
        query: GET_AUDITORIA,
        fetchPolicy: 'network-only'
      })
      return {
        success: true,
        data: data.auditoria
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async editar(id, tiendaData, fotoPerfil = null, codigoQr = null) {
    try {
      const variables = {
        id,
        input: {}
      }

      // Solo agregar campos que tengan valor
      if (tiendaData.nombre) variables.input.nombre = tiendaData.nombre
      if (tiendaData.descripcion !== undefined) variables.input.descripcion = tiendaData.descripcion
      if (tiendaData.telefono !== undefined) variables.input.telefono = tiendaData.telefono
      if (tiendaData.direccion !== undefined) variables.input.direccion = tiendaData.direccion

      // Agregar archivos si existen
      if (fotoPerfil) {
        variables.fotoPerfil = fotoPerfil
      }

      if (codigoQr) {
        variables.codigoQr = codigoQr
      }

      const { data } = await client.mutate({
        mutation: EDITAR_TIENDA_MOD,
        variables
      })

      return {
        success: true,
        data: data.editarTienda
      }
    } catch (error) {
      console.error('Error al editar tienda:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  // ========== UTILIDADES ==========
  getErrorMessage(error) {
    if (error.networkError) {
      return `Error de red: ${error.networkError.message}`
    } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message
    }
    return error.message || 'Error desconocido'
  }
}