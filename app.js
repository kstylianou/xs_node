/** Required libraries **/
const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

/** Set the view engine and path from custom root **/
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));

/** Set up variables for libraries **/
const port = 3000;

/** method post will only accept json format data **/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/** Index view page **/
app.get('/', (req, res) => {
    res.render('index');
})

app.get('/admin', (req, res) => {
    res.render('admin');
})

/** Set up server to listen to port: ${port} variable above **/
http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

// Start socket.io connection
io.on('connection', socket => {
    socket.on('location_update', (data) => {
        console.log(data)
        io.emit('location', data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});