const mongoose = require('mongoose')

const currentSchema = mongoose.Schema({
    type : {
        type : String,
        required: true,
        trim: true
    },
    balance : {
        type : Number,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },  
    transaction_time : {
        type : Date, 
       default: Date.now 
   }
})

const Current = mongoose.model('Current', currentSchema)

module.exports = Current