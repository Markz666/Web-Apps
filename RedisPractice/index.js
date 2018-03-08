const express = require("express");
const app = express();
const redis = require("redis");
const client = redis.createClient();
const fs = require("fs");
const bluebird = require("bluebird");

// use bluebird to enable the async functions
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

let logList = [];

const getById = ((id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fs.readFile("data.json", "utf-8", (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                try {
                    let jsonData = JSON.parse(data);
                    let hasProject = false;

                    jsonData.forEach((people) => {
                        if (people.id == id) {
                            hasProject = true;
                        }
                    });

                    if (hasProject) {
                        resolve(jsonData[id - 1]);
                    } else {
                        reject("Something wrong! Id not found");
                    }
                } catch (parsingError) {
                    reject(parsingError);
                };
            });
        }, 5000);
    });
});

app.get("/api/people/history", async (req, res) => {
    let historyArr = [];
    for (let i = 0; i < logList.length; i++) {
        if (i === 20) {
            break;
        }
        // use user id to get the entire user info
        let cacheForId = await client.hgetallAsync(logList[i]);
        // console.log(cacheForId);
        historyArr.push(cacheForId);
    }
    res.send(historyArr);
});

app.get("/api/people/:id", async (req, res) => {
    let cacheForIdExists = await client.existsAsync(req.params.id);
    if (cacheForIdExists === 1) {
        let cacheForId = await client.hgetallAsync(req.params.id);
        res.send(cacheForId);
        // use Array.prototype.unshift to add id to the beginning of the array
        logList.unshift(req.params.id);
    } else {
        try {
            let idInDummy = await getById(req.params.id);
            res.send(idInDummy);
            logList.unshift(req.params.id);
            let hmsetAsyncId = await client.hmsetAsync(req.params.id, idInDummy);
            //console.log(logList);
        } catch (error) {
            res.send(error);
        }
    }
});

// set all the other routes to be 404 page
app.use("*", (req, res) => {
    res.sendStatus(404).json({error: "Wrong route!"});
});

app.listen(3000, () => {
    console.log("We've got a server, listening on localhost:3000.");
})