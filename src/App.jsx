import { useState, useEffect } from 'react';
import { jDate, Utils, getNotifications } from 'jcal-zmanim';
import { useSettingsData } from './settingsContext';
import './App.css';
import Settings from './settings';

const DayPart = Object.freeze({
    AfterShkia: 0,
    AfterMidnight: 1,
    AfterAlos: 2,
    AfterNetz: 4,
    AfterMidday: 8
})

function App() {
    const initialSettings = new Settings();
    const initialSDate = new Date();
    const initialJdate = new jDate(initialSDate);
    const [sdate, setSdate] = useState(initialSDate);
    const [jdate, setJdate] = useState(initialJdate);
    const { settings, setSettings } = useSettingsData(initialSettings);
    const [sunTimes, setSunTimes] = useState(initialJdate.getSunriseSunset(initialSettings.location));
    const [currentTime, setCurrentTime] = useState(Utils.timeFromDate(initialSDate));
    const [notifications, setNotifications] = useState({ dayNotes: [], tefillahNotes: [] });
    const [dayPart, setDayPart] = useState();

    useEffect(() => {
        const interval = window.setInterval(() => {
            const newDate = new Date();
            const ctime = Utils.timeFromDate(newDate);

            setSdate(newDate);
            setCurrentTime(ctime)

            //After shkia, but before midnight
            if (Utils.isTimeAfter(sunTimes.sunset, ctime) && Utils.isTimeAfter(ctime, { hour: 23, minute: 59, second: 59 })) {
                //Set the Jewish date for tomorrow
                const abs = jDate.absSd(sdate) + 1;
                setJdate(new jDate(abs));
            }
            const notifs = getNotifications(jdate, ctime, settings.location, true);
            setNotifications(notifs);

        }, 1000);
        return () => clearInterval(interval);
    });

    return (
        <>
            {notifications.dayNotes.map((n, index) =>
                <div itemID={index}>{n}</div>
            )}
            {notifications.tefillahNotes.map((n, index) =>
                <div itemID={index}>{n}</div>
            )}
            <h2>{jdate.toStringHeb()}</h2>
            <h3>{Utils.toStringDate(sdate)}</h3>
            <h1>{Utils.getTimeString(currentTime)}</h1>
            {settings && settings.zmanimToShow?settings.zmanimToShow.map((zis, index) =>
                <div></div>
            ):null}
        </>
    );
}

export default App;
