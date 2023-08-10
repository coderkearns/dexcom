# dexcom

A simple javascript library for reading glucose data from the Dexcom Share API.
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
const Client = require('./dexcom.js');
```

## Usage

### Step 1. Enable the Dexcom Share service on your account

*This step only needs to be done once per account.*

Download the [Dexcom G6 / G5 / G4](https://www.dexcom.com/apps) app, then [enable the Share service](https://provider.dexcom.com/education-research/cgm-education-use/videos/setting-dexcom-share-and-follow).

### Step 2. Create a Client instance

```js
const dexcomClient = new Client()
```

### Step 3. Log in to an account

```js
await dexcomClient.login("myUsername", "myPasswordIsCool1*")
```

### Step 4. Get your glucose values

```js
const lastReading = await dexcomClient.fetchLastReading()

console.log(`Reading value is ${lastReading.trend.arrow}${lastReading.mgdl}. The value is ${lastReading.trend.desc}. The value was measured at ${lastReading.time}.`)

const last20ReadingsInTheLast1Hour = await dexcomClient.fetchReadings(60, 20)
```

## License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License - see the [LICENSE](./LICENSE) file for details.
