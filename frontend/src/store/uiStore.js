import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUiStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),
      initTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
    }),
    { name: 'ui-theme' }
  )
)

export default useUiStore
