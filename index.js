const express=require('express')
const PORT=5000
const ejs=require('ejs')
const app=express()
const bodyParser=require('body-parser')

// app.use('views')

app.set('view engine','ejs')
app.set('views','./views')
app.use(express.urlencoded());
app.use('/',require('./routes/index'))
app.listen(PORT,(error)=>{
    if(error) 
    {
        console.log(`error in firing server`); 
        return;
    }
    console.log(`server is up on port ${PORT}`)
    
})