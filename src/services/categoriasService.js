// src/services/categoriasService.js
import apolloClient from '../apollo/apolloClient';
import {
  TODAS_CATEGORIAS,
  CATEGORIA_POR_ID,
  CATEGORIAS_JERARQUIA,
  SUBCATEGORIAS_DE,
  BUSCAR_CATEGORIAS,
  CREAR_CATEGORIA,
  EDITAR_CATEGORIA,
  ELIMINAR_CATEGORIA
} from '../graphql/categorias';

class categoriasService {
  
  // ========== QUERIES ==========
  
  async obtenerTodasCategorias(soloActivas = true, soloPrincipales = false) {
    try {
      const { data } = await apolloClient.query({
        query: TODAS_CATEGORIAS,
        fetchPolicy: "no-cache",
        variables: { soloActivas, soloPrincipales }
      });
      return data.todasCategorias;
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
      throw this.procesarError(error);
    }
  }

  async obtenerCategoriaPorId(id) {
    try {
      const { data } = await apolloClient.query({
        query: CATEGORIA_POR_ID,
        fetchPolicy: "no-cache",
        variables: { id }
      });
      return data.categoriaPorId;
    } catch (error) {
      console.error('Error al obtener categoría por ID:', error);
      throw this.procesarError(error);
    }
  }

  async obtenerJerarquia() {
    try {
      const { data } = await apolloClient.query({
        query: CATEGORIAS_JERARQUIA,
        fetchPolicy: "no-cache",
      });
      return data.categoriasJerarquia;
    } catch (error) {
      console.error('Error al obtener jerarquía de categorías:', error);
      throw this.procesarError(error);
    }
  }

  async obtenerSubcategorias(categoriaId) {
    try {
      const { data } = await apolloClient.query({
        query: SUBCATEGORIAS_DE,
        variables: { categoriaId },
        fetchPolicy: "no-cache",
      });
      return data.subcategoriasDe;
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      throw this.procesarError(error);
    }
  }

  async buscarCategorias(busqueda) {
    if (!busqueda || busqueda.trim() === '') {
      return [];
    }

    try {
      const { data } = await apolloClient.query({
        query: BUSCAR_CATEGORIAS,
        fetchPolicy: "no-cache",
        variables: { busqueda: busqueda.trim() }
      });
      return data.buscarCategorias;
    } catch (error) {
      console.error('Error al buscar categorías:', error);
      throw this.procesarError(error);
    }
  }

  // ========== MUTATIONS ==========

  async crearCategoria(input) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREAR_CATEGORIA,
        variables: { input }
      });
      return data.crearCategoria;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw this.procesarError(error);
    }
  }

  async editarCategoria(id, input) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: EDITAR_CATEGORIA,
        variables: { id, input }
      });
      return data.editarCategoria;
    } catch (error) {
      console.error('Error al editar categoría:', error);
      throw this.procesarError(error);
    }
  }

  async eliminarCategoria(id) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ELIMINAR_CATEGORIA,
        variables: { id }
      });
      return data.eliminarCategoria;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw this.procesarError(error);
    }
  }

  // ========== UTILIDADES ==========

  procesarError(error) {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const mensaje = error.graphQLErrors[0].message;
      return new Error(mensaje);
    }
    
    if (error.networkError) {
      return new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
    }
    
    return new Error(error.message || 'Error desconocido al procesar la solicitud');
  }

  obtenerCategoriasPrincipales() {
    return this.obtenerTodasCategorias(true, true);
  }

  tieneSubcategorias(categoria) {
    return categoria.subcategorias && categoria.subcategorias.length > 0;
  }

  esSubcategoria(categoria) {
    return categoria.categoriaPadre !== null && categoria.categoriaPadre !== undefined;
  }

  construirRuta(categoria) {
    const ruta = [categoria];
    let actual = categoria;
    
    while (actual.categoriaPadre) {
      ruta.unshift(actual.categoriaPadre);
      actual = actual.categoriaPadre;
    }
    
    return ruta;
  }
}

export default new categoriasService();