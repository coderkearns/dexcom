const vars = require('./vars');
const axios = require('axios');

class GlucoseReading {
    constructor(reading) {
        this.reading = reading;
        console.log(reading)
    }
}

class Dexcom {
    constructor(username, password, ous=false) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        this.username = username;
        this.password = password;
        this.ous = ous;
        this.sessionId = null;
        this.create_session()
        this.axios = axios.create({
            baseURL: ous ? vars.dexcomBaseUrlOus : vars.dexcomBaseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

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
        return this.axios.request({
            method: method,
            url: url,
            data: data
        })
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
        } catch (e) {
            console.error(e)
            throw new Error('Failed to create session');
        }
        return data
    }

    async getGlucoseReadings(minutes=1440, maxCount=288) {
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
            let readings = data.data.readings.map(reading => new GlucoseReading(reading))
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

module.exports = Dexcom;