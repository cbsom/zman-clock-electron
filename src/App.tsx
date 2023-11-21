import { useState, useEffect } from 'react'
import UpdateElectron from '@/components/update'
import { jDate, Utils, getNotifications } from './jcal-zmanim';
import { useSettingsData } from './settingsContext';
import Settings from './settings';
import './App.css'


function App() {
  const initialSettings = new Settings();
  const initialSDate = new Date();
  const initialJdate = new jDate(initialSDate);
  const [sdate, setSdate] = useState(initialSDate);
  const [jdate, setJdate] = useState(initialJdate);
  const { settings, setSettings } = useSettingsData();
  const [sunTimes, setSunTimes] = useState(initialJdate.getSunriseSunset(initialSettings.location));
  const [currentTime, setCurrentTime] = useState(Utils.timeFromDate(initialSDate));
  const [notifications, setNotifications] = useState<{ dayNotes: string[], tefillahNotes: string[] }>({ dayNotes: [], tefillahNotes: [] });
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
    <div className='App'>


      {notifications.dayNotes.map((n, index) =>
        <div itemID={index.toString()}>{n}</div>
      )}
      {notifications.tefillahNotes.map((n, index) =>
        <div itemID={index.toString()}>{n}</div>
      )}
      <h2>{jdate.toStringHeb()}</h2>
      <h3>{Utils.toStringDate(sdate)}</h3>
      <h1>{Utils.getTimeString(currentTime)}</h1>
      {settings && settings.zmanimToShow ? settings.zmanimToShow.map((zis, index) =>
        <div></div>
      ) : null}

      <div className='flex-center'>
        Place static files into the<code>/public</code> folder <img style={{ width: '5em' }} src='./node.svg' alt='Node logo' />
      </div>

      <UpdateElectron />
    </div>
  )
}

export default App