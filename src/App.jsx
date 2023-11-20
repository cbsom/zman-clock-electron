import { useState, useEffect } from 'react';
import { jDate, Utils } from 'jcal-zmanim';
import './App.css';

function App() {
    const [sdate, setSdate] = useState(new Date());
    const [jdate, setJdate] = useState(new jDate(sdate));
    const [sunTimes, setSunTimes] = useState(jdate.getSunriseSunset(location));

    useEffect(() => {
        const interval = window.setInterval(() => {
            const newDate = new Date();

            setSdate(newDate);
        }, 1000);
        return () => clearInterval(interval);
    });

    return (
        <>
            <h2>{jdate.toStringHeb()}</h2>
            <h3>{Utils.toStringDate(sdate)}</h3>
            <h1>{Utils.getTimeString(Utils.timeFromDate(sdate))}</h1>
        </>
    );
}

export default App;
