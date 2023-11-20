import React, { createContext, useContext, useEffect, useState } from "react"

const SettingsContext = createContext()

export const SettingsProvider = ({ children }) => {
    const [settings, setStateSettings] = useState({
        locationId:88,
        
    })

    useEffect(() => {
        if (window.electron && window.electron.settings) {
            setStateSettings(window.electron.settings.get());
        }
    }, [])

    const setSettings = async s => {
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
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettingsData = () => useContext(SettingsContext)
