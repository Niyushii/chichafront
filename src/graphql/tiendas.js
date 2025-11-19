// src/graphql/tiendas.js
import { gql } from '@apollo/client/core'

// ========== QUERIES ==========
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

export const GET_TIENDA_BY_ID = gql`
  query TiendaPorId($id: ID!) {
    tiendaPorId(id: $id) {
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

export const GET_TODAS_TIENDAS = gql`
  query TodasTiendas($soloActivas: Boolean) {
    todasTiendas(soloActivas: $soloActivas) {
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

