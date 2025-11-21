// src/services/tallasService.js
import client from '../apollo/apolloClient'
import { GET_TALLAS } from '../graphql/tallas'

export const tallasService = {
  async obtenerTodas() {
    try {
      const { data } = await client.query({
        query: GET_TALLAS,
        fetchPolicy: 'network-only'
      })
      return data.tallas
    } catch (error) {
      console.error('Error al obtener tallas:', error)
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