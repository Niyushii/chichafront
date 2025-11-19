// src/apollo/apolloClient.js
import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { createUploadLink } from 'apollo-upload-client'
import { setContext } from '@apollo/client/link/context'

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token')
    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : '',
        },
    }
})

const uploadLink = createUploadLink({
    uri: 'http://127.0.0.1:8000/chichapi/'
})

const client = new ApolloClient({
    link: authLink.concat(uploadLink),
    cache: new InMemoryCache(),
})

export default client
