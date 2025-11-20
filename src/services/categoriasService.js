// src/services/categoriasService.js

import { apolloClient } from '@/apollo'
import {
    TODAS_CATEGORIAS,
    CATEGORIA_POR_ID,
    CATEGORIAS_JERARQUIA,
    SUBCATEGORIAS_DE,
    BUSCAR_CATEGORIAS,
    CATEGORIAS_PRINCIPALES_SIMPLE,
    CATEGORIAS_SIMPLE,
    CREAR_CATEGORIA,
    EDITAR_CATEGORIA,
    ELIMINAR_CATEGORIA
} from '../graphql/categorias'

class CategoriasService {
    
    // ============= QUERIES =============

    async obtenerTodas(soloActivas = true, soloPrincipales = false) {
        try {
        const { data } = await apolloClient.query({
            query: TODAS_CATEGORIAS,
            variables: { soloActivas, soloPrincipales },
            fetchPolicy: 'network-only'
        })
        return data.todasCategorias
        } catch (error) {
        console.error('Error al obtener categorías:', error)
        throw new Error(error.message || 'Error al obtener categorías')
        }
    }

    async obtenerPorId(id) {
        try {
        const { data } = await apolloClient.query({
            query: CATEGORIA_POR_ID,
            variables: { id },
            fetchPolicy: 'network-only'
        })
        return data.categoriaPorId
        } catch (error) {
        console.error(`Error al obtener categoría ${id}:`, error)
        throw new Error(error.message || 'Error al obtener la categoría')
        }
    }

    async obtenerJerarquia() {
        try {
        const { data } = await apolloClient.query({
            query: CATEGORIAS_JERARQUIA,
            fetchPolicy: 'network-only'
        })
        return data.categoriasJerarquia
        } catch (error) {
        console.error('Error al obtener jerarquía de categorías:', error)
        throw new Error(error.message || 'Error al obtener jerarquía')
        }
    }

    async obtenerSubcategorias(categoriaId) {
        try {
        const { data } = await apolloClient.query({
            query: SUBCATEGORIAS_DE,
            variables: { categoriaId },
            fetchPolicy: 'network-only'
        })
        return data.subcategoriasDe
        } catch (error) {
        console.error(`Error al obtener subcategorías de ${categoriaId}:`, error)
        throw new Error(error.message || 'Error al obtener subcategorías')
        }
    }

    async buscar(busqueda) {
        try {
        if (!busqueda || busqueda.trim() === '') {
            return []
        }
        
        const { data } = await apolloClient.query({
            query: BUSCAR_CATEGORIAS,
            variables: { busqueda },
            fetchPolicy: 'network-only'
        })
        return data.buscarCategorias
        } catch (error) {
        console.error('Error al buscar categorías:', error)
        throw new Error(error.message || 'Error al buscar')
        }
    }

    async obtenerPrincipalesSimple() {
        try {
        const { data } = await apolloClient.query({
            query: CATEGORIAS_PRINCIPALES_SIMPLE,
            fetchPolicy: 'network-only'
        })
        return data.todasCategorias
        } catch (error) {
        console.error('Error al obtener categorías principales:', error)
        throw new Error(error.message || 'Error al obtener categorías principales')
        }
    }

    async obtenerSimple(soloActivas = true) {
        try {
        const { data } = await apolloClient.query({
            query: CATEGORIAS_SIMPLE,
            variables: { soloActivas },
            fetchPolicy: 'network-only'
        })
        return data.todasCategorias
        } catch (error) {
        console.error('Error al obtener categorías:', error)
        throw new Error(error.message || 'Error al obtener categorías')
        }
    }

    // ============= MUTATIONS =============

    async crear(input) {
        try {
        const { data } = await apolloClient.mutate({
            mutation: CREAR_CATEGORIA,
            variables: { input }
        })
        return data.crearCategoria
        } catch (error) {
        console.error('Error al crear categoría:', error)
        throw new Error(error.message || 'Error al crear la categoría')
        }
    }

    async editar(id, input) {
        try {
        const { data } = await apolloClient.mutate({
            mutation: EDITAR_CATEGORIA,
            variables: { id, input }
        })
        return data.editarCategoria
        } catch (error) {
        console.error('Error al editar categoría:', error)
        throw new Error(error.message || 'Error al editar la categoría')
        }
    }

    async eliminar(id) {
        try {
        const { data } = await apolloClient.mutate({
            mutation: ELIMINAR_CATEGORIA,
            variables: { id }
        })
        return data.eliminarCategoria
        } catch (error) {
        console.error('Error al eliminar categoría:', error)
        throw new Error(error.message || 'Error al eliminar la categoría')
        }
    }

    // ============= UTILIDADES =============

    validarJerarquia(categoriaId, padreId, todasCategorias) {
        if (!padreId || categoriaId === padreId) {
        return false
        }

        const buscarDescendiente = (id) => {
        const categoria = todasCategorias.find(cat => cat.id === id)
        if (!categoria || !categoria.categoriaPadre) {
            return false
        }
        if (categoria.categoriaPadre.id === categoriaId) {
            return true
        }
        return buscarDescendiente(categoria.categoriaPadre.id)
        }

        return !buscarDescendiente(padreId)
    }

    construirArbol(categorias) {
        const map = {}
        const raices = []

        categorias.forEach(cat => {
        map[cat.id] = { ...cat, hijos: [] }
        })

        categorias.forEach(cat => {
        if (cat.categoriaPadre && map[cat.categoriaPadre.id]) {
            map[cat.categoriaPadre.id].hijos.push(map[cat.id])
        } else {
            raices.push(map[cat.id])
        }
        })

        return raices
    }

    aplanarArbol(arbol, nivel = 0) {
        let resultado = []
        
        arbol.forEach(categoria => {
        resultado.push({ ...categoria, nivel })
        if (categoria.hijos && categoria.hijos.length > 0) {
            resultado = resultado.concat(this.aplanarArbol(categoria.hijos, nivel + 1))
        }
        })

        return resultado
    }

    filtrarPorEstado(categorias, soloActivas = true) {
        if (!soloActivas) return categorias
        return categorias.filter(cat => 
        cat.estado && cat.estado.nombre === 'Activo'
        )
    }

    ordenarAlfabeticamente(categorias, descendente = false) {
        return [...categorias].sort((a, b) => {
        const resultado = a.nombre.localeCompare(b.nombre, 'es')
        return descendente ? -resultado : resultado
        })
    }

    invalidarCache() {
        apolloClient.resetStore()
    }
}

export default new CategoriasService()