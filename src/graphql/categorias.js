// src/graphql/categorias.js
import { gql } from '@apollo/client/core';

// ========== QUERIES ==========
export const TODAS_CATEGORIAS = gql`
    query TodasCategorias($soloActivas: Boolean, $soloPrincipales: Boolean) {
        todasCategorias(soloActivas: $soloActivas, soloPrincipales: $soloPrincipales) {
        id
        nombre
        icono
        fechaCreacion
        fechaModificacion
        fechaEliminacion
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
        productos {
            id
        }
        }
    }
`;


export const CATEGORIA_POR_ID = gql`
    query CategoriaPorId($id: ID!) {
        categoriaPorId(id: $id) {
        id
        nombre
        icono
        fechaCreacion
        fechaModificacion
        fechaEliminacion
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
        productos {
            id
        }
        }
    }
`;


export const CATEGORIAS_JERARQUIA = gql`
    query CategoriasJerarquia {
        categoriasJerarquia {
        id
        nombre
        icono
        fechaCreacion
        fechaModificacion
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
            productos {
            id
            }
        }
        productos {
            id
        }
        }
    }
`;


export const SUBCATEGORIAS_DE = gql`
    query SubcategoriasDe($categoriaId: ID!) {
        subcategoriasDe(categoriaId: $categoriaId) {
        id
        nombre
        icono
        fechaCreacion
        fechaModificacion
        estado {
            id
            nombre
        }
        categoriaPadre {
            id
            nombre
        }
        productos {
            id
        }
        }
    }
`;


export const BUSCAR_CATEGORIAS = gql`
    query BuscarCategorias($busqueda: String!) {
        buscarCategorias(busqueda: $busqueda) {
        id
        nombre
        icono
        fechaCreacion
        fechaModificacion
        estado {
            id
            nombre
        }
        categoriaPadre {
            id
            nombre
            icono
        }
        productos {
            id
        }
        }
    }
`;


// ========== MUTATIONS ==========
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
            }
        }
        mensaje
        }
    }
`;

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
            }
        }
        mensaje
        }
    }
`;

export const ELIMINAR_CATEGORIA = gql`
    mutation EliminarCategoria($id: ID!) {
        eliminarCategoria(id: $id) {
        ok
        mensaje
        }
    }
`;