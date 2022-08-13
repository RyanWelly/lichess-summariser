const express = require('express')
const https = require('https')
const { createCanvas, loadImage } = require('canvas')
const playerAnalysis = require('./player-analysis')
//const axios = require('axios')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello world!')
})

app.get('/players/:username', (req,res) => {

    let username = req.params.username
    let info = getUserInfoWorking(username)
    info.then((data) => {
        const response = {
            statusCode: 200,
            object: data,
        };
        //res.send(`${response.object.perfs.blitz.rating}`) 
        res.send(playerAnalysis.testImage(username, response.object.perfs.bullet.rating))
    })
        //.catch(() => {res.send('Sorry, we could not find what you were looking for.')})

     
    
})


app.get('/players/:username/activity', (req, res) => {
    let username = req.params.username
    let data = getUserPlayedDaily(username)
    data.then((data) => {
        const response = {
            statusCode: 200,
            object: data,
        };
        res.send(`${data}`)
    })
    
})

app.get('/players/:username/history/image', async (req, res) => {


    //test this out on another file, that doesn't return this.
    const username = req.params.username
    const userData = await getUserPlayedDaily(username);
    const ratings = await getUserRatings(username)

    let activity = await getUserActivity(username); // is it worth while making all these functions into one tuple? consider after getting working prototype

    const startDate = Date.now() //need to minus maybe 30 days?
    let image = playerAnalysis.activityHeatMap(username, ratings, startDate, activity)


})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


function getUserInfoWorking(username) {
    return new Promise((resolve, reject) => {
        const options = {
            host: 'lichess.org',
            path: `/api/user/${username}`,
            port: 443,
            method: 'GET'
        };
        const req = https.request(options, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            res.on('end', function () {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    reject(e);
                }
                resolve(body);
            });
        });

        req.on('error', (e) => {
          reject(e.message); //need to add proper error handling?
        });
       req.end();
    });
}



//current possible plans for getting activity of player:

    //1: Request player games from each day period, which would be quite slow due to lichess game downloading restraints.
    // Maybe cap number downloaded from each day at 20, so each day would take about 1 second, so two months would be about a minute?
    // I could give option to user to autheticate through lichess and get faster download?

    //2: Use rating history array as rough approximation; if rating is different to the day before, they were active on that day,
    // and if it is the same as the day before, either they did not play rated or they played rated and remained on the same 
    // rating.
    // Pros: Far faster than downloading games and would be much easier to render visual representation.
    // Cons: Wouldn't take into account casual/friendly games, wouldn't differentiate between one game and 500 games played in a day.

    //Implementing #2, I'll likely end up implementing both because #1 is far cooler.

function getUserPlayedDaily(username) {
//Lot of repeated promises/requests likely going to occur, so it's probably a good idea to write a single method to use for most lichess requests at this rate.

    let ratingHistoryPromise = new Promise((resolve, reject) => {

        const options = {
            host: 'lichess.org',
            path: `/api/user/${username}/rating-history`,
            port: 443,
            method: 'GET'
        }
        const request = https.request(options, (response) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                reject(new Error('statusCode=' + res.statusCode)); //Consider how I want this to behave when 
            }

            var body = [];
            res.on('data', (chunk) => {
                body.push(chunk);
            });
            res.on('end', () => {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    reject(e);
                }
                resolve(body);
            });

        })
    })
    // let history = {}
    // ratingHistoryPromise.then((data) => {
    //     //If request is correct, then data will be an object of fields which are each an array of rating history for a variant.
    //     const relevantHistories = parseHistory(data)
    //     relevantHistories.forEach(element => {
    //         let name = element.name;
    //         history[name] = element.points;
    //     });
    //     return history



    // })
    return ratingHistoryPromise

}


function parseHistory(data) {
    const relevantHistories = data.filter((possible) => {
        possible.name.match("Blitz")
    })
    return relevantHistories


}
