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

const searchExample = {
    "currency": "string",
    "solutions": [
        {
            "solutionId": "6dbb44ee-5030-456e-a299-6c3b0cb29503$1b7f806b-39db-4804-bf9d-a53e00980e3f$2$202202062120",
            "departureStationCode": "6dbb44ee-5030-456e-a299-6c3b0cb29503",
            "arrivalStationCode": "1b7f806b-39db-4804-bf9d-a53e00980e3f",
            "departureDateTime": "2022-02-06T22:20:00+01:00",
            "arrivalDateTime": "2022-02-07T05:05:00+01:00",
            "segments": [
                {
                    "departureDateTime": "2022-02-06T22:20:00+01:00",
                    "arrivalDateTime": "2022-02-07T00:20:00+01:00",
                    "departureStationCode": "6dbb44ee-5030-456e-a299-6c3b0cb29503",
                    "arrivalStationCode": "1835b294-8b50-4deb-a78a-9711788b4c34",
                    "carrier": "marinosoc",
                    "travelMode": "bus",
                    "line": "",
                    "kind": "national"
                },
                {
                    "departureDateTime": "2022-02-07T00:35:00+01:00",
                    "arrivalDateTime": "2022-02-07T05:05:00+01:00",
                    "departureStationCode": "1835b294-8b50-4deb-a78a-9711788b4c34",
                    "arrivalStationCode": "1b7f806b-39db-4804-bf9d-a53e00980e3f",
                    "carrier": "marinosoc",
                    "travelMode": "bus",
                    "line": "",
                    "kind": "national"
                }
            ]
        },
        {
            "solutionId": "1b7f806b-39db-4804-bf9d-a53e00980e3f$6dbb44ee-5030-456e-a299-6c3b0cb29503$2$202202072310",
            "departureStationCode": "1b7f806b-39db-4804-bf9d-a53e00980e3f",
            "arrivalStationCode": "6dbb44ee-5030-456e-a299-6c3b0cb29503",
            "departureDateTime": "2022-02-08T00:10:00+01:00",
            "arrivalDateTime": "2022-02-08T06:55:00+01:00",
            "segments": [
                {
                    "departureDateTime": "2022-02-08T00:10:00+01:00",
                    "arrivalDateTime": "2022-02-08T04:40:00+01:00",
                    "departureStationCode": "1b7f806b-39db-4804-bf9d-a53e00980e3f",
                    "arrivalStationCode": "1835b294-8b50-4deb-a78a-9711788b4c34",
                    "carrier": "foobus",
                    "travelMode": "bus",
                    "line": "",
                    "kind": "national"
                },
                {
                    "departureDateTime": "2022-02-08T04:55:00+01:00",
                    "arrivalDateTime": "2022-02-08T06:55:00+01:00",
                    "departureStationCode": "1835b294-8b50-4deb-a78a-9711788b4c34",
                    "arrivalStationCode": "6dbb44ee-5030-456e-a299-6c3b0cb29503",
                    "carrier": "foobus",
                    "travelMode": "bus",
                    "line": "",
                    "kind": "national"
                }
            ]
        }
    ],
    "combinations": [
        {
            "outboundSolutionId": "6dbb44ee-5030-456e-a299-6c3b0cb29503$1b7f806b-39db-4804-bf9d-a53e00980e3f$2$202202062120",
            "inboundSolutionId": "1b7f806b-39db-4804-bf9d-a53e00980e3f$6dbb44ee-5030-456e-a299-6c3b0cb29503$2$202202072310",
            "offers": [
                {
                    "offerId": "default",
                    "availability": 22,
                    "totalPriceInCents": 15600,
                    "url": ""
                }
            ]
        }
    ]
}

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

app.post("/bus/solution", async (req, res, next) => {
    const sols = (await getSolution(
        req.body.id1,
        req.body.id2
    )).data
    return res.json(sols);
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

async function getSolution(id1, id2) {

    return await axios.post(
        'http://externalapi.cortinaexpress.sitrap.it/generic/v1.0/search',
        // '{\n  "currency": "EUR",\n  "language": "it",\n  "departureStationCode": "0facc9c5-2e24-4d6d-97e6-6f533208e01a",\n  "arrivalStationCode": "0465b2a7-759e-4021-b8a6-e6cf5a9c7493",\n  "departureDate": "2022-06-14",\n  "returnDate": "2022-06-14",\n  "passengers": {\n    "adult": 1,\n    "a377c836a30e414cae701c0f361a68a6": 1\n  }\n}',
        {
            'currency': 'EUR',
            'language': 'it',
            'departureStationCode': id1,//'0facc9c5-2e24-4d6d-97e6-6f533208e01a',
            'arrivalStationCode': id2,//'0465b2a7-759e-4021-b8a6-e6cf5a9c7493',
            'departureDate': '2022-05-20',
            'returnDate': '2022-05-20',
            'passengers': {
                'adult': 1
            }
        },
        {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJydWdnZXJvLm1hZmZlaUBidXNmb3JmdW4uY29tIiwianRpIjoiNzAyNjZhNzYtNWQzMi00ZDNmLThjMzktZjVmMTk0YTM4MTRjIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiJydWdnZXJvLm1hZmZlaUBidXNmb3JmdW4uY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6InJ1Z2dlcm8ubWFmZmVpQGJ1c2ZvcmZ1bi5jb20iLCJBZ2VuY3kiOiJCdXNmb3JmdW4iLCJOYW1lIjoiUnVnZ2VybyIsIlN1cm5hbWUiOiJNYWZmZWkiLCJBZ2VuY3lBZGRyZXNzIjoiYXNkYXNkIiwiT3BlcmF0b3JJZCI6WyI5MzBmZTBhMC0wYzEyLTQ5MjEtYmVlMy1jNGFlZWYyNDY5NGMiLCI5MzBmZTBhMC0wYzEyLTQ5MjEtYmVlMy1jNGFlZWYyNDY5NGMiXSwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjpbIkV4dGVybmFsQWdlbmN5UGF5bWVudCIsIkNhblVzZUdlbmVyaWNBcGkiLCJQaWFudGluZUJ1cy5SZWFkIiwiU3RvcHMuUmVhZCIsIkxvY2FsaXRpZXMuUmVhZCIsIkxpbmVzLlJlYWQiLCJDYW5Jc3N1ZSIsIkNhbkRpcmVjdElzc3VlIiwiQWdlbmNpZXMuUmVhZCIsIkFnZW5jeUNhdGVnb3JpZXMuUmVhZCIsIlNhbGVDb25maWdzLlJlYWQiLCJBbHdheXNWaWV3UGFzc2VuZ2Vyc1RvdGFscyIsIkNhbkZvcmNlUHJpY2VPbklzc3VlIiwiQ2FuVXNlQWdlbmN5IiwiQ2FuQ2hhbmdlU2VhdCIsIkNhbkNhbmNlbFRpY2tldHMiLCJDYW5DaGFuZ2VGYXJlQ2F0ZWdvcnlPblRpY2tldHMiLCJDYW5WaWV3UmVtYWluZGVyQ291cG9ucyJdLCJUTCI6Ii0xNSIsImV4cCI6MTY1MzQ5NzU5OSwiaXNzIjoiYXBpLmNvcnRpbmFleHByZXNzLml0IiwiYXVkIjoiYXBpLmNvcnRpbmFleHByZXNzLml0In0.Y-qEqQW8AHCxV5I2ZoOdl5cW_WV-MZN9q3en27GNhO8',
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
    console.log("Server running on port 3401");
});