
var express = require('express');
var router = express.Router();
const redis = require("redis");
//const {promisify} = require('util');
const client = redis.createClient();

//CSRFミドルウェアを生成する
var csrf = require('csrf');
var tokens = new csrf();
const bcrypt = require('bcrypt');
import LibAuth from "../libs/LibAuth"
import LibCsrf from "../libs/LibCsrf"

/******************************** 
* 
*********************************/
router.get('/', function(req, res) {
  try{
    LibCsrf.set_token(req, res) 
    res.render('login', { user : "" });
  } catch (e) {
      console.log(e);
  }
});
/******************************** 
* 
*********************************/
router.post('/',async function(req, res){
    try{
        client.on("error", function(error){ console.error(error); }); 
        if(LibCsrf.valid_token(req, res)== false){ return false; }
        var data = req.body
        var valid_user = await LibAuth.validRedisUserAuth(res ,client, data.email, data.password )
console.log( valid_user  )  
        if (valid_user){
//            console.log(hashed_password);  
            req.flash('success', 'Welcom, Login completed.');  
            res.redirect('/')
        }else{
            req.flash('err', 'Error Login, authrize NG');
            console.log("error, login");
            res.clearCookie('user');
            res.redirect('/login')
        }        
    } catch (e) {
        console.log(e);
    }

});

module.exports = router;
