import { createContext, PropsWithChildren, useContext, useState } from "react";

export interface AppSetting {
    soundEnable: boolean;
    gameLevel: number
}

export interface SettingContextValue {
    setting: AppSetting
    set: (data: Partial<AppSetting>) => void;
}

export const SettingContext = createContext<SettingContextValue | null>(null)

export function SettingProvider({ children }: PropsWithChildren) {
    const [setting, setSetting] = useState<AppSetting>({ soundEnable: false, gameLevel: 1 })

    const set = (data: Partial<AppSetting>) => {
        setSetting(prev => ({ ...prev, ...data }))
    }

    return <SettingContext.Provider value={{ setting, set }}>
        {children}
    </SettingContext.Provider>
}

export function useSetting() {
    const ctx = useContext(SettingContext)
    if (!ctx) throw new Error("useSetting must be used within <SettingProvider/>")
    return ctx
}