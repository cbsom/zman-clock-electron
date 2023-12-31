/** Represents a geographic Location. Needed for calculating Zmanim.
If Israel is undefined, if the given coordinates are near the vicinity of Israel it will be assumed that it is in Israel.
UTCOffset is the time zone. Israel is always 2 and the US East coast is -5. England is 0 of course.
If UTCOffset is not specifically supplied, the longitude will be used to get a quasi-educated guess.*/
export default class Location {
    Name: string;
    NameHebrew?: string;
    Israel: boolean;
    Latitude: number;
    Longitude: number;
    UTCOffset: number;
    Elevation: number;
    CandleLighting?: number;
    /**
     * Describe a new Location.
     * @param {String} name The name of the Location
     * @param {String} nameHeb The name of the Location
     * @param {Boolean} israel Is this Location in Israel?
     * @param {Number} latitude
     * @param {Number} longitude
     * @param {Number} utcOffset The time zone. Israel is 2 and New York is -5.
     * @param {Number} elevation Elevation in meters
     * @param {Number} [candleLighting] Number of minutes before sunset the candles are lit on Friday
     */
    constructor(name: string, nameHeb: string | undefined, israel: boolean, latitude: number, longitude: number, utcOffset: number, elevation: number, candleLighting?: number) {
        //If the israel argument was not set at all.
        if (typeof israel === 'undefined' || israel === null) {
            //If the user is within Israels general coordinates,
            //we feel pretty safe assuming they are in Israel.
            //Where else on the map is the user? (Note, the probability of our users Jewishness: 99.99%)
            //Sinai, Lebanon, Syria, Jordan, in a submarine under the Mediterranean ...
            israel = (latitude > 29.45 && latitude < 33 && longitude < -34.23 && longitude > -35.9);
        }
        if (israel) {
            //Israel has only one immutable time zone
            utcOffset = 2;
        }
        //If the utcOffset argument was not set at all.
        else if (typeof utcOffset === 'undefined' || utcOffset === null) {
            //Try to determine the "correct" time zone using the simple fact that Greenwich is both TZ 0 and longitude 0.
            //Even though technically this is the way it should be,
            //it will be often incorrect as time zones are almost always tweaked to accommodate the closest border.
            utcOffset = -Math.round(longitude / 15);
        }

        this.Name = (name || 'Unknown Location');
        this.NameHebrew = nameHeb;
        this.Israel = !!israel;
        this.Latitude = latitude;
        this.Longitude = longitude;
        this.UTCOffset = utcOffset || 0;
        this.Elevation = elevation || 0;
        this.CandleLighting = candleLighting || Location.getCandles(this);
    }

    static clone(location: Location) {
        return new Location(
            location.Name,
            location.NameHebrew,
            location.Israel,
            location.Latitude,
            location.Longitude,
            location.UTCOffset,
            location.Elevation,
            location.CandleLighting || 0);
    }

    static getCandles(location: Location) {
        if (location.CandleLighting) {
            return location.CandleLighting;
        }
        else if (!location.Israel) {
            return 18;
        }
        else {
            const special = [{ names: ['jerusalem', 'yerush', 'petach', 'petah', 'petak', 'beit shemesh', 'ירושלים', 'פתח תקוה', 'בית שמש'], min: 40 },
            { names: ['haifa', 'chaifa', 'be\'er sheva', 'beersheba', 'חיפה', 'באר שבע'], min: 22 }],
                loclc = location.Name.toLowerCase(),
                city = special.find(sp => {
                    return sp.names.find(spi => {
                        return loclc.indexOf(spi) > -1;
                    });
                });
            return city ? city.min : 30;
        }
    }

    /**Gets the Location for Jerusalem.*/
    static getJerusalem() {
        return new Location('Jerusalem', 'ירושלים', true, 31.78, -35.22, 2, 800, 40);
    }
    /**Gets the Location for Lakewood NJ*/
    static getLakewood() {
        return new Location('Lakewood NJ', undefined, false, 40.1, 74.23, -5, 0, 18);
    }
}