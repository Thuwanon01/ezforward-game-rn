import useRepositories from '@/hooks/useRepositories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useState } from "react";

interface AuthContextType {
    user: User | null;
    accessToken: string;
    refreshToken: string;
    login: (username: string, password: string) => Promise<void>;
    autoLogin: () => Promise<boolean>;
    logout: () => Promise<void>;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

interface User {
    username: string;
    id: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string>("");
    const [refreshToken, setRefreshToken] = useState<string>("");
    const repos = useRepositories("").current;

    async function login(username: string, password: string) {
        // ยิง POST Request ไปยัง API หลังบ้าน เพื่อขอ Token
        const response = await repos.auth.login(username, password)

        // ถ้าสำเร็จ (response.status === 200-299)
        const { access, refresh } = response;

        // นำ Token ไปเก็บไว้ใน AsyncStorage
        await AsyncStorage.setItem('accessToken', access);
        await AsyncStorage.setItem('refreshToken', refresh);

        // ยิง GET Request ขอ User
        const user = await repos.auth.getLoggedInUser();

        setUser({ id: user.id, username: user.username }); // Example user object
        setAccessToken(access)
        setRefreshToken(refresh)
    }

    async function logout() {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        setUser(null);
        setAccessToken("");
        setRefreshToken("");
    }

    async function autoLogin(): Promise<boolean> {
        const refreshToken = await AsyncStorage.getItem('refreshToken')
        if (!refreshToken) {
            return false
        }

        const data = await repos.auth.loginWithRefreshToken(refreshToken)
        const { access, refresh } = data
        await AsyncStorage.setItem('accessToken', access);
        await AsyncStorage.setItem('refreshToken', refresh);

        // ยิง GET Request ขอ User
        try {
            const user = await repos.auth.getLoggedInUser();
            setUser({ id: user.id, username: user.username }); // Example user object
            setAccessToken(access)
            setRefreshToken(refresh)
            return true
        } catch (error) {
            console.error(error)
            return false;
        }

    }

    return (
        <AuthContext.Provider value={{ user, accessToken, refreshToken, login, autoLogin, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
