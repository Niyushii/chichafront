// src/graphql/categorias.js

import gql from 'graphql-tag'

// ============= QUERIES =============

export const TODAS_CATEGORIAS = gql`
  query TodasCategorias($soloActivas: Boolean, $soloPrincipales: Boolean) {
    todasCategorias(soloActivas: $soloActivas, soloPrincipales: $soloPrincipales) {
      id
      nombre
      icono
      estado {
        id
        nombre
      }
      categoriaPadre {
        id
        nombre
        icono
      }
      subcategorias {
        id
        nombre
        icono
        estado {
          id
          nombre
        }
      }
    }
  }
`

export const CATEGORIA_POR_ID = gql`
  query CategoriaPorId($id: ID!) {
    categoriaPorId(id: $id) {
      id
      nombre
      icono
      estado {
        id
        nombre
      }
      categoriaPadre {
        id
        nombre
        icono
      }
      subcategorias {
        id
        nombre
        icono
        estado {
          id
          nombre
        }
      }
    }
  }
`

export const CATEGORIAS_JERARQUIA = gql`
  query CategoriasJerarquia {
    categoriasJerarquia {
      id
      nombre
      icono
      estado {
        id
        nombre
      }
      subcategorias {
        id
        nombre
        icono
        estado {
          id
          nombre
        }
        subcategorias {
          id
          nombre
          icono
          estado {
            id
            nombre
          }
        }
      }
    }
  }
`

export const SUBCATEGORIAS_DE = gql`
  query SubcategoriasDe($categoriaId: ID!) {
    subcategoriasDe(categoriaId: $categoriaId) {
      id
      nombre
      icono
      estado {
        id
        nombre
      }
      categoriaPadre {
        id
        nombre
        icono
      }
    }
  }
`

export const BUSCAR_CATEGORIAS = gql`
  query BuscarCategorias($busqueda: String!) {
    buscarCategorias(busqueda: $busqueda) {
      id
      nombre
      icono
      estado {
        id
        nombre
      }
      categoriaPadre {
        id
        nombre
        icono
      }
      subcategorias {
        id
        nombre
        icono
        estado {
          id
          nombre
        }
      }
    }
  }
`

export const CATEGORIAS_PRINCIPALES_SIMPLE = gql`
  query CategoriasPrincipalesSimple {
    todasCategorias(soloActivas: true, soloPrincipales: true) {
      id
      nombre
      icono
    }
  }
`

export const CATEGORIAS_SIMPLE = gql`
  query CategoriasSimple($soloActivas: Boolean) {
    todasCategorias(soloActivas: $soloActivas) {
      id
      nombre
      icono
      categoriaPadre {
        id
        nombre
      }
    }
  }
`

// ============= MUTATIONS =============

export const CREAR_CATEGORIA = gql`
  mutation CrearCategoria($input: CrearCategoriaInput!) {
    crearCategoria(input: $input) {
      categoria {
        id
        nombre
        icono
        estado {
          id
          nombre
        }
        categoriaPadre {
          id
          nombre
          icono
        }
        subcategorias {
          id
          nombre
          icono
          estado {
            id
            nombre
          }
        }
      }
      mensaje
    }
  }
`

export const EDITAR_CATEGORIA = gql`
  mutation EditarCategoria($id: ID!, $input: EditarCategoriaInput!) {
    editarCategoria(id: $id, input: $input) {
      categoria {
        id
        nombre
        icono
        estado {
          id
          nombre
        }
        categoriaPadre {
          id
          nombre
          icono
        }
        subcategorias {
          id
          nombre
          icono
          estado {
            id
            nombre
          }
        }
      }
      mensaje
    }
  }
`

export const ELIMINAR_CATEGORIA = gql`
  mutation EliminarCategoria($id: ID!) {
    eliminarCategoria(id: $id) {
      ok
      mensaje
    }
  }
`