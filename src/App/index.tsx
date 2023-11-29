import { useState, useEffect } from "react";
import { jDate, Utils, getNotifications, ZmanimUtils, Zmanim, findLocation } from "../jcal-zmanim";
import { useSettingsData } from "../settingsContext";
import Settings from "../settings";
import { SingleZman } from "../components/SingleZman";
import "./index.tsx.css";

import type { SunTimes, Time, ShulZmanimType, ZmanTime } from "../jcal-zmanim";

function App() {
  const initialSettings = new Settings();
  const initialSDate = new Date();
  const initialJdate = new jDate(initialSDate);
  const { settings, setSettings } = useSettingsData();

  const [sdate, setSdate] = useState<Date>(initialSDate);
  const [jdate, setJdate] = useState<jDate>(initialJdate);
  const [sunTimes, setSunTimes] = useState<SunTimes>(
    initialJdate.getSunriseSunset(initialSettings.location)
  );
  const [currentTime, setCurrentTime] = useState<Time>(Utils.timeFromDate(initialSDate));
  const [notifications, setNotifications] = useState<{
    dayNotes: string[];
    tefillahNotes: string[];
  } | null>({ dayNotes: [], tefillahNotes: [] });
  const [shulZmanim, setShulZmanim] = useState<ShulZmanimType>(
    ZmanimUtils.getBasicShulZmanim(initialSDate, initialSettings.location) as ShulZmanimType
  );
  const [zmanTimes, setZmanTimes] = useState<ZmanTime[]>();
  const [needsNotificationsRefresh, setNeedsNotificationsRefresh] = useState(true);

  //Run once
  useEffect(() => {
    const jlm = findLocation("Jerusalem");
    if (!!jlm) {
      const ns = { ...settings, location: jlm };
      setSettings(ns);
    }
    setInitialData();
  }, []);

  //Run repeatedly
  useEffect(() => {
    const interval = window.setInterval(refresh, 1000);
    return () => clearInterval(interval);
  });

  const setInitialData = () => {
    const stngs = settings || initialSettings,
      sd = sdate || initialSDate,
      nowTime = currentTime,
      location = stngs.location,
      snst = sunTimes.sunset,
      jd =
        jdate || Utils.isTimeAfter(snst, nowTime)
          ? new jDate(Utils.addDaysToSdate(sd, 1))
          : new jDate(sd),
      zmanTimes = ZmanimUtils.getCorrectZmanTimes(
        sd,
        nowTime,
        stngs.location,
        stngs.zmanimToShow,
        stngs.minToShowPassedZman,
        snst as Time
      ),
      shulZmanim = ZmanimUtils.getBasicShulZmanim(jd, location);
    setNeedsNotificationsRefresh(true);
  };
  const refresh = () => {
    const sd = new Date(),
      nowTime = Utils.timeFromDate(sd);

    if (!needsZmanRefresh(sd, nowTime)) {
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
  };
  const isPastShulZman = () => {
    const nowTime = currentTime,
      { chatzosHayom, chatzosHalayla, alos, shkia } = shulZmanim;

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
      if (needsNotificationsRefresh || isPastShulZman()) {
        const notifications = getNotifications(
          jdate,
          currentTime,
          settings.location,
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
    if (
      !sdate ||
      sd.getDate() !== sdate.getDate() ||
      !zmanTimes ||
      zmanTimes.some(
        (zt) =>
          !zt.isTomorrow &&
          Utils.totalMinutes(nowTime) - Utils.totalMinutes(zt.time) >= settings.minToShowPassedZman
      )
    ) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className="app">
      <div className="group fixed top-7 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-danger-600 uppercase leading-normal text-white">
        <a
          href="#"
          data-te-ripple-init
          data-te-ripple-color="light"
          className="cursor-pointer rounded-full p-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="h-5 w-5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
            />
          </svg>
        </a>
        <ul className="absolute z-0 flex translate-y-full flex-col items-center justify-center opacity-0 transition-all duration-500 ease-in-out group-hover:-translate-y-[60%] group-hover:opacity-100">
          <li>
            <a
              href="#"
              data-te-ripple-init
              data-te-ripple-color="light"
              data-te-ripple-centered="true"
              className="mx-5 mb-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-info-600 shadow-md hover:shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-6 w-6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="#"
              data-te-ripple-init
              data-te-ripple-color="light"
              data-te-ripple-centered="true"
              className="mx-5 mb-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-warning-600 shadow-md hover:shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-6 w-6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="#"
              data-te-ripple-init
              data-te-ripple-color="light"
              data-te-ripple-centered="true"
              className="mx-5 mb-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-success-600 shadow-md hover:shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-6 w-6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </a>
          </li>
          <li>
            <div
              data-te-ripple-init
              data-te-ripple-color="light"
              data-te-ripple-centered="true"
              className="mx-5 mb-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary-600 shadow-md hover:shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-6 w-6">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </div>
          </li>
        </ul>
      </div>
      <div className="top-section">
        <h4>{settings.location.Name}</h4>
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
          <div className="day-notes-inner-view">
            {notifications.tefillahNotes.map((n, index) => (
              <div className="tefillah-notes-text" key={index.toString()}>
                {n}
              </div>
            ))}
          </div>
        )}
        <h1 className={!!settings.english ? "time-text-eng" : "time-text"}>
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
    </div>
  );
}

export default App;
