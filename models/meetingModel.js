const mongoose=require('mongoose')
const momemt=require('moment')
Schema=mongoose.Schema;
let meetingSchema=new Schema({
    meetingId:{
        type:String,
        default:'',
        index:true,
        unique:true
    },
    hostName:{
        type:String,
        defafult:''
    },
    recipientName:[],
    startTime:{
        type:Date,
        default:Date.now
    },
    endTime:{
        type:Date,
        default:Date.now
    },
    lastModified:{
        type:Date,
        default:Date.now
    },
    mobileNumber:{
        type:Number,
        dafault:""
    }
})
mongoose.model('Meeting',meetingSchema)