import { useState, useEffect } from 'react';
import { useSettingsData } from './settingsContext';

export default function SingleZman({ currentTime: Time, zt: ZmanTime, index: number, styles, itemHeight }) {
    const { settings, setSettings } = useSettingsData();
    const { english, numberOfItemsToShow, location } = settings;
    if (index >= numberOfItemsToShow) return null;
    const timeDiff = Utils.timeDiff(
        currentTime,
        zt.time,
        !zt.isTomorrow,
    ),
        was = timeDiff.sign === -1,
        minutes = Utils.totalMinutes(timeDiff),
        minutesFrom10 = 10 - minutes,
        isWithin10 = !was && !zt.isTomorrow && minutes < 10,
        timeRemainingColor = was
            ? '#844'
            : isWithin10
                ? `rgb(${200 + minutesFrom10 * 5},
                        ${150 + minutesFrom10 * 5},
                        100)`
                : '#a99';
    return <div
        key={index}
        style={[styles.singleZman, { height: `${itemHeight}%` }]}>
        <span
            style={[
                english
                    ? styles.timeRemainingLabelEng
                    : styles.timeRemainingLabel,
                { color: was ? '#550' : '#99f' },
            ]}>
            <span
                style={
                    english
                        ? styles.timeRemainingNumberEng
                        : styles.timeRemainingNumber
                }>
                {english ? zt.zmanType.eng : zt.zmanType.heb}
            </span>
            {english
                ? `  ${was ? 'passed' : 'in'}:`
                : `  ${was ? 'עבר לפני' : 'בעוד'}:`}
        </span>
        <span
            style={[
                english
                    ? styles.timeRemainingTextEng
                    : styles.timeRemainingText,
                { color: timeRemainingColor },
            ]}>
            {english
                ? Utils.getTimeIntervalTextString(timeDiff)
                : Utils.getTimeIntervalTextStringHeb(timeDiff)}
        </span>
        <span
            style={
                was
                    ? english
                        ? styles.zmanTypeNameTextWasEng
                        : styles.zmanTypeNameTextWas
                    : english
                        ? styles.zmanTypeNameTextEng
                        : styles.zmanTypeNameText
            }>
            {`${zt.time && zt.isTomorrow && zt.time.hour > 2
                    ? english
                        ? ' Tomorrow'
                        : 'מחר '
                    : ''
                } ${english ? 'at' : 'בשעה'}: `}
            <span
                style={
                    isWithin10
                        ? styles.within10ZmanTimeText
                        : styles.zmanTimeText
                }>
                {Utils.getTimeString(zt.time, location.Israel)}
            </span>
        </span>
    </div>
}