// src/graphql/moderadores.js
import { gql } from '@apollo/client/core'

// Queries - SIN PARÁMETROS
export const GET_TODOS_MODERADORES = gql`
    query TodosModeradores {
        todosModeradores {
            id
            email
            username
            nombre
            apellidos
            celular
            estado {
                id
                nombre
                esActivo
            }
            fechaCreacion
        }
    }
`

export const GET_MODERADOR_BY_ID = gql`
    query ModeradorPorId($id: ID!) {
        moderadorPorId(id: $id) {
            id
            email
            username
            nombre
            apellidos
            celular
            estado {
                id
                nombre
            }
        }
    }
`

export const GET_ESTADISTICAS_MODERADORES = gql`
    query EstadisticasModeradores {
        estadisticasModeradores {
            total
            activos
            inactivos
            nuevosUltimos30Dias
        }
    }
`

// ========== MUTATIONS ==========
export const CREAR_MODERADOR = gql`
    mutation CrearModerador($input: CrearModeradorInput!) {
        crearModerador(input: $input) {
            moderador {
                id
                email
                username
                nombre
                apellidos
            }
            mensaje
        }
    }
`

export const EDITAR_MODERADOR = gql`
    mutation EditarModerador($id: ID!, $input: EditarModeradorInput!) {
        editarModerador(id: $id, input: $input) {
            moderador {
                id
                nombre
                apellidos
                celular
            }
            mensaje
        }
    }
`

export const ELIMINAR_MODERADOR = gql`
    mutation EliminarModerador($id: ID!) {
        eliminarModerador(id: $id) {
            ok
            mensaje
        }
    }
`