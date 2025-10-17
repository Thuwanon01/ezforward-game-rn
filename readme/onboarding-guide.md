# Onboarding Guide (Expo React Native)

Audience: Developers with Vue.js background, new to React/React Native.

## 1) Vue → React quick map
- Templates vs JSX
  - Vue: `<template>` + directives (`v-if`, `v-for`, `v-model`)
  - React: JSX inside functions; use plain JS for conditionals/loops; no directives
- Reactive state
  - Vue: `ref`, `reactive`, `computed`
  - React: `useState`, `useReducer`, `useMemo`
- Lifecycle
  - Vue: `onMounted`, `watch`
  - React: `useEffect` for side effects; dependency array controls when it runs
- Events
  - Vue: `@click="..."`
  - React: `onClick={...}` (web) or `onPress` on RN components
- Two-way binding
  - Vue: `v-model`
  - React: controlled inputs (`value` + `onChange`/`onChangeText`)
- Props/Emits vs Props/Callbacks
  - Vue: `defineProps`, `defineEmits`
  - React: props as function args; callbacks passed via props
- Slots vs Children
  - Vue: `<slot>`
  - React: `children` or render props

Tiny examples:

Counter (Vue)
```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
<template>
  <button @click="count++">{{ count }}</button>
</template>
```

Counter (React)
```tsx
import { useState } from 'react'
export default function Counter(){
  const [count, setCount] = useState(0)
  return <button onPress={() => setCount(c => c + 1)}>{count}</button>
}
```

Controlled input (React Native)
```tsx
const [text, setText] = useState('')
<TextInput value={text} onChangeText={setText} />
```

## 2) Project overview (this repo)
- Runtime: Expo + React Native 0.81, React 19
- Routing: expo-router with file-based routes under `app/`
  - `app/_layout.tsx`: wraps the app with providers (GluestackUIProvider, AuthProvider) and defines the Stack
  - `app/index.tsx`: redirects to `/login`
  - `app/(auth)/_layout.tsx`: protected group; checks auth and redirects to `/login` if needed
- State: Auth via React Context (`contexts/AuthContext.tsx`)
  - Stores `user`, `accessToken`, `refreshToken`
  - Persists tokens in AsyncStorage
  - `autoLogin()` tries refresh and loads current user
- Data layer: Repository pattern in `apis/`
  - `BaseRepository`: `ofetch` wrappers, `sfetch` adds `Authorization: Bearer <token>`
  - `AuthRepository`: login, refresh, current user
  - `GameRepository`/`GameV2Repository`: quiz endpoints
  - `hooks/useRepositories.ts`: builds repositories with `EXPO_PUBLIC_API_BASE_URL` (default: `https://uat-ezram-game-service.ez-zone.com`)
- UI/Styling
  - NativeWind + Tailwind classes (`global.css`, `tailwind.config.js`)
  - Gluestack UI provider (`components/ui/gluestack-ui-provider/*`) sets CSS variables and overlay/toast providers
- Utilities: `utils/sound.ts` uses `expo-av` for effects
- Tooling: `babel.config.js` (module alias `@` to project root, nativewind preset, reanimated plugin); `metro.config.js` (SVG transformer); TS config with path alias

Key files:
- `app/_layout.tsx` – root providers + Stack
- `app/login.tsx` – login screen using `useAuth()`
- `app/(auth)/_layout.tsx` – gate protected routes via `autoLogin`
- `app/(auth)/game.tsx` – quiz flow using GameV2Repository

## 3) Running locally
1. Install deps
```bash
npm install
```
2. Optionally set API base URL (uses default if omitted)
```bash
EXPO_PUBLIC_API_BASE_URL="https://your-api.example.com" npx expo start
```
3. Launch on device/simulator/web from the Expo UI.

## 4) Hands-on onboarding exercise (2–3 hours)
Goal: Build a small feature that touches routing, context, data fetching, and styling.

### Task A — Add a Profile screen in the protected area
- Create `app/(auth)/profile.tsx`
- Display current user from `useAuth()` (username + id)
- Add a "Logout" button calling `auth.logout()` and navigate to `/login`
- Style with NativeWind classes

Acceptance criteria:
- Navigating to `/profile` shows user info if logged in; otherwise you’re redirected to `/login` by the `(auth)` gate
- Tapping Logout clears tokens and returns to `/login`

Hints:
```tsx
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'expo-router'
export default function Profile(){
  const auth = useAuth()
  const router = useRouter()
  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Text className="text-xl font-bold">{auth.user?.username}</Text>
      <Button title="Logout" onPress={async() => { await auth.logout(); router.replace('/login') }} />
    </View>
  )
}
```

### Task B — Add a lightweight health check in the data layer and display it
- In `apis/`, add a method on `GameV2Repository` (or a new `SystemRepository`) to GET `/api/health/` (or any simple endpoint your backend exposes)
- Create `app/(auth)/health.tsx` that calls the method via `useRepositories(auth.accessToken)` and shows status text

Acceptance criteria:
- Visiting `/health` shows a loading state, then the server status or an error message

Hints:
```tsx
const repos = useRepositories(auth.accessToken).current
const [status, setStatus] = useState<string>('Loading...')
useEffect(() => { (async () => {
  try { const data = await repos.system.health(); setStatus(JSON.stringify(data)) }
  catch (e) { setStatus('Failed to fetch health') }
})() }, [])
```

### Task C — Use a custom UI component with NativeWind
- Pick one lab component (e.g. `components/lab/TextButton.tsx` or `ChoiceBox`) and render it on a new page `app/lab/ui-playground.tsx`
- Apply at least three Tailwind utility classes and confirm hot-reload styling works

Acceptance criteria:
- Page renders component, and class changes reflect immediately

## 5) Common gotchas when switching from Vue
- No built-in two-way binding: wire `value` + `onChangeText`
- `useEffect` dependencies matter; leaving them out runs on every render
- State updates are async; use updater form `setState(prev => ...)` when deriving from previous state
- RN styling uses Flexbox; no CSS selectors. Use `className` with NativeWind
- Navigation is route-file driven; move shared guards to layout files (like `(auth)/_layout.tsx`)

## 6) Suggested next steps
- Add typed API responses end-to-end (interfaces already present in `apis/types.ts`)
- Centralize token refresh/error handling (e.g., handle 401 in one place and auto-logout)
- Introduce React Query or SWR for data fetching and caching if the app grows
- Add unit tests for repositories and the AuthContext behavior

