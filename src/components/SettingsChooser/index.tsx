import React from "react";
import {useSettingsData} from "@/settingsContext";

const {settings, setSettings} = useSettingsData();
export default function SettingsChooser() {
    return (
        <main
            className="">
            <section className="">
                <article>
                    <header className="p-4 font-bold text-lg">Header</header>

                </article>
            </section>
            <section
                className=" w-screen h-full cursor-pointer "
                onClick={() => {
                    setSettings(false);
                }}
            ></section>
        </main>
    );
}
