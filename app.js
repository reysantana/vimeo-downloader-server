var cluster = require('cluster');


if (cluster.isMaster) {
	cluster.fork();
	cluster.on('exit', function(worker, code, signal) {
		cluster.fork();
	});
}

if (cluster.isWorker) {
    var express = require('express');
    var app = express();
    const puppeteer = require('puppeteer');

    app.get('/getlink', async function (req, res) {
        var videoUrl = req.query.videoUrl;
        if (videoUrl == '' || videoUrl == null) {
            return res.json({
                download:''
            });
        }

        try {
            const browser = await puppeteer.launch({
                executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 
                headless: true, 
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.goto("https://www.videograbber.net/free-vimeo-downloader", {
                waitUntil: "networkidle0"
            });
            await page.type('.start-video-downloader input[type=text]', videoUrl);
            await page.on('response', (response) => {
                if (response.request()._url.indexOf('https://api.videograbber.net/api/video?uri=') !== -1) {
                    return res.json({
                        download: response.request()._url
                    })
                }
            });
            
            await page.click('.start-video-downloader button', {delay: 500});
            browser.close();
        } catch (error) {
            console.log(error);
        }
    });

    var server = app.listen(3000, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log("Vimeo Extractor API Server is running at http://%s:%s", host, port)
    });
}