'use strict'
/*
*Module Dependencies*/
const mongoose = require('mongoose'),
Schema=mongoose.Schema;
let userSchema = new Schema({
    userId:{
        type:String,
        default:'',
        index:true,
        unique:true
    },
    firstName:{
        type:String,
        defafult:''
    },
    lastName:{
        type:String,
        default:''
    },
    password: {
      type: String,
      default: 'passskdajakdjkadsj'
    }, 
    email:{
        type:String,
        default:''
    },
    countryCode:{
        type:String,
        default:'+91'
    },
    mobileNumber:{
        type:Number,
        dafault:""
    }
})
mongoose.model('User',userSchema)