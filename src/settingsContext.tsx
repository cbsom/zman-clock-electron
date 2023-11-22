import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from "react"
import Settings from "./settings";

interface SettingsContextType {
    settings: Settings, setSettings: Function;
}

declare global {
    interface Window {
        electron: { setSettings: Function }
    }
}

const initialSettings = new Settings();
const SettingsContext = createContext<SettingsContextType>({ settings: (initialSettings), setSettings: ((s: Settings) =>{}) });

export const SettingsProvider = (props: PropsWithChildren) => {
    const [settings, setStateSettings] = useState<Settings>((new Settings()))

    useEffect(() => {
        if (window.electron && window.electron.setSettings) {
            setStateSettings(window.electron.setSettings());            
        }
    }, [])

    const setSettings = async (s: Settings) => {
        setStateSettings(s);
        if (window.electron && window.electron.setSettings) {
            window.electron.setSettings(s);
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
