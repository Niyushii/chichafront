// src/services/moderadoresService.js
import client from '../apollo/apolloClient'
import {
    GET_TODOS_MODERADORES,
    GET_MODERADOR_BY_ID,
    GET_ESTADISTICAS_MODERADORES,
    CREAR_MODERADOR,
    EDITAR_MODERADOR,
    ELIMINAR_MODERADOR
} from '../graphql/moderadores'

export const moderadoresService = {
    async obtenerTodos(soloActivos = true) {
        try {
        const { data } = await client.query({
            query: GET_TODOS_MODERADORES,
            variables: { soloActivos },
            fetchPolicy: 'network-only'
        })

        return {
            success: true,
            data: data.todosModeradores
        }
        } catch (error) {
        console.error('Error al obtener moderadores:', error)
        return {
            success: false,
            error: this.getErrorMessage(error)
        }
        }
    },

    async obtenerPorId(id) {
        try {
        const { data } = await client.query({
            query: GET_MODERADOR_BY_ID,
            variables: { id },
            fetchPolicy: 'network-only'
        })

        return {
            success: true,
            data: data.moderadorPorId
        }
        } catch (error) {
        console.error('Error al obtener moderador:', error)
        return {
            success: false,
            error: this.getErrorMessage(error)
        }
        }
    },

    async obtenerEstadisticas() {
        try {
        const { data } = await client.query({
            query: GET_ESTADISTICAS_MODERADORES,
            fetchPolicy: 'network-only'
        })

        return {
            success: true,
            data: data.estadisticasModeradores
        }
        } catch (error) {
        console.error('Error al obtener estadísticas:', error)
        return {
            success: false,
            error: this.getErrorMessage(error)
        }
        }
    },

    async crear(moderadorData) {
        try {
        const { data } = await client.mutate({
            mutation: CREAR_MODERADOR,
            variables: {
            input: moderadorData
            }
        })

        return {
            success: true,
            data: data.crearModerador
        }
        } catch (error) {
        console.error('Error al crear moderador:', error)
        return {
            success: false,
            error: this.getErrorMessage(error)
        }
        }
    },

    async editar(id, moderadorData) {
        try {
        const { data } = await client.mutate({
            mutation: EDITAR_MODERADOR,
            variables: {
            id,
            input: moderadorData
            }
        })

        return {
            success: true,
            data: data.editarModerador
        }
        } catch (error) {
        console.error('Error al editar moderador:', error)
        return {
            success: false,
            error: this.getErrorMessage(error)
        }
        }
    },

    async eliminar(id) {
        try {
        const { data } = await client.mutate({
            mutation: ELIMINAR_MODERADOR,
            variables: { id }
        })

        return {
            success: true,
            data: data.eliminarModerador
        }
        } catch (error) {
        console.error('Error al eliminar moderador:', error)
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