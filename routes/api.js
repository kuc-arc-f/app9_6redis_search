var express = require('express');
var router = express.Router();
const redis = require("redis");
const {promisify} = require('util');
import LibCommon from "../libs/LibCommon"
import LibPagenate from "../libs/LibPagenate"
import LibSortedTasks from "../libs/LibSortedTasks"
import LibTasks from "../libs/LibTasks"
//
const client = redis.createClient();

const mgetAsync = promisify(client.mget).bind(client);
const zrevrangeAsync = promisify(client.zrevrange).bind(client);

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource-1234');
});
/******************************** 
* 
*********************************/
router.get('/tasks_index',async function(req, res) {
    var ret_arr = {ret:0, msg:""}
    var query = req.query;
    var page = query.page;
console.log( "page=",  page );
    LibPagenate.init();
    var page_info = LibPagenate.get_page_start(page);
    try{
        client.on("error", function(error){ console.error(error); });         
        var data = await zrevrangeAsync("sorted-task", page_info.start, page_info.end );
// console.log( data );
        var reply_books = await mgetAsync(data);
        var param = LibPagenate.get_page_items(data, reply_books)
//console.log( param );        
        res.json(param); 
    } catch (e) {
        console.log(e);
        res.json(ret_arr);
    }
});
/******************************** 
* 
*********************************/
router.post('/tasks_new', async function(req, res) {
    var ret_arr = {ret:0, msg:""}
    try{
        client.on("error", function(error){ console.error(error); });
        var data = req.body
        //console.log(data )
        var item = {
            title: data.title ,  
            content: data.content ,
        };
        var ret = await LibCommon.add_item(client, item, "task")
        req.flash('success', 'Complete, save task');
        var param = {"ret": ret };
        res.json(param)        
    } catch (e) {
        console.log(e);
        ret_arr.msg = e
        res.json(ret_arr);        
    }    
}); 
/******************************** 
* 
*********************************/
router.get('/tasks_show/:id', function(req, res) {
    console.log(req.params.id );
    client.on("error", function(error){ console.error(error); });
    client.get(req.params.id, function(err, reply_get) {
        console.log(reply_get );
        var row = JSON.parse(reply_get || '[]')
        row = LibCommon.convert_string_date(row)
        var param = {"docs": row };
        res.json(param); 
    });     
});
/******************************** 
* 
*********************************/
router.post('/tasks_update', (req, res) => {
    var ret_arr = {ret:0, msg:""}
    try{
        var data = req.body
        console.log(req.body )  
        client.on("error", function(error){ console.error(error); });
        var key = data.id;
        var item = {
            title: data.title ,  
            content: data.content ,
            id: data.id,
        };
        var json = JSON.stringify( item );
    //console.log( json );
        client.set(key , json , function() {
            req.flash('success', 'Complete, save task');
            var param = {"ret": 1 };
            res.json(param);
        });          
    } catch (e) {
        console.log(e);
        ret_arr.msg = e
        res.json(ret_arr);        
    }
});
/******************************** 
* 
*********************************/
router.get('/tasks_delete/:id', function(req, res) {
    let data = req.body
console.log( req.params.id );
    client.on("error", function(error){ console.error(error); });
    var key_sorted  = "sorted-task";  
    client.zrem(key_sorted , req.params.id , function() {
        req.flash('success', 'Complete, delete item');
        var param = {"ret": 1 };
        res.json(param);
    });
});
/******************************** 
* 
*********************************/
router.post('/file_receive', function(req, res, next) {
    let data = req.body
    var items = JSON.parse(data.data || '[]')
    var ret_arr = {ret:0, msg:""}
    client.on("error", function(error) {
        console.error(error);
        ret_arr.msg = error
        res.json(ret_arr);
    });  
console.log( items )
    var ret = LibSortedTasks.add_items(client, items);
    var param = {"ret": ret };
    res.json(param);
});
/******************************** 
* 
*********************************/
router.post('/task_search',async function(req, res) {
    var ret_arr = {ret:0, msg:""}
    try{
        var data = req.body
console.log(data.key )        
        client.on("error", function(error){ console.error(error); });    
        var reply = await zrevrangeAsync("sorted-task", 0, -1 );
        var items = await mgetAsync(reply);
        items = LibCommon.string_to_obj(items)
        items = LibTasks.get_serach_items(items, data.key)
// console.log( items );
        res.json( items ); 
    } catch (e) {
        console.log(e);
        res.json(ret_arr);
    }
});
/******************************** 
* 
*********************************/
router.post('/test1', (req, res) => {
    var ret_arr = {ret:0, msg:""}
    try{
        var data = req.body
        console.log(data )    
        res.json( data )
    } catch (e) {
        console.log(e);
        ret_arr.msg = e
        res.json(ret_arr);        
    }
});

module.exports = router;
