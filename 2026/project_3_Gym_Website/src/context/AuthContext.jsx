import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/client.js'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    async function fetchProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Failed to fetch profile:', error.message)
            setProfile(null)
        } else {
            setProfile(data)
        }
    }

    useEffect(() => {
        // Get current session on first load
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes (login, logout, token refresh)
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }
                setLoading(false)
            }
        )

        return () => listener.subscription.unsubscribe()
    }, [])

    async function signUp(email, password, fullName) {
        // 1. Sign up the user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        })

        // 2. If successful, manually create their profile row
        if (!error && data?.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        role: 'member'
                    }
                ])

            if (profileError) {
                console.error("Profile creation failed:", profileError.message)
            } else {
                // Fetch the newly created profile so the app updates immediately
                await fetchProfile(data.user.id)
            }
        }

        return { data, error }
    }

    async function signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    const value = {
        user,
        profile,
        role: profile?.role ?? null,
        loading,
        signUp,
        signIn,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}