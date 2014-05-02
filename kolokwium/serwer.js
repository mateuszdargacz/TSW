/*jshint node: true */
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var less = require('less-middleware');

var baza = require('./db/taffy-min.js').taffy(require('./db/gminy').gminy);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(less({
    src: path.join(__dirname, 'less'),
    dest: path.join(__dirname, 'public/css'),
    prefix: '/css',
    compress: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components/jquery/dist')));
app.use(app.router);

app.get('/:woj/:reg', function (req, res) {
    var json = baza({
        woj: req.params.woj,
        gmina: {
            regex: new RegExp(req.params.reg)
        }
    }).get();
    res.json(json);
});

app.get('/:woj', function (req, res) {
    var json = baza({
        woj: req.params.woj
    }).get();
    res.json(json);
});

app.listen(3000, function () {
    console.log('Serwer działa na porcie 3000');
});
