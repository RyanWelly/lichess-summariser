const { createCanvas, loadImage } = require('canvas')
const path = require('path')
const fs = require("fs");

module.exports = {

    testImage: function (username, ratings) {
        //should probably take in size of canvas as arg?
        //am currently intending to store the images in database as data urls (generated using the toDataUrl() function)
        let imageCanvas = createCanvas(400,200)
        let ctx = imageCanvas.getContext('2d')
    
        ctx.fillStyle = 'grey'
        ctx.fillRect(0,0,imageCanvas.width,imageCanvas.height)

        ctx.fillStyle = 'black'
        ctx.font = '30px Impact'
        ctx.fillText(`${username} ${ratings}`, 0,100)
    
        var text = ctx.measureText('Awesome!')
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.lineTo(50, 102)
        ctx.lineTo(50 + text.width, 102)
        ctx.stroke()
    
        return('<img src="' + imageCanvas.toDataURL('image/png')+ '" />')
    },


    activityHeatMap: function(username, ratings, startDate, activity) {
        let height = 7;


        let imageCanvas = createCanvas(400,200)
        let ctx = imageCanvas.getContext('2d')

        ctx.fillStyle = 'black'
        ctx.fillRect(0,0, imageCanvas.width, imageCanvas.height)

        ctx.fillStyle = 'black'
        ctx.font = '15px Impact'
        ctx.fillText(`${username} ${ratings[0]}`, 0,100)

        for (let i = 0; i < ratings.length; i++) {
            let column =  (i - (i % 7)) /7

            //ctx.fillRect()
        }

        //need to start from earliest history, would prefer to have the top of the history always be a monday
        //currently have a one off error in drawing it.
        let temp = 1;
        

        for(let i = 0; i < activity.length; i++) {
            let column =  ((i+1) - ((i+1) % 7)) /7  //which week the day is in.
            let row = (i + 1) % 7
            if(activity[i] > 0) {
                ctx.fillStyle = 'green'
            } else {
                ctx.fillStyle = 'grey'
            }

            ctx.fillRect(column * 20, row * 10, 5, 5)

        }
        
        const buffer = imageCanvas.toBuffer("image/png");
        fs.writeFileSync("./image.png", buffer);
    }
}

