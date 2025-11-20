// src/graphql/tiendas.js
import { gql } from '@apollo/client/core'

// ========== QUERIES PRIVADAS (con token) ==========
export const GET_MIS_TIENDAS = gql`
  query MisTiendas {
    misTiendas {
      id
      nombre
      descripcion
      telefono
      direccion
      fotoPerfil
      codigoQr
      estado {
        id
        nombre
      }
      propietario {
        id
        nombre
        apellidos
        email
      }
      fechaCreacion
      fechaModificacion
    }
  }
`

export const GET_MI_TIENDA = gql`
  query MiTienda($id: ID!) {
    miTienda(id: $id) {
      id
      nombre
      descripcion
      telefono
      direccion
      fotoPerfil
      codigoQr
      estado {
        id
        nombre
      }
      propietario {
        id
        nombre
        apellidos
        email
        celular
      }
      fechaCreacion
      fechaModificacion
    }
  }
`

// ========== QUERIES PÚBLICAS (sin token) ==========
export const GET_TIENDA_PUBLICA = gql`
  query TiendaPublica($id: ID!) {
    tiendaPublica(id: $id) {
      id
      nombre
      descripcion
      telefono
      direccion
      fotoPerfil
      codigoQr
      estado {
        nombre
      }
      propietario {
        nombre
        apellidos
      }
      fechaCreacion
    }
  }
`

export const GET_TIENDAS_PUBLICAS = gql`
  query TiendasPublicas {
    tiendasPublicas {
      id
      nombre
      descripcion
      telefono
      direccion
      fotoPerfil
      estado {
        nombre
      }
      propietario {
        nombre
        apellidos
      }
      fechaCreacion
    }
  }
`

// ========== MUTATIONS ==========
export const CREAR_TIENDA = gql`
  mutation CrearTienda($input: CrearTiendaInput!, $fotoPerfil: Upload, $codigoQr: Upload) {
    crearTienda(input: $input, fotoPerfil: $fotoPerfil, codigoQr: $codigoQr) {
      tienda {
        id
        nombre
        descripcion
        telefono
        direccion
        fotoPerfil
        codigoQr
      }
      mensaje
    }
  }
`

export const EDITAR_TIENDA = gql`
  mutation EditarTienda($id: ID!, $input: EditarTiendaInput!, $fotoPerfil: Upload, $codigoQr: Upload) {
    editarTienda(id: $id, input: $input, fotoPerfil: $fotoPerfil, codigoQr: $codigoQr) {
      tienda {
        id
        nombre
        descripcion
        telefono
        direccion
        fotoPerfil
        codigoQr
      }
      mensaje
    }
  }
`

export const ELIMINAR_TIENDA = gql`
  mutation EliminarTienda($id: ID!) {
    eliminarTienda(id: $id) {
      ok
      mensaje
    }
  }
`

export const ELIMINAR_FOTO_PERFIL = gql`
  mutation EliminarFotoPerfil($tiendaId: ID!) {
    eliminarFotoPerfil(tiendaId: $tiendaId) {
      ok
      mensaje
    }
  }
`

export const ELIMINAR_CODIGO_QR = gql`
  mutation EliminarCodigoQr($tiendaId: ID!) {
    eliminarCodigoQr(tiendaId: $tiendaId) {
      ok
      mensaje
    }
  }
`