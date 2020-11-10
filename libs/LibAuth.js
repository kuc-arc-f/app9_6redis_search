// LibAuth
const bcrypt = require('bcrypt');
const {promisify} = require('util');
import LibCookie from "../libs/LibCookie"

//
export default {
    get_user:function(req){
        var ret = [];
        var user_json = req.cookies.user;
        var user = null
        if(user_json != null ){
          user = JSON.parse(user_json || '[]')
//          console.log(user_json);
//          console.log(user.password );
        }        
        return user;        
    },
    valid_user:function(req){
        var ret = false;
        var user_json = req.cookies.user;
        if(user_json != null ){
            console.log( user_json )
            ret = true;
        }          
        return ret;
    },
    validRedisUserAuth:async function(res ,client, mail, password ){
        try{
            var ret = false
            const mgetAsync = promisify(client.mget).bind(client);
            const zrevrangeAsync = promisify(client.zrevrange).bind(client);
            var reply_sorted = await zrevrangeAsync("sorted-user", 0, -1 );
            var users = await mgetAsync(reply_sorted);
            users.forEach(function(item){
                var row = JSON.parse(item || '[]')

                if(row.mail == mail
                    && bcrypt.compareSync( password,  row.password )){
console.log( row );
// console.log( row.mail , hashed_password );
                    var json = JSON.stringify( row );
                    LibCookie.set_cookie(res, 'user', json)
                    ret = true
                }
            });
            return ret
        } catch (e) {
            console.log(e);
            return false
        }   
    },        

}