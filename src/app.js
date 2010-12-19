var sys = require('sys');
var fs = require('fs');
var express = require('express');
var ejs = require('ejs');
var http = require('http');
var props = require('properties');

var app = express.createServer();
app.use(express.staticProvider(__dirname + '/../public'));
app.use(express.bodyDecoder());

var requests = [];

app.get('/', function(req, res){
	res.render('index.ejs');
});

app.post('/content', function(req, res){
	var request = {};
	request.name = req.body.name;
	request.uri = req.body.uri;
	requests[request.name] = request;
	res.redirect('/content/' + request.name);
});

app.get('/content/:id', function(req, res){
	var q = requests[req.params.id];
	var connection = http.createClient(80, 'content.guardianapis.com');
	var request = connection.request('GET', q.uri, {'host':'content.guardianapis.com'});
	request.end();
	request.on('response', function(response){
		var apiData = "";
		response.setEncoding('utf8');
		response.on('data', function(chunk){
			apiData += chunk;
		});
		response.on('end', function(){
			res.render('content.ejs', { 
				locals:{res:JSON.parse(apiData),
					name:q.name}
			});	
		});
	});
});

app.listen(props.port);