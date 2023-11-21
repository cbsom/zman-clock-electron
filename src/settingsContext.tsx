import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from "react"
import Settings from "./settings";

interface SettingsContextType {
    settings: Settings, setSettings: Function;
}

declare global {
    interface Window {
        electron: { settings: { get: Function, set: Function } }
    }
}

const SettingsContext = createContext<SettingsContextType>({ settings: (new Settings()), setSettings: ((s: Settings) =>{}) });

export const SettingsProvider = (props: PropsWithChildren) => {
    const [settings, setStateSettings] = useState<Settings>((new Settings()))

    useEffect(() => {
        if (window.electron && window.electron.settings) {
            setStateSettings(window.electron.settings.get());
        }
    }, [])

    const setSettings = async (s: Settings) => {
        setStateSettings(s);
        if (window.electron && window.electron.settings) {
            window.electron.settings.set(s);
        }
    }

    return (
        <SettingsContext.Provider
            value={{
                settings,
                setSettings
            }}
        >
            {props.children}
        </SettingsContext.Provider>
    )
}

export const useSettingsData = () => useContext(SettingsContext)
