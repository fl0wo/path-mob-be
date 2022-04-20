const express = require("express");
var cors = require('cors')

const rotte = require("./routesBus.json"); // Fake httpcall

const app = express();

app.use(cors())

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

    res.json(myRotte);
});


app.listen(3001, () => {
    console.log("Server running on port 3000");
});