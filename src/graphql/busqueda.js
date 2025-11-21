// src/graphql/busqueda.js
import { gql } from '@apollo/client/core'

export const BUSQUEDA_GENERAL = gql`
  query BusquedaGeneral(
    $texto: String!
    $limiteProductos: Int
    $limiteTiendas: Int
  ) {
    busquedaGeneral(
      texto: $texto
      limiteProductos: $limiteProductos
      limiteTiendas: $limiteTiendas
    ) {
      productos {
        id
        precio
        stock
        descripcion
        talla {
          id
          nombre
        }
        producto {
          id
          nombre
          descripcion
          categoria {
            id
            nombre
            icono
          }
        }
        tienda {
          id
          nombre
          descripcion
          fotoPerfil
          propietario {
            id
            nombre
            apellidos
          }
        }
        imagenes {
          id
          archivo
        }
      }
      tiendas {
        id
        nombre
        descripcion
        telefono
        direccion
        fotoPerfil
        codigoQr
        propietario {
          id
          nombre
          apellidos
          username
        }
        estado {
          id
          nombre
        }
        fechaCreacion
      }
      totalProductos
      totalTiendas
    }
  }
`