import { gql } from "@apollo/client";

export const GET_TALLAS = gql`
  query GetTallas {
    tallas {
      id
      nombre
    }
  }
`;

// Crear talla
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
`;

// Editar talla
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
`;
