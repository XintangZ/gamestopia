// how to use: node seed.js
// after running this file, you will be able to login using the following credentials
// email: user1@gmail.com, password: Password1

const mongoose = require('mongoose');
const User = require('./models/user');

mongoose
    .connect('mongodb://127.0.0.1:27017/gamestopia')
    .then(() => console.log('connected to gamestopia'))
    .catch(err => console.error('connection error', err));

const userData = {
    username: 'user1',
    email: 'user1@gmail.com',
    password: '$2b$10$1UepXJTfNAl0GJ2JJFM3DOYh1EUdEyAF87dxcH3WGwZjFom1V06V2',
    plan: 'Pro',
    paymentMethods: [
        {
            nickname: 'Main Card',
            cardholder: 'John Doe',
            cardNumber: '374245455400126',
            expiry: '12/24',
        },
    ],
    addresses: [
        {
            name: 'John Doe',
            street: '123 Main St',
            city: 'Exampleville',
            province: 'QC',
            postalCode: 'A1B 2C3',
        },
    ],
    rentals: [],
};

async function seedDatabase() {
    try {
        const newUser = await User.create(userData);
        console.log('Example user created:', newUser);
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();
