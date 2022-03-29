const vars = {
    // Urls:
    dexcomBaseUrl: "https://share2.dexcom.com/ShareWebServices/Services",
    dexcomBaseUrlOus: "https://shareous1.dexcom.com/ShareWebServices/Services",
    // Endpoints:
    dexcomLoginEndpoint: "/General/LoginPublisherAccountByName",
    dexcomAuthenticateEndpoint: "/General/AuthenticatePublisherAccount",
    dexcomVerifySerialNumberEndpoint:
        "/Publisher/CheckMonitoredReceiverAssignmentStatus",
    dexcomGlucoseReadingsEndpoint: "/Publisher/ReadPublisherLatestGlucoseValues",
    // Application ID:
    dexcomApplicationId: "d89443d2-327c-4a6f-89e5-496bbb0317db",
    // Error messages:
    accountErrorUsernameNullEmpty: "Username null or empty",
    accountErrorPasswordNullEmpty: "Password null or empty",
    accountErrorAccountNotFound: "Account not found",
    accountErrorPasswordInvalid: "Password not valid",
    accountErrorUnknown: "Account error",
    sessionErrorSessionIdNull: "Session ID null",
    sessionErrorSessionIdDefault: "Session ID default",
    sessionErrorSessionNotValid: "Session ID not valid",
    sessionErrorSessionNotFound: "Session ID not found",
    arguementErrorMinutesInvalid: "Minutes must be between 1 and 1440",
    arguementErrorMaxCountInvalid: "Max count must be between 1 and 288",
    arguementErrorSerialNumberNullEmpty: "Serial number null or empty",
    // Trend Keys:
    dexcomTrendKeys: {
        "None": 0,
        "DoubleUp": 1,
        "SingleUp": 2,
        "FortyFiveUp": 3,
        "Flat": 4,
        "FortyFiveDown": 5,
        "SingleDown": 6,
        "DoubleDown": 7,
        "NotComputable": 8,
        "RateOutOfRange": 9,
    },
    // Trend descriptions:
    dexcomTrendDescriptions: [
        "",
        "rising quickly",
        "rising",
        "rising slightly",
        "steady",
        "falling slightly",
        "falling",
        "falling quickly",
        "unable to determine trend",
        "trend unavailable",
    ],
    dexcomTrendArrows: ["", "↑↑", "↑", "↗", "→", "↘", "↓", "↓↓", "?", "-"],
    // Default session ID:
    defaultSessionId: "00000000-0000-0000-0000-000000000000",
    // Conversion factors:
    mmolLConvertionFactor: 0.0555, // (mmol/L) = (mg/dl) * 0.0555
}

class GlucoseReading {
    constructor(reading) {
        this._reading = reading;

        this.value = reading.Value;

        this._trend = reading.Trend;
        this._trendKey = vars.dexcomTrendKeys[this._trend];
        this.trendDescription = vars.dexcomTrendDescriptions[this._trendKey];
        this.trendArrow = vars.dexcomTrendArrows[this._trendKey];

        this.time = new Date(parseInt(reading.WT.replace("Date(", "").replace(")", "")));
    }

    get mgdl() {
        return this.value;
    }

    get mmoL() {
        return Math.round(this.value * vars.mmolLConvertionFactor, 1);
    }

    get trend() {
        return {
            description: this.trendDescription,
            arrows: this.trendArrow,
        }
    }
}

class Dexcom {
    static Reading = GlucoseReading;

    constructor(username, password, ous=false) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        this.username = username;
        this.password = password;
        this.ous = ous;
        this.sessionId = null;

        this._baseUrl = ous ? vars.dexcomOusBaseUrl : vars.dexcomBaseUrl;
        this._baseHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

        this.ready = this.create_session()
    }

    _check_session_id() {
        if (!this.sessionId) {
            throw new Error('Session ID is not set');
        }
        if (this.sessionId == vars.defaultSessionId) {
            throw new Error('Session ID is invalid');
        }
    }

    _request(url, method='get', data=null) {
        return fetch(this._baseUrl + url, {
            method: method,
            headers: this._baseHeaders,
            body: data ? JSON.stringify(data) : null,
        }).then(response => response.json())
    }

    async create_session() {
        let postData = {
            accountName: this.username,
            password: this.password,
            applicationId: vars.dexcomApplicationId
        }

        try {
            let data = await this._request(vars.dexcomAuthenticateEndpoint, 'post', postData)
            data = await this._request(vars.dexcomLoginEndpoint, 'post', postData)
            this.sessionId = data
            return
        } catch (e) {
            console.error(e)
            throw new Error('Failed to create session');
        }
    }

    async getGlucoseReadings(minutes=1440, maxCount=288) {
        this._check_session_id()
        if (minutes > 1440 || minutes < 1) {
            throw new Error('Minutes must be between 1 and 1440');
        }
        if (maxCount > 288 || maxCount < 1) {
            throw new Error('Max count must be between 1 and 288');
        }
        let postData = {
            sessionId: this.sessionId,
            minutes: minutes,
            maxCount: maxCount
        }
        try {
            let data = await this._request(vars.dexcomGlucoseReadingsEndpoint, 'post', postData)
            let readings = data.map(reading => new GlucoseReading(reading))
            return readings
        } catch (e) {
            console.error(e)
            throw new Error('Failed to get glucose readings');
        }
    }

    // Latest reading in the last 10 minutes (current)
    async getCurrentGlucoseReading() {
        let glucoseReadings = await this.getGlucoseReadings(10, 1)
        let reading = glucoseReadings[0]
        if (!reading) {
            throw new Error('No glucose readings found');
        }
        return reading
    }

    // Latest reading in the last 24 hours (24h)
    async getLatestGlucoseReading() {
        let glucoseReadings = await this.getGlucoseReadings(1440, 1)
        let reading = glucoseReadings[0]
        if (!reading) {
            throw new Error('No glucose readings found');
        }
        return reading
    }

}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Export the Dexcom class when used as a node module
    module.exports = Dexcom;
}
