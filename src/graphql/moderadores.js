// src/graphql/moderador.js
import { gql } from '@apollo/client/core'

// ========== QUERIES ==========

// Usuarios
export const GET_TODOS_USUARIOS = gql`
  query TodosUsuarios($soloActivos: Boolean, $esVendedor: Boolean, $buscar: String) {
    todosUsuarios(soloActivos: $soloActivos, esVendedor: $esVendedor, buscar: $buscar) {
      id
      email
      username
      nombre
      apellidos
      celular
      fotoPerfil
      isSeller
      estado {
        id
        nombre
        esActivo
      }
      fechaCreacion
      fechaModificacion
    }
  }
`

export const GET_USUARIO_POR_ID = gql`
  query UsuarioPorId($id: ID!) {
    usuarioPorId(id: $id) {
      id
      email
      username
      nombre
      apellidos
      celular
      fotoPerfil
      isSeller
      estado {
        id
        nombre
      }
      fechaCreacion
      fechaModificacion
    }
  }
`

export const GET_ESTADISTICAS_USUARIOS = gql`
  query EstadisticasUsuarios {
    estadisticasUsuarios {
      total
      activos
      inactivos
      vendedores
      nuevosUltimos30Dias
    }
  }
`

// Tiendas
export const GET_TIENDAS_ADMIN = gql`
  query TiendasAdmin {
    tiendasAdmin {
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
        username
      }
      fechaCreacion
      fechaModificacion
    }
  }
`

// Productos (todos)
export const GET_TODOS_PRODUCTOS = gql`
  query TodosProductos($limit: Int, $offset: Int) {
    todosProductos(limit: $limit, offset: $offset) {
      id
      nombre
      descripcion
      categoria {
        id
        nombre
        icono
      }
      variantesTienda {
        id
        precio
        stock
        tienda {
          id
          nombre
        }
        talla {
          id
          nombre
        }
      }
      fechaCreacion
      fechaModificacion
    }
  }
`

export const GET_PRODUCTO_POR_ID = gql`
  query ProductoPorId($id: ID!) {
    productoPorId(id: $id) {
      id
      nombre
      descripcion
      categoria {
        id
        nombre
      }
      estado {
        id
        nombre
      }
      fechaCreacion
      fechaModificacion
    }
  }
`

// Tallas
export const GET_TALLAS = gql`
  query GetTallas {
    tallas {
      id
      nombre
      estado {
        id
        nombre
      }
      fechaCreacion
      fechaModificacion
    }
  }
`

// Auditoría
export const GET_AUDITORIA = gql`
  query Auditoria {
    auditoria {
      id
      usuarioId
      usuarioEmail
      usuarioTipo
      accion
      descripcion
      fecha
    }
  }
`
export const GET_AUDITORIA_USUARIO = gql`
  query ObtenerAuditoriaUsuarios {
  auditoriaUsuarios {
    id
    usuarioId
    usuarioEmail
    accion
    descripcion
    fecha
  }
}
`
// Tallas
export const CREAR_TALLA = gql`
  mutation CrearTalla($input: CrearTallaInput!) {
    crearTalla(input: $input) {
      mensaje
      talla {
        id
        nombre
      }
    }
  }
`

export const EDITAR_TALLA = gql`
  mutation EditarTalla($id: ID!, $input: EditarTallaInput!) {
    editarTalla(id: $id, input: $input) {
      mensaje
      talla {
        id
        nombre
      }
    }
  }
`

export const ELIMINAR_TALLA = gql`
  mutation EliminarTalla($id: ID!) {
    eliminarTalla(id: $id) {
      ok
      mensaje
    }
  }
`

export const CREAR_TALLAS_MASIVAS = gql`
  mutation CrearTallasMasivas($nombres: [String]!) {
    crearTallasMasivas(nombres: $nombres) {
      tallas {
        id
        nombre
      }
      cantidadCreadas
      mensaje
      errores
    }
  }
`

// Productos (edición por moderador)
export const EDITAR_PRODUCTO_MOD = gql`
  mutation EditarProducto($input: EditarProductoInput!) {
    editarProducto(input: $input) {
      mensaje
      productoTienda {
        id
        precio
        stock
      }
    }
  }
`

export const ELIMINAR_PRODUCTO_MOD = gql`
  mutation EliminarProducto($tiendaProductoId: ID!) {
    eliminarProducto(tiendaProductoId: $tiendaProductoId) {
      mensaje
    }
  }
`

// Tiendas (eliminación por moderador)
export const ELIMINAR_TIENDA_MOD = gql`
  mutation EliminarTienda($id: ID!) {
    eliminarTienda(id: $id) {
      ok
      mensaje
    }
  }
`

export const EDITAR_TIENDA_MOD = gql`
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