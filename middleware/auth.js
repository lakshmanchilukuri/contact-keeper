const jwt=require('jsonwebtoken');
const config=require('config');
module.exports=function(req,res,next){

const token=req.header('x-auth-token');
if(!token){
  res.status(500).send('No Token. Not Authorised!');

}
try{
const decoded= jwt.verify(token,config.get('jwt_secret'));
req.user=decoded.user;
next();


}
catch(err){
console.log(err.message);
res.status(500).send('Internal Server Error');
}
}