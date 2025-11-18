// src/services/tiendasService.js
import client from '../apollo/apolloClient'
import {
  GET_MIS_TIENDAS,
  GET_TIENDA_BY_ID,
  GET_TODAS_TIENDAS,
  CREAR_TIENDA,
  EDITAR_TIENDA,
  ELIMINAR_TIENDA,
  ELIMINAR_FOTO_PERFIL,
  ELIMINAR_CODIGO_QR
} from '../graphql/tiendas'

export const tiendasService = {
  async obtenerMisTiendas() {
    try {
      const { data } = await client.query({
        query: GET_MIS_TIENDAS,
        fetchPolicy: 'network-only'
      })

      return {
        success: true,
        data: data.misTiendas
      }
    } catch (error) {
      console.error('Error al obtener mis tiendas:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async obtenerPorId(id) {
    try {
      const { data } = await client.query({
        query: GET_TIENDA_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only'
      })

      return {
        success: true,
        data: data.tiendaPorId
      }
    } catch (error) {
      console.error('Error al obtener tienda:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async obtenerTodas(soloActivas = true) {
    try {
      const { data } = await client.query({
        query: GET_TODAS_TIENDAS,
        variables: { soloActivas },
        fetchPolicy: 'network-only'
      })

      return {
        success: true,
        data: data.todasTiendas
      }
    } catch (error) {
      console.error('Error al obtener tiendas:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async crear(tiendaData, fotoPerfil = null, codigoQr = null) {
    try {
      const variables = {
        input: {
          nombre: tiendaData.nombre,
          descripcion: tiendaData.descripcion || '',
          telefono: tiendaData.telefono || '',
          direccion: tiendaData.direccion || ''
        }
      }

      // Agregar archivos si existen
      if (fotoPerfil) {
        variables.fotoPerfil = fotoPerfil
      }

      if (codigoQr) {
        variables.codigoQr = codigoQr
      }

      const { data } = await client.mutate({
        mutation: CREAR_TIENDA,
        variables
      })

      return {
        success: true,
        data: data.crearTienda
      }
    } catch (error) {
      console.error('Error al crear tienda:', error)
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

        // ✅ IMPORTANTE: Solo agregar si hay archivo nuevo
        if (fotoPerfil instanceof File) {
        variables.fotoPerfil = fotoPerfil
        }

        if (codigoQr instanceof File) {
        variables.codigoQr = codigoQr
        }

        console.log('Variables enviadas:', variables) // ✅ Para debug

        const { data } = await client.mutate({
        mutation: EDITAR_TIENDA,
        variables,
        context: {
            // ✅ Forzar uso de FormData cuando hay archivos
            hasUpload: !!(fotoPerfil || codigoQr)
        }
        })

        return {
        success: true,
        data: data.editarTienda
        }
    } catch (error) {
        console.error('Error al editar tienda:', error)
        console.error('Error completo:', JSON.stringify(error, null, 2)) // ✅ Debug
        return {
        success: false,
        error: this.getErrorMessage(error)
        }
    }
    },
    
  async eliminar(id) {
    try {
      const { data } = await client.mutate({
        mutation: ELIMINAR_TIENDA,
        variables: { id }
      })

      return {
        success: true,
        data: data.eliminarTienda
      }
    } catch (error) {
      console.error('Error al eliminar tienda:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async eliminarFotoPerfil(tiendaId) {
    try {
      const { data } = await client.mutate({
        mutation: ELIMINAR_FOTO_PERFIL,
        variables: { tiendaId }
      })

      return {
        success: true,
        data: data.eliminarFotoPerfil
      }
    } catch (error) {
      console.error('Error al eliminar foto:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async eliminarCodigoQr(tiendaId) {
    try {
      const { data } = await client.mutate({
        mutation: ELIMINAR_CODIGO_QR,
        variables: { tiendaId }
      })

      return {
        success: true,
        data: data.eliminarCodigoQr
      }
    } catch (error) {
      console.error('Error al eliminar código QR:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
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