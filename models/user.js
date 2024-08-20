const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    nickname: {
        type: String
    },
    cardholder: {
        type: String,
        required: true
    }, 
    cardNumber: {
        type: String,
        required: true
    },
    expiry: {
        type: String,
        required: true
    } 
});

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    }
})

const rentalSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    dateOut: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'out', 'returned'],
        default: 'pending'
    }
})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    plan: { 
        type: String,
        enum: ['Basic', 'Pro', 'Elite'],
       
    },
    paymentMethods: [paymentMethodSchema],
    addresses: [addressSchema],
    rentals: [rentalSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;