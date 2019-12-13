const app = require('express')();
const https = require('https');
const fs = require('fs');


//GET home route
app.get('/', (req, res) => {
    res.send('Hello World');
});

// we will pass our 'app' to 'https' server
https.createServer({
    key: fs.readFileSync('./privatekey.pem'),
    cert: fs.readFileSync('./certificate.pem'),
    passphrase: 'YOUR PASSPHRASE HERE'
}, app)
.listen(3001);
