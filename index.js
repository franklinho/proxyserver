let http = require('http')
let request = require('request')
let path = require('path')
let fs = require('fs')
let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || scheme + argv.host + ':' + port

http.createServer((req, res) => {
	destinationUrl = req.headers['x-destination-url'] || destinationUrl
	console.log(`\n\n\nProxying request to: ${destinationUrl + req.url}`)
	let options = {
	    headers: req.headers,
	    url: `${destinationUrl}${req.url}`
	}
	options.method = req.method

	let logPath = argv.log && path.join(__dirname, argv.log)
	let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

	let downstreamResponse = req.pipe(request(options))
	logStream.write('Request headers: ' + JSON.stringify(downstreamResponse.headers) + '\n')
	downstreamResponse.pipe(logStream, {end: false})
	downstreamResponse.pipe(res)

}).listen(8001)

http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`)
    for (let header in req.headers) {
    	res.setHeader(header, req.headers[header])
	}
    req.pipe(res)
}).listen(8000)