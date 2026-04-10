const Client = (function () {
    /****** GLOBAL VARIABLES ******/
    const APP_ID = "d89443d2-327c-4a6f-89e5-496bbb0317db"

    const URL_BASE = "https://share2.dexcom.com/ShareWebServices/Services"
    const URL_BASE_OUS =
        "https://shareous1.dexcom.com/ShareWebServices/Services"

    const ENDPOINT_LOGIN = "/General/LoginPublisherAccountById"
    const ENDPOINT_AUTHENTICATE = "/General/AuthenticatePublisherAccount"
    const ENDPOINT_GLUCOSE_READINGS =
        "/Publisher/ReadPublisherLatestGlucoseValues"

    const DEFAULT_SESSION_ID = "00000000-0000-0000-0000-000000000000"

    const TREND_DESCRIPTIONS = {
        None: { name: "None", desc: "", arrow: "" },
        DoubleUp: { name: "DoubleUp", desc: "rising quickly", arrow: "\u2B85" },
        SingleUp: { name: "SingleUp", desc: "rising", arrow: "\u2191" },
        FortyFiveUp: {
            name: "FortyFiveUp",
            desc: "rising slightly",
            arrow: "\u2197",
        },
        Flat: { name: "Flat", desc: "steady", arrow: "\u2192" },
        FortyFiveDown: {
            name: "FortyFiveDown",
            desc: "falling slightly",
            arrow: "\u2198",
        },
        SingleDown: { name: "SingleDown", desc: "falling", arrow: "\u2193" },
        DoubleDown: {
            name: "DoubleDown",
            desc: "falling quickly",
            arrow: "\u2B87",
        },
        NotComputable: {
            name: "NotComputable",
            desc: "unable to determine trend",
            arrow: "?",
        },
        RateOutOfRange: {
            name: "RateOutOfRange",
            desc: "trend unavailable",
            arrow: "-",
        },
    }

    const MMOLL_TO_MGDL_CONVERTION_FACTOR = 0.0555 // (mmol/L) = (mg/dl) * 0.0555

    class Client {
        constructor(OutOfUS = false) {
            this._baseUrl = OutOfUS ? URL_BASE_OUS : URL_BASE
        }

        _request(endpoint, data) {
            return fetch(this._baseUrl + endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            }).then(response => response.json())
        }

        _authenticate(username, password) {
            return this._request(ENDPOINT_AUTHENTICATE, {
                accountName: username,
                password,
                applicationId: APP_ID,
            })
        }
        _login(accountId, password) {
            return this._request(ENDPOINT_LOGIN, {
                accountId,
                password,
                applicationId: APP_ID,
            })
        }

        /**
         * Creates a Dexcom session using the given Dexcom Share username and password.
         * @param {string} username
         * @param {string} password
         * @returns {Promise} Promise that resolves on login success
         * @throws Error if login fails
         */
        async login(username, password) {
            try {
                const accountId = await this._authenticate(username, password)
                this.sessionId = await this._login(accountId, password)
            } catch (e) {
                throw new Error("Error creating session")
            }

            if (this.sessionId == DEFAULT_SESSION_ID || typeof this.sessionId !== "string")
                throw new Error("Invalid session")
        }

        /**
         * Fetches multiple glucose readings from the Dexcom Share service. Requires login() first.
         * @param {number} maxAge The maximum age of readings to fetch, in minutes
         * @param {*} maxCount The maximum number of readings to fetch
         * @returns Promise that resolves with an array of glucose readings: `{ trend: { name: string, desc: string, arrow: string }, mgdl: number, mmol: number, time: Date }`
         * @throws Error if not logged in, arguments are invalid, or fetch fails
         */
        async fetchReadings(maxAge = 1440, maxCount = 288) {
            if (!this.sessionId) throw new Error("Not yet logged in")

            if (maxAge < 1 || maxAge > 1440)
                throw new Error("Minutes must be between 1 and 1440")
            if (maxCount < 1 || maxCount > 288)
                throw new Error("Max count must be between 1 and 288")

            try {
                const readings = await this._request(
                    ENDPOINT_GLUCOSE_READINGS,
                    {
                        sessionId: this.sessionId,
                        minutes: maxAge,
                        maxCount,
                    }
                )
                return readings.map(reading => this._processReadings(reading))
            } catch (e) {
                console.error(e)
                throw new Error("Error fetching glucose readings")
            }
        }

        _processReadings(reading) {
            return {
                trend: TREND_DESCRIPTIONS[reading.Trend],
                mgdl: reading.Value,
                mmol:
                    Math.round(
                        reading.Value * MMOLL_TO_MGDL_CONVERTION_FACTOR * 10
                    ) / 10,
                time: new Date(
                    parseInt(reading.WT.replace("Date(", "").replace(")", ""))
                ),
            }
        }

        /**
         * Fetches the most recent glucose reading within the last day. Requires login() first.
         * @returns {Promise} Promise that resolves with the most recent glucose reading, or undefined if no readings are available
         * @throws Error if not logged in
         */
        fetchLastReading() {
            return this.fetchReadings(1440, 1).then(readings => readings[0])
        }
    }

    return Client
})()

// Node.js support
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = Client
}
