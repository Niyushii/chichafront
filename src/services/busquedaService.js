// src/services/busquedaService.js
import client from '../apollo/apolloClient'
import { BUSQUEDA_GENERAL } from '../graphql/busqueda'

export const busquedaService = {
  /**
   * Realiza una búsqueda general de productos y tiendas
   * @param {string} texto - Texto a buscar
   * @param {number} limiteProductos - Límite de productos (default: 20)
   * @param {number} limiteTiendas - Límite de tiendas (default: 10)
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async buscar(texto, limiteProductos = 20, limiteTiendas = 10) {
    try {
      // Validar que haya texto
      if (!texto || texto.trim() === '') {
        return {
          success: true,
          data: {
            productos: [],
            tiendas: [],
            totalProductos: 0,
            totalTiendas: 0
          }
        }
      }

      const { data } = await client.query({
        query: BUSQUEDA_GENERAL,
        variables: {
          texto: texto.trim(),
          limiteProductos,
          limiteTiendas
        },
        fetchPolicy: 'network-only' // Siempre traer datos frescos
      })

      return {
        success: true,
        data: data.busquedaGeneral
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  /**
   * Búsqueda solo de productos
   * @param {string} texto - Texto a buscar
   * @param {number} limite - Límite de resultados
   * @returns {Promise<Object>} Lista de productos
   */
  async buscarProductos(texto, limite = 20) {
    try {
      const resultado = await this.buscar(texto, limite, 0)
      
      if (resultado.success) {
        return {
          success: true,
          data: resultado.data.productos,
          total: resultado.data.totalProductos
        }
      }
      
      return resultado
    } catch (error) {
      console.error('Error buscando productos:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  /**
   * Búsqueda solo de tiendas
   * @param {string} texto - Texto a buscar
   * @param {number} limite - Límite de resultados
   * @returns {Promise<Object>} Lista de tiendas
   */
  async buscarTiendas(texto, limite = 10) {
    try {
      const resultado = await this.buscar(texto, 0, limite)
      
      if (resultado.success) {
        return {
          success: true,
          data: resultado.data.tiendas,
          total: resultado.data.totalTiendas
        }
      }
      
      return resultado
    } catch (error) {
      console.error('Error buscando tiendas:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  /**
   * Búsqueda rápida (menos resultados, más rápida)
   * @param {string} texto - Texto a buscar
   * @returns {Promise<Object>} Resultados limitados
   */
  async busquedaRapida(texto) {
    return await this.buscar(texto, 5, 3) // Solo 5 productos y 3 tiendas
  },

  /**
   * Verifica si hay resultados para un término
   * @param {string} texto - Texto a buscar
   * @returns {Promise<boolean>} true si hay resultados
   */
  async tieneResultados(texto) {
    try {
      const resultado = await this.busquedaRapida(texto)
      
      if (resultado.success) {
        const { totalProductos, totalTiendas } = resultado.data
        return totalProductos > 0 || totalTiendas > 0
      }
      
      return false
    } catch (error) {
      console.error('Error verificando resultados:', error)
      return false
    }
  },

  /**
   * Obtiene sugerencias de búsqueda
   * @param {string} texto - Texto parcial
   * @returns {Promise<Array>} Lista de sugerencias
   */
  async obtenerSugerencias(texto) {
    try {
      if (!texto || texto.length < 2) {
        return {
          success: true,
          data: []
        }
      }

      const resultado = await this.busquedaRapida(texto)
      
      if (resultado.success) {
        const sugerencias = []
        
        // Agregar nombres de productos
        resultado.data.productos.forEach(p => {
          sugerencias.push({
            tipo: 'producto',
            texto: p.producto.nombre,
            id: p.id,
            icono: 'pi-shopping-bag'
          })
        })
        
        // Agregar nombres de tiendas
        resultado.data.tiendas.forEach(t => {
          sugerencias.push({
            tipo: 'tienda',
            texto: t.nombre,
            id: t.id,
            icono: 'pi-shop'
          })
        })
        
        return {
          success: true,
          data: sugerencias.slice(0, 8) // Máximo 8 sugerencias
        }
      }
      
      return {
        success: true,
        data: []
      }
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  },

  /**
   * Manejo de errores
   */
  getErrorMessage(error) {
    if (error.networkError) {
      return `Error de red: ${error.networkError.message}`
    } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message
    }
    return error.message || 'Error al realizar la búsqueda'
  }
}