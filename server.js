const nodemailer =require('nodemailer');

let transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'meeting.planner.alert@gmail.com',
        pass:'meetingplanneralert'
    }
});
let mailOptions={
    from:'meeting.planner.alert@gmail.com',
    to:'sukrati.95@gmail.com',
    subject:'Hi, Sorry for the past can we have a chat',
    text: ''
}

transporter.sendMail(mailOptions,function(err,data){
    if(err){
        console.log(err);
    } 
    else {
        console.log('Email sent!!')
    }
})