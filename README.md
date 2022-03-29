# dexcom

A javascript implementation of [gagebenne/pydexcom](https://github.com/gagebenne/pydexcom), a library for interacting with the Dexcom share API.

## Installation

### Browser

dexcom can be used client-side (in-browser) by adding the script to your html:
```shell
$ curl -sL https://raw.githubusercontent.com/coderkearns/dexcom/master/index.js > dexcom.js
```
```html
<script src="dexcom.js"></script>
```

### Node.js

dexcom can also be used in node.js, but requires fetch. It can currently be used in Node.js v17.6.x and above.

```shell
$ curl -sL https://raw.githubusercontent.com/coderkearns/dexcom/master/index.js > dexcom.js
$ node --version
v17.6.0
$ node --experimental-fetch <file>.js
```
```js
// <file>.js
const Dexcom = require('./dexcom.js');
```

## Usage

### Create a new Dexcom instance

```js
// You need to pass in your dexcom share username and password
const dexcom_username = "username";
const dexcom_password = "password";
const out_of_united_states = false; // This is used to determine which Dexcom share url to use.
const dexcom = new Dexcom(dexcom_username, dexcom_password, out_of_united_states);
```

### Wait for the Dexcom instance to be ready
```js
const dexcom = new Dexcom(username, password, ous);

dexcom.ready.then(() => {
    // ...
    pass
})

// or, with in an async function or with top-level-await

await dexcom.ready;
// ...
pass
```

### Using the Dexcom instance

```js
// Get the latest glucose reading in the last 24 hours
const latest = await dexcom.getLatestGlucoseReading();

// Get the "current" glucose reading (the most recent in the last 10 minutes)
const current = await dexcom.getCurrentGlucoseReading();

// Get any number of glucose readings
const minutes = 60; // Must be 1440 or less minutes (24 hours)
const maxAmount = 10; // Must be 288 or less readings
const readings = await dexcom.getGlucoseReadings(minutes, maxAmount);
```

### Using a `GlucoseReading()` instance

```js
const current = await dexcom.getCurrentGlucoseReading(); // Assuming Reading is 119, steady, at 10:00 AM 2000-01-01

const glucose = current.value; // 119
const glucoseMgDl = current.mgdl // 119
const glucoseMmolL = current.mmol // 6.8

const trendDesc = current.trend.description; // "steady"
const trendArrow = current.trend.arrows; // "→"

const timestamp = current.time; // Date(2000, 0, 1, 10, 0, 0, 0);

// Need to access the Reading JSON itself? np
const reading = current._reading; // { Trend: 'Flat', Value: 119, WT: '<date string>', ST: '<date string>', DT: '<date string>' }
```
