
/**
 * Module dependencies.
 */

var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require("fs");



//load customers route
var customers = require('./routes/customers'); 
var sessions = require('./routes/sessions');
var tree_node = require('./routes/tree_node');
var leaf = require('./routes/leaf');
var leaf_content = require('./routes/leaf_content');
var app = express();

var connection  = require('express-myconnection'); 
var mysql = require('mysql');

// all environments
app.set('port', process.env.PORT || 4300);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Methods', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*------------------------------------------
    connection peer, register as middleware
    type koneksi : single,pool and request 
-------------------------------------------*/

app.use(
    
    connection(mysql,{
        
        host: 'database-1.cimr79hkc362.us-west-2.rds.amazonaws.com', //'localhost',
        user: 'admin',
        password : 'adminadmin',
        port : 3306, //port mysql
        database:'customer'

    },'request') //or single

);


/*
 * GET home page.
 */
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + './index.html'));
});

//app.get('/', routes.index);
app.get('/customers', customers.list);
//app.get('/customers/add', customers.add);
app.post('/customers/add', customers.save);
app.get('/customers/delete/:id', customers.delete_customer);
app.get('/customers/edit/:id', customers.edit);
app.post('/customers/edit/:id',customers.save_edit);
app.post('/session/add',sessions.save);
app.post('/tree/get', tree_node.list);
app.post('/leaf/state_save', leaf.state_save);
app.post('/leaf_content/get', leaf_content.leaf_content_get);
app.post('/leaf_content/save', leaf_content.save);
app.post('/session/get', sessions.get);
app.post('/session/get_dates', sessions.get_dates);
app.get('/session/delete/:id', sessions.delete_session);


//app.use(app.router);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
