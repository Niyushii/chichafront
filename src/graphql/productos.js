import { gql } from "@apollo/client";

// Queries
// Obtener productos de una tienda
export const GET_PRODUCTOS_TIENDA = gql`
  query GetProductosTienda($tiendaId: ID!) {
    productosTienda(tiendaId: $tiendaId) {
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
        }
      }
      imagenes {
        id
        archivo
      }
    }
  }
`;

// Obtener un producto por ID
export const GET_PRODUCTO = gql`
  query GetProducto($id: ID!) {
    tiendaProducto(id: $id) {
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
        categoria { id nombre }
      }
      imagenes {
        id
        archivo
      }
    }
  }
`;

// Mutations
// Eliminar producto
export const ELIMINAR_PRODUCTO = gql`
  mutation EliminarProducto($id: ID!) {
    eliminarProducto(tiendaProductoId: $id) {
      mensaje
    }
  }
`;

// Eliminar imagen
export const ELIMINAR_IMAGEN_PRODUCTO = gql`
  mutation EliminarImagenProducto($id: ID!) {
    eliminarImagenProducto(imagenId: $id) {
      mensaje
    }
  }
`;


// Crear producto
export const CREAR_PRODUCTO = gql`
  mutation CrearProducto($input: CrearProductoInput!) {
    crearProducto(input: $input) {
      mensaje
      productoTienda {
        id
        producto {
          id
          nombre
        }
      }
    }
  }
`;

// Editar producto
export const EDITAR_PRODUCTO = gql`
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
`;

// Subir imagen
export const SUBIR_IMAGEN_PRODUCTO = gql`
  mutation SubirImagenProducto($id: ID!, $imagen: Upload!) {
    subirImagenProducto(tiendaProductoId: $id, imagen: $imagen) {
      mensaje
      imagenObj {
        id
        archivo
      }
    }
  }
`;

// Actualizar stock y precio
export const ACTUALIZAR_STOCK_PRECIO = gql`
  mutation ActualizarStockPrecio($id: ID!, $precio: Float, $stock: Int) {
    actualizarStockPrecio(
      tiendaProductoId: $id
      precio: $precio
      stock: $stock
    ) {
      mensaje
      productoTienda {
        id
        precio
        stock
      }
    }
  }
`;