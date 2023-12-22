import {useState} from 'react';
import {useSettingsData} from "@/settingsContext";
import {Location, ZmanToShow, ZmanTypes} from "@/jcal-zmanim";
import ToggleSwitch from "@/components/toggleSwitch";
import Settings from "@/settings";
import LocationChooser from "@/components/LocationChooser";
import CloseButton from "@/components/CloseButton";

interface SettingsChooserProps {
    onChangeSettings: () => any,
    onClose:Function
}

export default function SettingsChooser({onChangeSettings, onClose}: SettingsChooserProps) {
    const {settings, setSettings} = useSettingsData();
    const [showLocationChooser, setShowLocationChooser] = useState(false);
    const eng = settings.english;

    function changeZmanToShowList(zt: ZmanToShow, checked: boolean) {
        let list: ZmanToShow[] = [...settings.zmanimToShow];
        const listHasThis = !!list.find(zts => zts.id === zt.id);
        if (checked && !listHasThis) {
            list.push(zt);
        } else if (!checked && listHasThis) {
            list = list.filter(zts => zts.id !== zt.id);
        }
        setSettings({...settings, zmanimToShow: list} as Settings);
        onChangeSettings();
    }

    function changeLocation(location: Location) {
        if (!!location) {
            setSettings({...settings, location: location} as Settings);
            setShowLocationChooser(false);
            onChangeSettings();
        }
    }

    return (
        <main style={{direction: "ltr"}}>
            {showLocationChooser
                ? <LocationChooser location={settings.location}
                                   onChangeLocation={changeLocation}
                                   eng={eng}
                                   onClose={() => setShowLocationChooser(false)}/>
                : <>
                    <section>
                        <article className='flex justify-between flex-row align-top p-2'>
                            <header className="p-4 font-bold text-lg">{eng ? 'Settings' : 'הגדרות'}</header>
                            <CloseButton onClick={() => onClose()}/>
                        </article>
                    </section>
                    <section
                        className="h-full cursor-pointer "
                    >
                        <div className="flex flex-row justify-between items-center px-4 py-1">
                            <div className="text-gray-400">{eng ? 'Location' : 'מיקום'}</div>
                            <div
                                className="text-amber-400">{eng ? settings.location.Name : (settings.location.NameHebrew || settings.location.Name)}</div>
                            <div className={`ms-3 text-sm font-medium text-blue-700`}
                                 onClick={() => setShowLocationChooser(true)}>{eng ? 'Change' : 'עריכה'}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 px-4 py-1">
                            <ToggleSwitch
                                text={eng ? 'Language' : 'שפה'}
                                onText='English'
                                offText='עברית'
                                checked={settings.english}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    english: checked
                                } as Settings)}
                            />
                            <ToggleSwitch
                                text={eng ? 'Show Notifications' : 'הצג הודעות'}
                                onText={eng ? 'Showing' : 'מציג'}
                                offText={eng ? 'Not Showing' : 'לא מציג'}
                                checked={settings.showNotifications}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    showNotifications: checked
                                } as Settings)}
                            />
                            <ToggleSwitch
                                text={eng ? 'Show Daf Yomi' : 'הצג דף היומי'}
                                onText={eng ? 'Showing' : 'מציג'}
                                offText={eng ? 'Not Showing' : 'לא מציג'}
                                checked={settings.showDafYomi}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    showDafYomi: checked
                                } as Settings)}
                            />
                            <ToggleSwitch
                                text={eng ? '24 Hour [army] Clock' : 'שעון 24 שעות'}
                                onText={eng ? 'Showing' : 'מציג'}
                                offText={eng ? 'Not Showing' : 'לא מציג'}
                                checked={settings.armyTime}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    armyTime: checked
                                } as Settings)}
                            />
                        </div>
                        <div className="flex flex-col items-start px-4 py-1 text-gray-400">
                            <ToggleSwitch
                                text={eng ? 'Show Shir-Shel-Yom of Gr"a' : 'הצג שיר של יום של הגר\"א'}
                                onText={eng ? 'Showing' : 'מציג'}
                                offText={eng ? 'Not Showing' : 'לא מציג'}
                                checked={settings.showGaonShir}
                                onChange={(checked: boolean) => setSettings({
                                    ...settings,
                                    showGaonShir: checked
                                } as Settings)}
                            />
                        </div>
                        <div className="flex flex-row justify-between items-center px-4 py-1">
                            <div
                                className="text-gray-400">{eng ? 'Minutes to show past Zmanim' : 'דקות להציג זמנים שעברו'}</div>
                            <input type="number" value={settings.minToShowPassedZman}
                                   className="text-amber-400 w-1/5 rounded text-center"
                                   onChange={e => setSettings({
                                       ...settings,
                                       minToShowPassedZman: parseInt(e.target.value)
                                   }  as Settings)}
                            />
                        </div>
                        <div className="flex flex-row justify-between items-center px-4 py-1">
                            <div className="text-gray-400">{eng ? 'Number of Zmanim to Show' : 'מספר זמנים להציג'}</div>
                            <input type="number" value={settings.numberOfItemsToShow}
                                   className="text-amber-400  w-1/5 rounded text-center"
                                   onChange={e => setSettings({
                                       ...settings,
                                       numberOfItemsToShow: parseInt(e.target.value)
                                   }  as Settings)}
                            />
                        </div>

                        <header className="p-4 font-bold text-lg">{eng ? 'Zmanim to Show' : 'זמנים להציג'}</header>
                        {ZmanTypes.map(zt =>
                            <div className="flex flex-col items-start px-4 py-1 text-gray-400" key={zt.id}>
                                <ToggleSwitch
                                    text={eng ? zt.eng : zt.heb}
                                    onText={eng ? 'Showing' : 'מציג'}
                                    offText={eng ? 'Not Showing' : 'לא מציג'}
                                    checked={!!(settings.zmanimToShow.find(zts => zts.id === zt.id))}
                                    onChange={(checked: boolean) => changeZmanToShowList(zt, checked)}
                                />
                            </div>)}
                    </section>
                </>}

        </main>
    );
}
