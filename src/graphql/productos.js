import { gql } from "@apollo/client";

// ===================== QUERIES =====================

// Obtener productos de una tienda (TiendaProductoType)
export const GET_PRODUCTOS_TIENDA = gql`
  query GetProductosTienda($tiendaId: ID!) {
    productosDeTienda(tiendaId: $tiendaId) {
      id
      precio
      stock
      descripcion
      tienda{
        id
        nombre
      }
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

// Obtener un producto por ID (TiendaProductoType)
export const GET_PRODUCTO = gql`
  query GetProducto($id: ID!) {
    productoPorId(id: $id) {
      id
      nombre
      descripcion
      categoria {
        id
        nombre
      }
    }
  }
`;


// ===================== MUTATIONS =====================

// Eliminar producto
export const ELIMINAR_PRODUCTO = gql`
  mutation EliminarProducto($tiendaProductoId: ID!) {
    eliminarProducto(tiendaProductoId: $tiendaProductoId) {
      mensaje
    }
  }
`;

// Eliminar imagen
export const ELIMINAR_IMAGEN_PRODUCTO = gql`
  mutation EliminarImagenProducto($imagenId: ID!) {
    eliminarImagenProducto(imagenId: $imagenId) {
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
        descripcion
        producto {
          id
          nombre
        }
      }
    }
  }
`;

// Subir imagen
export const SUBIR_IMAGEN_PRODUCTO = gql`
  mutation SubirImagenProducto($tiendaProductoId: ID!, $imagen: Upload!) {
    subirImagenProducto(tiendaProductoId: $tiendaProductoId, imagen: $imagen) {
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
  mutation ActualizarStockPrecio($tiendaProductoId: ID!, $precio: Float, $stock: Int) {
    actualizarStockPrecio(
      tiendaProductoId: $tiendaProductoId
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

export const GET_PRODUCTOS_POR_CATEGORIA = gql`
  query ProductosPorCategoria($categoriaId: ID!) {
    productosPorCategoria(categoriaId: $categoriaId) {
      id
      precio
      descripcion
      tienda{
        id
        nombre
      }
      imagenes { archivo }
      talla { id nombre }
      producto {
        id
        nombre
        categoria { id nombre }
      }
    }
  }
`;

export const PRODUCTOS_POR_CATEGORIA = gql`
  query ProductosPorCategoria($categoriaId: ID!) {
    productosPorCategoria(categoriaId: $categoriaId) {
      id
      precio
      stock
      descripcion
      talla {
        id
        nombre
      }
      imagenes {
        archivo
      }
      producto {
        id
        nombre
        categoria {
          id
          nombre
        }
      }
      tienda {
        id
        nombre
      }
    }
  }
`
