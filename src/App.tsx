import { useState, useEffect } from 'react';
import UpdateElectron from '@/components/update';
import { jDate, Utils, getNotifications, ZmanimUtils, Zmanim } from './jcal-zmanim';
import { useSettingsData } from './settingsContext';
import Settings from './settings';
import './App.css';
import { SunTimes, Time, ZmanToShow } from './jcal-zmanim/jcal-zmanim';

type ZmanTime = {
  zmanType: ZmanToShow;
  time: Time;
  isTomorrow: boolean;
}

type ShulZmanimType = { chatzosHayom: Time | null, chatzosHalayla: Time | null, alos: Time | null, shkia: Time | null };

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
      setZmanTimes(zmanTimes);
      setSdate(sd);
      setJdate(jdate);
      setCurrentTime(nowTime);
      setShulZmanim(ZmanimUtils.getBasicShulZmanim(sd, settings.location) as ShulZmanimType)
    }
    fillNotifications();
  }
  const isPastShulZman = () => {
    const nowTime = currentTime,
      { chatzosHayom, chatzosHalayla, alos, shkia } = shulZmanim;

    //Notifications need refreshing by chatzos, alos and shkia
    if (shkia && Utils.isTimeAfter(shkia, nowTime)) {
      //We only want to refresh the notifications one time
      shulZmanim.shkia = null;
      //Nullify passed zmanim, we are refreshing anyway.
      shulZmanim.alos = null;
      shulZmanim.chatzosHayom = null;
      if (chatzosHalayla && chatzosHalayla.hour < 12) {
        shulZmanim.chatzosHalayla = null;
      }
      console.log('Refreshing notifications due to shkia.');
      return true;
    } else if (chatzosHayom && Utils.isTimeAfter(chatzosHayom, nowTime)) {
      //We only want to refresh the notifications one time
      shulZmanim.chatzosHayom = null;
      //Nullify passed zmanim, we are refreshing anyway.
      shulZmanim.alos = null;
      if (chatzosHalayla && chatzosHalayla.hour < 12) {
        shulZmanim.chatzosHalayla = null;
      }
      console.log('Refreshing notifications due to chatzos hayom.');
      return true;
    } else if (alos && Utils.isTimeAfter(alos, nowTime)) {
      //We only want to refresh the notifications one time
      shulZmanim.alos = null;
      //Nullify passed zmanim, we are refreshing anyway.
      if (chatzosHalayla && chatzosHalayla.hour < 12) {
        shulZmanim.chatzosHalayla = null;
      }
      console.log('Refreshing notifications due to alos.');
      return true;
    } else if (
      chatzosHalayla &&
      Utils.isTimeAfter(chatzosHalayla, nowTime)
    ) {
      //We only want to refresh the notifications one time
      shulZmanim.chatzosHalayla = null;
      console.log('Refreshing notifications due to chatzosHalayla.');
      return true;
    }
    return false;
  }
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
        console.log('Refreshing notifications: ', jdate, sdate, currentTime);
      }
    } else if (
      notifications &&
      (notifications.dayNotes.length ||
        notifications.tefillahNotes.length)
    ) {
      //If setting is off, hide all notifications
      setNotifications(null);
    }
  }
  const needsZmanRefresh = (sd: Date, nowTime: Time) => {
    if (
      !sdate ||
      sd.getDate() !== sdate.getDate() || (
        !!zmanTimes &&
        zmanTimes.some(
          /**
           * @param {{ isTomorrow: any; time: { hour: number; minute: number; second: number; }; }} zt
           */
          zt =>
            !zt.isTomorrow &&
            Utils.totalMinutes(nowTime) - Utils.totalMinutes(zt.time) >=
            settings.minToShowPassedZman
        ))
    ) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className='App'>
      {notifications?.dayNotes.map((n, index) => (
        <div itemID={index.toString()}>{n}</div>
      ))}
      {notifications?.tefillahNotes.map((n, index) => (
        <div itemID={index.toString()}>{n}</div>
      ))}
      <h2>{jdate.toStringHeb()}</h2>
      <h3>{Utils.toStringDate(sdate)}</h3>
      <h1>{Utils.getTimeString(currentTime)}</h1>
      {settings && settings.zmanimToShow
        ? settings.zmanimToShow.map((zis, index) => <div></div>)
        : null}    
    </div>
  );
}

export default App;
