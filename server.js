const express=require('express');

const app=express();

const port=5000;

app.get('/',(req,res)=>res.json({"msg":"in end point"}  ))

app.listen(port, ()=>console.log('server started at '+port));