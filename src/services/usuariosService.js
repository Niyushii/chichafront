// src/services/usuariosService.js
import client from '../apollo/apolloClient'
import { gql } from '@apollo/client/core'

// Queries
const GET_TODOS_USUARIOS = gql`
  query TodosUsuarios($soloActivos: Boolean, $esVendedor: Boolean, $buscar: String) {
    todosUsuarios(soloActivos: $soloActivos, esVendedor: $esVendedor, buscar: $buscar) {
      id
      email
      username
      nombre
      apellidos
      celular
      isSeller
      estado {
        id
        nombre
        esActivo
      }
      fechaCreacion
    }
  }
`

const GET_ESTADISTICAS_USUARIOS = gql`
  query EstadisticasUsuarios {
    estadisticasUsuarios {
      total
      activos
      inactivos
      vendedores
      nuevosUltimos30Dias
    }
  }
`

export const usuariosService = {
  async obtenerTodos(soloActivos = true, esVendedor = null, buscar = null) {
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
      console.error('Error al obtener usuarios:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  async obtenerEstadisticas() {
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
      console.error('Error al obtener estadísticas:', error)
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