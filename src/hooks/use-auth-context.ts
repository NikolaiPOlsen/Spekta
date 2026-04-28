import { createContext, useContext } from 'react'

export type AuthData = {
    claims?: Record<string, any> | null
    isLoading: boolean
    isInitializingUser: boolean
    isUserInitialized: boolean
    initializationError: string | null
    isLoggedIn: boolean
}

export const AuthContext = createContext<AuthData | undefined>(undefined)

export function useAuthContext() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }

    return context
}
