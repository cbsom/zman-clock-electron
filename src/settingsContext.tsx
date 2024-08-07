import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from "react"
import Settings from "./settings";
import { __DEV__ } from "@/jcal-zmanim/Utils";
import { closestDistanceMatch } from "./jcal-zmanim";

interface SettingsContextType {
    settings: Settings,

    setSettings(settings: Settings): any;
}

declare global {
    interface Window {
        electron: { settings: { get: Function, set: Function } }
    }
}

const initialSettings = new Settings();
const SettingsContext = createContext<SettingsContextType>({
    settings: (initialSettings),
    setSettings: (async (_: Settings) => {
    })
});

export const SettingsProvider = (props: PropsWithChildren) => {
    const [settings, setStateSettings] = useState<Settings>((new Settings()))

    useEffect(() => {
        if (window.electron && window.electron.settings) {
            const s = window.electron.settings.get();
            if (!!s) {
                setStateSettings(s);
                __DEV__ && console.log('getSettings', s)
            }
        } else {
            const s = localStorage.getItem('Settings')
            if (s) {
                const sObj = JSON.parse(s);
                setStateSettings(sObj);
                __DEV__ && console.log('get local storage settings', sObj)
            }
            //First time load
            else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        const { latitude, longitude } = position.coords;
                        const location = closestDistanceMatch({ latitude, longitude });
                        if (location) {
                            const s = { ...settings, location } as Settings;
                            setSettings(s);
                        }
                    });
                }
            }
        }
    }, [])

    const setSettings = async (s: Settings) => {
        if (window.electron && window.electron.settings) {
            window.electron.settings.set(s);
            setStateSettings(s);
            __DEV__ && console.log('setSettings', s)
        }

        const sStr = JSON.stringify(s)
        localStorage.setItem('Settings', sStr);
        setStateSettings(s);
        __DEV__ && console.log('set localstorage settings', s)
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
