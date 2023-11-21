import { useState, useEffect } from 'react';
import UpdateElectron from '@/components/update';
import { jDate, Utils, getNotifications, ZmanimUtils, Zmanim } from './jcal-zmanim';
import { useSettingsData } from './settingsContext';
import Settings from './settings';
import './App.css';
import { Time, ZmanToShow } from './jcal-zmanim/jcal-zmanim';

function App() {
    const initialSettings = new Settings();
    const initialSDate = new Date();
    const initialJdate = new jDate(initialSDate);
    const { settings, setSettings } = useSettingsData();

    const [sdate, setSdate] = useState(initialSDate);
    const [jdate, setJdate] = useState(initialJdate);
    const [sunTimes, setSunTimes] = useState(
        initialJdate.getSunriseSunset(initialSettings.location)
    );
    const [currentTime, setCurrentTime] = useState(Utils.timeFromDate(initialSDate));
    const [notifications, setNotifications] = useState<{
        dayNotes: string[];
        tefillahNotes: string[];
    }>({ dayNotes: [], tefillahNotes: [] });
    const [shulZmanim, setShulZmanim] = useState(
        ZmanimUtils.getBasicShulZmanim(initialSDate, initialSettings.location)
    );

    useEffect(() => {
        const interval = window.setInterval(() => {
            const newDate = new Date();
            const ctime = Utils.timeFromDate(newDate);

            setSdate(newDate);
            setCurrentTime(ctime);

            //After shkia, but before midnight
            if (
                Utils.isTimeAfter(sunTimes.sunset, ctime) &&
                Utils.isTimeAfter(ctime, { hour: 23, minute: 59, second: 59 })
            ) {
                //Set the Jewish date for tomorrow
                const abs = jDate.absSd(sdate) + 1;
                setJdate(new jDate(abs));
            }
            const notifs = getNotifications(jdate, ctime, settings.location, true);
            setNotifications(notifs);
        }, 1000);
        return () => clearInterval(interval);
    });

    const refresh = () => {
        const sd = new Date(),
            nowTime = Utils.timeFromDate(sd);

        if (!needsZmanRefresh(sd, nowTime)) {
            if (
                Utils.isSameSdate(jdate.getDate(), sd) &&
                Utils.isTimeAfter(sunTimes.sunset, nowTime)
            ) {
                setJdate(jdate.addDays(1));
            }
            setSdate(sd);
            setCurrentTime(nowTime);
            setJdate(jdate);
        } else {
            console.log('Refreshing all zmanim');
            const sunset = Zmanim.getSunTimes(sd, settings.location).sunset,
                jdate = Utils.isTimeAfter(sunset, nowTime)
                    ? new jDate(Utils.addDaysToSdate(sd, 1))
                    : new jDate(sd),
                zmanTimes = ZmanimUtils.getCorrectZmanTimes(
                    sd,
                    nowTime,
                    settings.location,
                    settings.zmanimToShow,
                    settings.minToShowPassedZman,
                    sunTimes.sunset as Time
                );
            this.setState({ zmanTimes, sd, nowTime, sunset, jdate });
            this.shulZmanim = AppUtils.getBasicShulZmanim(sd, jdate, location);
        }
        this.setNotifications();
    };

    const needsZmanRefresh = (sd: Date, nowTime: Time) => {
        if (
            !this.state.sd ||
            sd.getDate() !== this.state.sd.getDate() ||
            this.state.zmanTimes.some(
                /**
                 * @param {{ isTomorrow: any; time: { hour: number; minute: number; second: number; }; }} zt
                 */
                zt =>
                    !zt.isTomorrow &&
                    Utils.totalMinutes(nowTime) - Utils.totalMinutes(zt.time) >=
                        this.state.settings.minToShowPassedZman
            )
        ) {
            return true;
        } else {
            return false;
        }
    };

    return (
        <div className='App'>
            {notifications.dayNotes.map((n, index) => (
                <div itemID={index.toString()}>{n}</div>
            ))}
            {notifications.tefillahNotes.map((n, index) => (
                <div itemID={index.toString()}>{n}</div>
            ))}
            <h2>{jdate.toStringHeb()}</h2>
            <h3>{Utils.toStringDate(sdate)}</h3>
            <h1>{Utils.getTimeString(currentTime)}</h1>
            {settings && settings.zmanimToShow
                ? settings.zmanimToShow.map((zis, index) => <div></div>)
                : null}

            <div className='flex-center'>
                Place static files into the<code>/public</code> folder{' '}
                <img style={{ width: '5em' }} src='./node.svg' alt='Node logo' />
            </div>

            <UpdateElectron />
        </div>
    );
}

export default App;
