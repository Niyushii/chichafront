// src/graphql/mutations/auth.js
import { gql } from '@apollo/client/core'

export const LOGIN_MUTATION = gql`
    mutation Login($email: String!, $password: String!) {
        login(input: { email: $email, password: $password }) {
        token
        userType
        userId
        usuario {
            id
            email
            username
            nombre
            apellidos
            celular
            fotoPerfil
            isSeller
        }
        moderador {
            id
            email
            username
            nombre
            apellidos
            celular
        }
        superadmin {
            id
            email
            username
        }
        mensaje
        }
    }
`

export const REGISTRAR_USUARIO_MUTATION = gql`
    mutation RegistrarUsuario($input: RegistroUsuarioInput!) {
        registrarUsuario(input: $input) {
        usuario {
            id
            email
            username
            nombre
            apellidos
        }
        token
        mensaje
        }
    }
`