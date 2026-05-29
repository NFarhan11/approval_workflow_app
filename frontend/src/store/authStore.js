import { create } from 'zustand'

const parseUser = () => {
    try { return JSON.parse(localStorage.getItem('user')) }
    catch { localStorage.removeItem('user'); return null }
}

const useAuthStore = create((set) => ({
    user:  parseUser(),
    token: localStorage.getItem('token') ?? null,

    login: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)
        set({ user, token })
    },

    logout: () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        set({ user: null, token: null })
    },

    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user))
        set({ user })
    },
}))

export default useAuthStore
