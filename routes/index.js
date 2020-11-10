var express = require('express');
var router = express.Router();

import LibAuth from "../libs/LibAuth"
import LibBaseParams from "../libs/LibBaseParams"

/******************************** 
* 
*********************************/
router.get('/', function(req, res, next) {
    try{
        var user = LibAuth.get_user(req)
        var mail = null
        var valid_login = false
        if(user != null){
            valid_login = true
            mail = user.mail
//            console.log(user.password );
        }
        var base_items = { valid_login: valid_login }
        res.render('index.ejs', { 
            mail: mail ,valid_login: valid_login,
            base_items: base_items,
        });
    } catch (e) {
        console.log(e);
    }  
});
//
router.get('/about', function(req, res, next) {
  res.render('about', { title: ' '});
});
//
router.get('/userlist', function(req, res) {
});
/******************************** 
* 
*********************************/
router.get('/logout', function(req, res) {
    res.clearCookie('user');
    res.redirect('/');
});
/******************************** 
* 
*********************************/
router.get('/test1', function(req, res, next) {
    try{
        var name1 = req.cookies.name1;
console.log( req.cookies) 
console.log("name1", name1)
        res.json(req.cookies)
    } catch (e) {
        console.log(e);
    }  
});
/******************************** 
* 
*********************************/
router.get('/test2', function(req, res, next) {
    try{
        res.cookie('name1', 'value1', {
            maxAge: 60000,
            httpOnly: false
        })
        res.json(req.cookies)
    } catch (e) {
        console.log(e);
    }  
});
  
module.exports = router;
