const express = require("express");
var cors = require('cors')
var request = require('request');
const axios = require('axios');
const bodyParser = require('body-parser')

const rotte = require("./routesBus.json"); // Fake httpcall

const app = express();

app.use(cors())

app.use(express.static('client'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get("/bus/all", (req, res, next) => {

    const myRotte =
        rotte.stations.map(r=>{
            delete r['connectionsDetails']
            return r
        }).concat(
            rotte.virtualStations.map(r=>{
                delete r['connectionsDetails']
                return r
            }));

    res.json(myRotte.filter(r=>r.country==='IT'));
});



async function getTaxis(lat, long) {

    return await axios.post(
        'http://demo.data.wetaxi.org/v5/partners/estimates',
        // '{\n    "departure": {\n        "latitude":45.0614548,\n        "longitude":7.6768899\n    },\n    "passengers": 2,\n    "asap":true\n}',
        {
            departure: {
                latitude: 45.0614548,
                longitude: 7.6768899
            },
            passengers: 2,
            asap: true
        },
        {
            headers: {
                'Authorization': 'Bearer 2Cu9cnQ7wYr8vsZqQfXmqdRsS9rsRLz0MS2Y6SFIwmyKmTMhPQDxnGG7MUX0suMpVl2Ox8dWqU0TIysiKiLgRHn6bZSQkjqsdGgbgDJclsRnNr7BfxgREsVIE2NkQ3gaAnZFxFmiwyc8EINR4pWur27W4orGOS1CATNUQDKW1mGULTdqd3P2yRBfoEAdZ08IccidZjAfgSJVKYde6wu2YDb8n0E0KUxeedEOdgyjnGVuNcyU1UENQSyLWCpSxFtB',
                'Content-Type': 'application/json'
            }
        }
    );
}

app.get("/taxi/all", async (req, res, next) => {

    let lat = req.headers['lat']
    let long = req.headers['long']

    let taxies = (await getTaxis(lat, long)).data;

    console.log(taxies)

    return res.json(taxies)
});


app.listen(3401, () => {
    console.log("Server running on port 3001");
});