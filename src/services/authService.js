// src/services/authService.js
import client from '../apollo/apolloClient'
import { LOGIN_MUTATION, REGISTRAR_USUARIO_MUTATION } from '../graphql/auth'

export const authService = {
    async login(email, password) {
        try {
        const { data } = await client.mutate({
            mutation: LOGIN_MUTATION,
            variables: {
            email,
            password
            }
        })

    const loginData = data.login

      // Guardar token
    localStorage.setItem('token', loginData.token)
    localStorage.setItem('userType', loginData.userType)
    localStorage.setItem('userId', loginData.userId)

      // Guardar datos del usuario según el tipo
    if (loginData.userType === 'usuario' && loginData.usuario) {
        localStorage.setItem('userData', JSON.stringify(loginData.usuario))
    } else if (loginData.userType === 'moderador' && loginData.moderador) {
        localStorage.setItem('userData', JSON.stringify(loginData.moderador))
    } else if (loginData.userType === 'superadmin' && loginData.superadmin) {
        localStorage.setItem('userData', JSON.stringify(loginData.superadmin))
    }

    return {
        success: true,
        data: loginData
        }
    } catch (error) {
    return {
        success: false,
        error: error.message
        }
    }
    },

    async registrarUsuario(userData) {
        try {
        const { data } = await client.mutate({
            mutation: REGISTRAR_USUARIO_MUTATION,
            variables: {
            input: userData
            }
        })

    const registroData = data.registrarUsuario

        // Guardar token y datos
        localStorage.setItem('token', registroData.token)
        localStorage.setItem('userType', 'usuario')
        localStorage.setItem('userId', registroData.usuario.id)
        localStorage.setItem('userData', JSON.stringify(registroData.usuario))

        return {
        success: true,
        data: registroData
        }
        } catch (error) {
        return {
            success: false,
            error: error.message
        }
        }
    },

    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('userType')
        localStorage.removeItem('userId')
        localStorage.removeItem('userData')
    },

    isAuthenticated() {
        return !!localStorage.getItem('token')
    },

    getUserType() {
        return localStorage.getItem('userType')
    },

    getUserData() {
        const userData = localStorage.getItem('userData')
        return userData ? JSON.parse(userData) : null
    }
}