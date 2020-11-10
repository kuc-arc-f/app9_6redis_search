var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const redis = require("redis");
const {promisify} = require('util');
const client = redis.createClient();

import LibAuth from "../libs/LibAuth"
import LibCsrf from "../libs/LibCsrf"
import LibCommon from "../libs/LibCommon"
import LibPagenate from "../libs/LibPagenate"

const mgetAsync = promisify(client.mget).bind(client);
const zrevrangeAsync = promisify(client.zrevrange).bind(client);

/******************************** 
* 
*********************************/
router.get('/',async function(req, res) {
    var ret_arr = {ret:0, msg:""}
    var query = req.query;
//    var page = query.page;
    var page = 1;
console.log( "page=",  page );
    LibPagenate.init();
    var page_info = LibPagenate.get_page_start(page);
    try{
        client.on("error", function(error){ console.error(error); });         
        var data = await zrevrangeAsync("sorted-user", page_info.start, page_info.end );
// console.log( data );
        var reply_books = await mgetAsync(data);
        var param = LibPagenate.get_page_items(data, reply_books)
        res.json(param); 
    } catch (e) {
        console.log(e);
        res.json(ret_arr);
    }
});
/******************************** 
* 
*********************************/
router.get('/add', function(req, res, next) {
    LibCsrf.set_token(req, res) 
    res.render('users/add', {});
});
/******************************** 
* 
*********************************/
router.post('/add', async function(req, res, next){
    try{ 
        if(LibCsrf.valid_token(req, res)== false){ return false; }
        let data = req.body
        console.log( data );
        let hashed_password = bcrypt.hashSync(data.password, 10);
        var item = {
            name: "",
            mail: data.email ,  
            password: hashed_password ,
        };        
        var ret = await LibCommon.add_item(client, item, "user")
        req.flash('success', 'Complete, save User'); 
        res.redirect('/')      
    } catch (e) {
        console.log(e);
        req.flash('err', 'Error ,save User');
        res.redirect('/')        
    }    
});
/******************************** 
* 
*********************************/
router.get('/test1', function(req, res, next) {
    try{ 
        var v = LibAuth.valid_user(req);
        if(v){
            res.send("User, Login");
            var user = LibAuth.get_user(req)
            console.log( user );    
        }else{
            res.redirect('/login')
        }
        console.log(v);    
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;

