import {useState, useEffect} from "react";
import {jDate, Utils, getNotifications, ZmanimUtils, Zmanim} from "../jcal-zmanim";
import {useSettingsData} from "@/settingsContext";
import Settings from "../settings";
import {SingleZman} from "@/components/SingleZman";
import Drawer from "@/components/Drawer";
import SettingsChooser from "@/components/SettingsChooser";
import "./index.tsx.css";

import type {SunTimes, Time, ShulZmanimType, ZmanTime} from "@/jcal-zmanim";

function App() {
    const initialSettings = new Settings();
    const initialSDate = new Date();
    const initialJdate = new jDate(initialSDate);
    const {settings} = useSettingsData();

    const [sdate, setSdate] = useState<Date>(initialSDate);
    const [jdate, setJdate] = useState<jDate>(initialJdate);
    const [sunTimes] = useState<SunTimes>(
        initialJdate.getSunriseSunset(initialSettings.location)
    );
    const [currentTime, setCurrentTime] = useState<Time>(Utils.timeFromDate(initialSDate));
    const [notifications, setNotifications] = useState<{
        dayNotes: string[];
        tefillahNotes: string[];
    } | null>({dayNotes: [], tefillahNotes: []});
    const [shulZmanim, setShulZmanim] = useState<ShulZmanimType>(
        ZmanimUtils.getBasicShulZmanim(initialSDate, initialSettings.location) as ShulZmanimType
    );
    const [zmanTimes, setZmanTimes] = useState<ZmanTime[]>();
    const [needsFullRefresh, setNeedsFullRefresh] = useState(true);
    const [needsNotificationsRefresh, setNeedsNotificationsRefresh] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    //Run once
    useEffect(() => {
        setInitialData();
    }, []);

    //Run repeatedly
    useEffect(() => {
        const interval = window.setInterval(refresh, 1000);
        return () => clearInterval(interval);
    });

    const setInitialData = () => {
        setNeedsNotificationsRefresh(true);
        setNeedsFullRefresh(true);
    };
    const refresh = () => {
        const sd = new Date(),
            nowTime = Utils.timeFromDate(sd);

        if (!needsFullRefresh && !needsZmanRefresh(sd, nowTime)) {
            if (Utils.isSameSdate(jdate.getDate(), sd) && Utils.isTimeAfter(sunTimes.sunset, nowTime)) {
                setJdate(jdate.addDays(1));
            }
            setSdate(sd);
            setCurrentTime(nowTime);
            setJdate(jdate);
        } else {
            console.log("Refreshing all zmanim");
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
            setZmanTimes(zmanTimes);
            setSdate(sd);
            setJdate(jdate);
            setCurrentTime(nowTime);
            setShulZmanim(ZmanimUtils.getBasicShulZmanim(sd, settings.location) as ShulZmanimType);
        }
        fillNotifications();
        setNeedsFullRefresh(false);
    };
    const isPastShulZman = () => {
        const nowTime = currentTime,
            {chatzosHayom, chatzosHalayla, alos, shkia} = shulZmanim;

        //Notifications need refreshing by chatzos, alos and shkia
        if (shkia && Utils.isTimeAfter(shkia, nowTime)) {
            //We only want to refresh the notifications one time
            shulZmanim.shkia = undefined;
            //Nullify passed zmanim, we are refreshing anyway.
            shulZmanim.alos = undefined;
            shulZmanim.chatzosHayom = undefined;
            if (chatzosHalayla && chatzosHalayla.hour < 12) {
                shulZmanim.chatzosHalayla = undefined;
            }
            console.log("Refreshing notifications due to shkia.");
            return true;
        } else if (chatzosHayom && Utils.isTimeAfter(chatzosHayom, nowTime)) {
            //We only want to refresh the notifications one time
            shulZmanim.chatzosHayom = undefined;
            //Nullify passed zmanim, we are refreshing anyway.
            shulZmanim.alos = undefined;
            if (chatzosHalayla && chatzosHalayla.hour < 12) {
                shulZmanim.chatzosHalayla = undefined;
            }
            console.log("Refreshing notifications due to chatzos hayom.");
            return true;
        } else if (alos && Utils.isTimeAfter(alos, nowTime)) {
            //We only want to refresh the notifications one time
            shulZmanim.alos = undefined;
            //Nullify passed zmanim, we are refreshing anyway.
            if (chatzosHalayla && chatzosHalayla.hour < 12) {
                shulZmanim.chatzosHalayla = undefined;
            }
            console.log("Refreshing notifications due to alos.");
            return true;
        } else if (chatzosHalayla && Utils.isTimeAfter(chatzosHalayla, nowTime)) {
            //We only want to refresh the notifications one time
            shulZmanim.chatzosHalayla = undefined;
            console.log("Refreshing notifications due to chatzosHalayla.");
            return true;
        }
        return false;
    };
    const fillNotifications = () => {
        if (settings.showNotifications) {
            if (needsFullRefresh || needsNotificationsRefresh || isPastShulZman()) {
                const notifications = getNotifications(
                    jdate,
                    currentTime,
                    settings.location,
                    settings.english,
                    settings.showGaonShir,
                    settings.showDafYomi
                );
                setNeedsNotificationsRefresh(false);
                setNotifications(notifications);
                console.log("Refreshing notifications: ", jdate, sdate, currentTime);
            }
        } else if (
            notifications &&
            (notifications.dayNotes.length || notifications.tefillahNotes.length)
        ) {
            //If setting is off, hide all notifications
            setNotifications(null);
        }
    };
    const needsZmanRefresh = (sd: Date, nowTime: Time) => {
        return needsFullRefresh || !sdate ||
            sd.getDate() !== sdate.getDate() ||
            !zmanTimes ||
            zmanTimes.some(
                (zt) =>
                    !zt.isTomorrow &&
                    Utils.totalMinutes(nowTime) - Utils.totalMinutes(zt.time) >= settings.minToShowPassedZman
            );
    };

    return (
        <div className="app" style={{direction: settings.english ? 'ltr' : 'rtl'}}>
            <div className="fixed top-7 right-3 z-10">
                <a
                    href="#"
                    data-te-ripple-init={true}
                    data-te-ripple-color="light"
                    className="cursor-pointer p-5"
                    onClick={() => setIsDrawerOpen(true)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-5 w-5">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        />
                    </svg>
                </a>
            </div>
            <div className="top-section">
                <h4>{settings.english
                    ? settings.location.Name
                    : (!!settings.location.NameHebrew
                        ? settings.location.NameHebrew
                        : settings.location.Name)}</h4>
                <h2 className="date-text">{settings.english ? jdate.toString() : jdate.toStringHeb()}</h2>
                <h3 className="s-date-text">
                    {settings.english
                        ? Utils.toStringDate(sdate)
                        : Utils.toShortStringDate(sdate, !settings.location.Israel)}
                </h3>
                {!!notifications?.dayNotes && notifications.dayNotes.length > 0 && (
                    <div className="day-notes-inner-view">
                        {notifications.dayNotes.map((n, index) => (
                            <div className="day-notes-text" key={index.toString()}>
                                {n}
                            </div>
                        ))}
                    </div>
                )}
                {!!notifications?.tefillahNotes && notifications?.tefillahNotes.length > 0 && (
                    <div className="tefillah-notes-inner-view">
                        {notifications.tefillahNotes.map((n, index) => (
                            <div className="tefillah-notes-text" key={index.toString()}>
                                {n}
                            </div>
                        ))}
                    </div>
                )}
                <h1 className={settings.english ? "time-text-eng" : "time-text"}>
                    {Utils.getTimeString(currentTime, undefined, settings.armyTime)}
                </h1>
            </div>
            <div className="zmanim-section">
                {zmanTimes &&
                    zmanTimes.map((zis, index) => (
                        <SingleZman
                            key={index}
                            currentTime={currentTime}
                            zt={zis}
                            index={index}
                            itemHeight={15}
                        />
                    ))}
            </div>
            <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen}>
                <SettingsChooser onChangeSettings={() => setNeedsFullRefresh(true)}
                                 onClose={() => setIsDrawerOpen(false)}/>
            </Drawer>
        </div>
    );
}

export default App;
