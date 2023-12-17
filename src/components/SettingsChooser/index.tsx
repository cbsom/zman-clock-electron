import {useState} from 'react';
import {useSettingsData} from "@/settingsContext";
import {Location, ZmanToShow, ZmanTypes} from "@/jcal-zmanim";
import ToggleSwitch from "@/components/toggleSwitch";
import Settings from "@/settings";
import LocationChooser from "@/components/LocationChooser";

export default function SettingsChooser() {
    const {settings, setSettings} = useSettingsData();
    const [showLocationChooser, setShowLocationChooser] = useState(false);

    function changeZmanToShowList(zt: ZmanToShow, checked: boolean) {
        let list: ZmanToShow[] = [...settings.zmanimToShow];
        const listHasThis = !!list.find(zts => zts.id === zt.id);
        if (checked && !listHasThis) {
            list.push(zt);
        } else if (!checked && listHasThis) {
            list = list.filter(zts => zts.id !== zt.id);
        }
        setSettings({...settings, zmanimToShow: list} as Settings);
    }

    function changeLocation(location: Location) {
        setSettings({...settings, location: location} as Settings);
    }

    return (
        <main
            className="">
            {showLocationChooser
                ? <LocationChooser location={settings.location}
                                   onChangeLocation={changeLocation}
                                   onClose={() => setShowLocationChooser(false)}/>
                : <>
                    <section className="">
                        <article>
                            <header className="p-4 font-bold text-lg">Settings</header>
                        </article>
                    </section>
                    <section
                        className="h-full cursor-pointer "
                    >
                        <div className="flex flex-row justify-between items-center px-4 py-1">
                            <div className="text-gray-400">Location</div>
                            <div className="text-amber-400">{settings.location.Name}</div>
                            <div className={`ms-3 text-sm font-medium text-blue-700`}
                                 onClick={() => setShowLocationChooser(true)}>Change
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 px-4 py-1">
                            <ToggleSwitch
                                text="Language / שפה"
                                onText='English'
                                offText='עברית'
                                checked={settings.english}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    english: checked
                                } as Settings)}
                            />
                            <ToggleSwitch
                                text="Show Notifications"
                                onText='Showing'
                                offText='Not Showing'
                                checked={settings.showNotifications}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    showNotifications: checked
                                } as Settings)}
                            />
                            <ToggleSwitch
                                text='Show Daf Yomi'
                                onText='Showing'
                                offText='Not Showing'
                                checked={settings.showDafYomi}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    showDafYomi: checked
                                } as Settings)}
                            />
                            <ToggleSwitch
                                text="Army Time"
                                onText='Showing'
                                offText='Not Showing'
                                checked={settings.armyTime}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    armyTime: checked
                                } as Settings)}
                            />
                        </div>
                        <div className="flex flex-col items-start px-4 py-1 text-gray-400">
                            <ToggleSwitch
                                text='Show Shir-Shel-Yom of Gr"a'
                                onText='Showing'
                                offText='Not Showing'
                                checked={settings.showGaonShir}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    showGaonShir: checked
                                } as Settings)}
                            />
                        </div>
                        <header className="p-4 font-bold text-lg">Zmanim to Show</header>
                        {ZmanTypes.map(zt =>
                            <div className="flex flex-col items-start px-4 py-1 text-gray-400" key={zt.id}>
                                <ToggleSwitch
                                    text={zt.eng}
                                    onText='Showing'
                                    offText='Not Showing'
                                    checked={!!(settings.zmanimToShow.find(zts => zts.id === zt.id))}
                                    onChange={(checked: boolean) => changeZmanToShowList(zt, checked)}
                                />
                            </div>)}
                    </section>
                </>}

        </main>
    );
}
