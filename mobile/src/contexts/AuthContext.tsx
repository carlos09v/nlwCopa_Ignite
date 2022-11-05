import { createContext, ReactNode, useState, useEffect } from "react";
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

import { api } from '../services/api'

WebBrowser.maybeCompleteAuthSession()

// Tipagens
interface UserProps {
    name: string
    avatarUrl: string
}

export interface AuthContextDataProps {
    user: UserProps
    isUserLoading: boolean
    signIn: () => Promise<void>
}

interface AuthProviderProps {
    children: ReactNode
}

// Context + Provider
export const AuthContext = createContext({} as AuthContextDataProps)

export function AuthContextProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProps>({} as UserProps)
    const [isUserLoading, setUserLoading] = useState(false)
    
    const [req, res, promptAsync] = Google.useAuthRequest({
        clientId: process.env.CLIENT_ID,
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
        scopes: ['profile', 'email']
    })

    // URI de redirecionamento
    // console.log(AuthSession.makeRedirectUri({ useProxy: true }))

    async function signIn() {
        try {
            setUserLoading(true)
            await promptAsync()

        }catch (err) {
            console.log(err)
            throw err

        } finally {
            setUserLoading(false)
        }
    }

    async function signInWithGoogle(access_token: string) {
        try {
            setUserLoading(true)

            // Enviar e Receber o Token do Back-end
            const tokenResponse = await api.post('/users', { access_token })
            // Inserir o Token no Header das requisições
            api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`

            // Todas as requisições vão estar autenticadas
            const userInfoResponse = await api.get('/me')
            setUser(userInfoResponse.data.user)

        }catch (err) {
            console.log(err)
        }finally {
            setUserLoading(false)
        }
    }


    // Executa sempre q o componente (res) é renderizado
    useEffect(() => {
        if(res?.type === 'success' && res.authentication?.accessToken) {
            signInWithGoogle(res.authentication.accessToken)
        }
    }, [res])

    return (
        <AuthContext.Provider value={{
            signIn,
            isUserLoading,
            user
        }}>
            {children}
        </AuthContext.Provider>
    )
}