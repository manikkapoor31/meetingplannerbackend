/**
 * Modules Dependencies
 */

const socketio=require('socket.io')
const mongoose=require('mongoose')
const shortid=require('shortid')
const logger=require('./../libs/loggerLib')
const events=require('events')
const eventEmitter=new events.EventEmitter

const tokenLib=require('./tokenLib.js')
const check=require('./checkLib')
const response=require('./responseLib')

let setserver=(server)=>{// server is the http server
    let allOnlineUsers=[]
    let io=socketio.listen(server);
    let myIo=io.of('')

    myIo.on('connection',(socket)=>{
        let myIo=io.of('')
        myIo.on('connection',(socket)=>{
            console.log('on conection-- emitting verify user')
            socket.emit('verifyUser',"")

            //code to verify the user and make him online
            socket.on('set-user',(authToken)=>{
                console.log('set-User called')
                tokenLib.verifyClaimWIthoutSecret(authToken,(err,user)=>{
                    if(err){
                        socket.emit('auth-error',{status:404,error:'Please'})
                    }
                    else{
                        console.log('user is verfied..setting details');
                        let currentUser=user.data
                        //seetting socket id
                        socket.userId=currentUser.userId
                        let fullName=`${currentUser.fullName} ${currentUser.lastName}`
                        console.log(`${fullName} is online`)

                        let userObj={userId:currentUser.userId,fullName:fullName}
                        allOnlineUsers.push(userObj)
                        console.log(allOnlineUsers)

                        //setting room name
                        socket.join(socket.room)
                        socket.to(socket.room).broadcast.emit('online-user-list',allOnlineUsers)
                    }
                })
            })
            socket.on('disconnect',()=>{
                console.log("user is disconnected");
                var removeIndex=allOnlineUsers.map(function(user){return user.userId}).indexOf(socket.userId);
                allOnlineUsers.splice(removeIndex,1)
                console.log(allOnlineUsers)
                

                socket.to(socket.room).broadcast.emit('online-user-list',allOnlineUsers);
                socket.leave(socket.room)
                
            })
            socket.on('chat-msg',(data)=>{
                console.log("socket chat-msg called")
                console.log(data);
                data['chatId']=shortid.generate()
                console.log(data);
    
                //event to save chat
                setTimeout(function(){
                    eventEmitter.emit('save-chat',data)
                },2000)
                myIo.emit(data.receiverId,data)
            })
            socket.on('typing',(fullName)=>{
                socket.to(socket.room).broadcast.emit('typing',fullName)
            })
        })  
        
    })

}
eventEmitter.on('save-chat',(data)=>{
    let newChat=new chatModel({
        chatId:data.senderName,
        senderName:data.senderName,
        senderId:data.senderId,
        receiverName:data.receiverName,
        receiverId:data.receiverId,
        message:data.message,
        chatRoom:data.chatRoom||'',
        createdOn:data.data.createdOn
    });
    newChat.save((err,redult)=>{
        if(err){
            console.log("error occured")
        }
        else if(result =='undefined'|| result == null|| result ==""){
            console.log("chat is not saved");
        }
        else{
            console.log("Chat Saved");
            console.log(result);
        }
    })
});
module.exports={
    setServer:setserver
}