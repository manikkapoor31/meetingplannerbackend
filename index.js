const express=require('express');
const path=require('path');
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const fs=require('fs');
const app=express();
const http=require('http');
const appConfig=require('./config/appConfig');
const logger=require('./libs/loggerLib');
const routeLoggerMiddleware=require('./middlewares/routeLogger');
const globalErrorMiddleware=require('./middlewares/appErrorHandler');
const mongoose=require('mongoose');
const morgan=require('morgan');

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'client')));
app.use(routeLoggerMiddleware.logIp);
app.use(globalErrorMiddleware.globalErrorHandler);

app.use(express.static(path.join(__dirname,'client')));

const modelsPath='./models';
const controllersPath='./controllers';
const libsPath='./libs';
const middlwwaresPath='./middlewares';
const routesPath='./routes';

app.all('*',function(req,res,next){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-requested-with,Content-Type,Accept');
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    next();
});
//bootstrap models
fs.readdirSync(modelsPath).forEach(function(file){
    if(~file.indexOf('.js')) require(modelsPath+'/'+file)
});
//end bootstrap models
fs.readdirSync(routesPath).forEach(function(file){
    if(~file.indexOf('.js')){
        let route=require(routesPath+'/'+file)
        route.setRouter(app)
    }
});
//ending bootstrap route
//calling the global 404 handler after route

app.use(globalErrorMiddleware.globalNotFoundHandler);
//end global 404 handler

/*
*create HTTP Server
*/

const server=http.createServer(app);
//start listening to http server
console.log(appConfig);
server.listen(appConfig.port);
server.on('error',onError);
server.on('listening',onListening);
//end serrver listening code

//socket.io event handler
const socketLib=require('./libs/socketLib')
const socketServer=socketLib.setServer(server)

/*
 *Event Listener for Http Server "error" event 
 */

function onError(error){
    if(error.syscall!=='listen'){
        logger.error(error.code+'not equal listen','serverOnErrorHandler',10)
        throw error;
    }

    //handle specificlisten errors with friendly messages
    switch(error.code){
        case'EACCES': logger.error(error.code+':elevated privileges required','serverOnErrorHandler',10)
                      process.exit(1)
                      break;
        case 'EADDRINUSE': logger.error(error.code+':port is already in use','serverOnErrorHandler',10)
                           process.exit(1)
                           break;
        default: logger.error(error.code+':some unknown error occured','serverOnErrorHandler',10)
        throw error
    }
}
/*
*Event Listener for HTTP sever 'listening event
 */
function onListening(){
    var addr=server.address()
    var bind=typeof addr==='string'?'pipe'+addr:'port'+addr.port;
    ('listening on'+ bind)
    logger.info('server listening on port'+addr.port,'serverOnListeningHandler',10);
    let db=mongoose.connect(appConfig.db.uri,{useMongoClient:true});
}
process.on('unhandledRejection',(reason,p)=>{
    console.log('Unhandled Rejection at : Promise',p,'reason:',reason)
    //application specific logging,throwing an error,or logic here
});
//database connection settings
mongoose.connection.on('error',function(err){
    console.log('database connection error')
    console.log(err)
    logger.error(errr,'mongoose connection on error handler',10)
    //process.exit(1)
});
//end mongoose connection error

mongoose.connection.on('open',function(err){
    if(err){
        console.log('databse error')
        console.log(err)
        logger.error(err,'mongoose connection open handler',10)
    }
    else{
        console.log('database connection open success')
        logger.info('database connection open','database connection open handler',10)
    }
    //process.exit(1)
});
//enr mongoose connection open handler
// end socket.io connection handler

module.exports=app