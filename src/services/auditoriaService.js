// src/services/auditoriaService.js
import client from '../apollo/apolloClient'
import { gql } from '@apollo/client/core'

// Query corregida con los campos reales del backend
const GET_AUDITORIA = gql`
  query Auditoria {
    auditoria {
      id
      usuarioId
      usuarioTipo
      accion
      descripcion
      fecha
    }
  }
`

export const auditoriaService = {
  async obtenerTodas() {
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
      console.error('Error al obtener auditoría:', error)
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