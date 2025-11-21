import { gql } from '@apollo/client/core'

export const GET_VENTAS_PENDIENTES = gql`
  query VentasPendientesTienda($tiendaId: ID!) {
    ventasPendientesTienda(tiendaId: $tiendaId) {
      id
      total
      comprobante
      fechaCreacion
      usuario {
        nombre
        apellidos
        email
      }
      detalles {
        cantidad
        precioUnitario
        tiendaProducto {
          producto {
            nombre
          }
        }
      }
    }
  }
`