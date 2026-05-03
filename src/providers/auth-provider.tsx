import { AuthContext } from '@/hooks/use-auth-context'
import { initializeUserProfile } from '@/features/auth/services'
import { supabase } from '@/lib/supabase'
import { PropsWithChildren, useEffect, useState } from 'react'

export default function AuthProvider({ children }: PropsWithChildren) {
  const [claims, setClaims] = useState<Record<string, any> | undefined | null>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitializingUser, setIsInitializingUser] = useState(false)
  const [isUserInitialized, setIsUserInitialized] = useState(false)
  const [initializationError, setInitializationError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true)

      const { data, error } = await supabase.auth.getClaims()

      if (error) {
        console.error('Error fetching claims:', error)
      }

      setClaims(data?.claims ?? null)
      setIsLoading(false)
    }

    fetchClaims()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      if (_session) {
        setClaims({ ..._session.user, sub: _session.user.id })
      } else {
        setClaims(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const userId = claims?.sub

    if (!userId) {
      setIsInitializingUser(false)
      setIsUserInitialized(false)
      setInitializationError(null)
      return
    }

    let isActive = true

    const bootstrapUser = async () => {
      setIsInitializingUser(true)
      setInitializationError(null)

      try {
        await initializeUserProfile()

        if (isActive) {
          setIsUserInitialized(true)
          setInitializationError(null)
        }
      } catch (error) {
        console.error('Error initializing user weights:', error)

        if (isActive) {
          setIsUserInitialized(false)
          setInitializationError(
            error instanceof Error ? error.message : 'Failed to initialize user weights',
          )
        }
      } finally {
        if (isActive) {
          setIsInitializingUser(false)
        }
      }
    }

    bootstrapUser()

    return () => {
      isActive = false
    }
  }, [claims?.sub])

  return (
    <AuthContext.Provider
      value={{
        claims,
        isLoading,
        isInitializingUser,
        isUserInitialized,
        initializationError,
        isLoggedIn: claims != null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
