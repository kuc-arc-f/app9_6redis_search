var express = require('express');
var router = express.Router();

const redis = require("redis");
const {promisify} = require('util');
import LibCommon from "../libs/LibCommon"
import LibCsrf from "../libs/LibCsrf"
//
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);

//  res.send('respond with a resource-1234');
/******************************** 
* 
*********************************/
router.get('/', function(req, res, next) {
    var query = req.query;
    var page = 1;
    if(query.page != null){
        page = query.page
        console.log( "page=", page )
    }  
    res.render('tasks/index', {"page": page } );
});

/******************************** 
* 
*********************************/
router.get('/add', function(req, res, next) {
    LibCsrf.set_token(req, res) 
    res.render('tasks/new', {});
});
/******************************** 
* 
*********************************/
router.post('/add', async function(req, res, next) {
    try{
        client.on("error", function(error){ console.error(error); });
        if(LibCsrf.valid_token(req, res)== false){ return false; }
        var data = req.body
// console.log(data  )
        var item = {
            title: data.title ,  
            content: data.content ,
            created_at: new Date(),
        };
        var ret = await LibCommon.add_item(client, item, "task")
        req.flash('success', 'Complete, save task');
        res.redirect('/tasks')
    } catch (e) {
        console.log(e);
        req.flash('err', 'Error ,save task');
        res.redirect('/tasks')
    }        
});
/******************************** 
* 
*********************************/
router.get('/edit/:id',async function(req, res) {
    console.log(req.params.id  );
    var id = req.params.id
    client.on("error", function(error){ console.error(error); });
    var reply = await getAsync(id);
    var row = JSON.parse(reply || '[]')
// console.log(row);
    res.render('tasks/edit', {task: row });
});
/******************************** 
* 
*********************************/
router.post('/update', async function(req, res, next) {
    try{
        var data = req.body
// console.log(data )
        client.on("error", function(error){ console.error(error); });
        var key = data.id;
        var item = await getAsync(key);
        item = JSON.parse(item || '[]')
        item.title =data.title;
        item.content = data.content;
//console.log(item)
        var json = JSON.stringify( item );
        client.set(key , json , function() {
            req.flash('success', 'Complete, save task');
            return res.redirect('/tasks')
        });         
    } catch (e) {
        console.log(e);
        req.flash('err', 'Error ,save task');
        res.redirect('/tasks')
    }        
});
/******************************** 
* 
*********************************/
router.post('/delete', async function(req, res, next) {
    try{
        var data = req.body
        console.log(data )  
        var id = data.id
        client.on("error", function(error){ console.error(error); });
        var key_sorted  = "sorted-task";  
        client.zrem(key_sorted , id , function() {
            req.flash('success', 'Complete, delete item');
            res.redirect('/tasks')
        });                
// console.log(data )
    } catch (e) {
        console.log(e);
        req.flash('err', 'Error ,save task');
        res.redirect('/tasks')
    }        
});
/******************************** 
* 
*********************************/
router.get('/show/:id', function(req, res) {
console.log(req.params.id  );
    res.render('tasks/show', {"params_id": req.params.id });
});

/******************************** 
* 
*********************************/
router.get('/import_task', function(req, res, next) {
    res.render('tasks/import_task', {});
});

module.exports = router;
