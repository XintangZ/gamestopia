const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');
const User = require('./models/user');
require('dotenv').config();

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' }),
    ],
});

mongoose
    .connect('mongodb://127.0.0.1:27017/gamestopia')
    .then(() => console.log('connected to gamestopia'))
    .catch(err => console.error('connection error', err));

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    logger.info(`${req.method}: ${req.url}`);
    next();
});

// authenticate a user
app.post('/users', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send('User not found');
    }

    try {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
            res.status(200).send(user);
        } else {
            res.status(401).send('Authentication failed');
        }
    } catch (error) {
        logger.error('Error authenticating user: ', error);
        res.status(500).send('Internal server error');
    }
});

// create a user
app.post('/users/new', async (req, res) => {
    const { email, username, password, plan } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.status(409).send('Email already in use');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
            plan,
        });
        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        logger.error('Error creating user: ', error);
        res.status(500).send('Internal server error');
    }
});

// get a user by id
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(400).send('User not found');
    }
    return res.status(200).send(user);
});

// update a user
app.patch('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).send('User not found');
        }

        const { plan, addresses, paymentMethods } = req.body.user;

        const updatedUser = await User.findByIdAndUpdate(
            { _id: id },
            { $set: { paymentMethods, addresses, plan } },
            { new: true }
        );

        res.status(201).send(updatedUser);
    } catch (error) {
        logger.error('Error updating user: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// update address
app.patch('/users/:id/address', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).send('User not found');
        }

        let updatedUser;
        const { addressIdValue, name, street, city, province, postalCode } = req.body;
        if (addressIdValue) {
            updatedUser = await User.findOneAndUpdate(
                { _id: id, 'addresses._id': addressIdValue },
                { $set: { 'addresses.$': { name, street, city, province, postalCode } } },
                { new: true }
            );
        } else {
            const newAddress = { name, street, city, province, postalCode };
            updatedUser = await User.findByIdAndUpdate(
                id,
                { $push: { addresses: newAddress } },
                {
                    runValidators: true,
                    new: true,
                }
            );
        }
        res.status(201).send(updatedUser);
    } catch (error) {
        logger.error('Error updating address: ', error);
        res.status(500).send('Internal Server Error');
    }
});

//delete address record
app.delete('/users/:id/address', async (req, res) => {
    const { id } = req.params;
    const addressId = req.body.objId;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: id },
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        );
        res.status(200).send(updatedUser);
    } catch (error) {
        logger.error('Error deleting address: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// update payment method
app.patch('/users/:id/payment', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).send('User not found');
        }

        let updatedUser;
        const { paymentIdValue, nickname, cardholder, cardNumber, expiry } = req.body;
        if (paymentIdValue) {
            updatedUser = await User.findOneAndUpdate(
                { _id: id, 'paymentMethods._id': paymentIdValue },
                { $set: { 'paymentMethods.$': { nickname, cardholder, cardNumber, expiry } } },
                { new: true }
            );
        } else {
            const newPayment = { nickname, cardholder, cardNumber, expiry };
            updatedUser = await User.findByIdAndUpdate(
                id,
                { $push: { paymentMethods: newPayment } },
                {
                    runValidators: true,
                    new: true,
                }
            );
        }
        res.status(201).send(updatedUser);
    } catch (error) {
        logger.error('Error updating payment method: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// delete payment method
app.delete('/users/:id/payment', async (req, res) => {
    const { id } = req.params;
    const paymentId = req.body.objId;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: id },
            { $pull: { paymentMethods: { _id: paymentId } } },
            { new: true }
        );
        res.status(200).send(updatedUser);
    } catch (error) {
        logger.error('Error deleting payment method: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// update plan
app.patch('/users/:id/plan', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).send('User not found');
        }
        const { plan } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { plan } },
            {
                new: true,
            }
        );
        res.status(200).send(updatedUser);
    } catch (error) {
        logger.error('Error updating user plan: ', error);
        res.status(500).send('Internal server error');
    }
});

// delete a user
app.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await User.findByIdAndDelete(userId);
        res.status(204).end();
    } catch (error) {
        logger.error('Error deleting user: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// add rentals
app.post('/users/:id/rental', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).send('User not found');
        }

        const { gameId, title, imgUrl, dateAdded, dateOut, status } = req.body;

        const newRental = { gameId, title, imgUrl, dateAdded, dateOut, status };
        const rentalAdded = await User.findByIdAndUpdate(
            userId,
            { $push: { rentals: newRental } },
            {
                runValidators: true,
                new: true,
            }
        );

        res.status(201).send(rentalAdded);
    } catch (error) {
        logger.error('Error adding rental: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// update rental status
app.patch('/users/:id/rental', async (req, res) => {
    const userId = req.params.id;
    const { gameId } = req.body;

    try {
        let updatedUser;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).send('User not found');
        }

        const rental = user.rentals.find(
            rental => rental.gameId === gameId && rental.status === 'out'
        );
        if (!rental) {
            return res.status(400).send('Rental not found');
        }

        rental.status = 'returned';
        updatedUser = await user.save();

        const pendingRental = user.rentals.filter(rental => rental.status === 'pending');

        if (pendingRental.length) {
            pendingRental[0].status = 'out';
            pendingRental[0].dateOut = Date.now();

            updatedUser = await user.save();
        }

        res.status(201).send(updatedUser);
    } catch (error) {
        logger.error('Error updating rental status: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(process.env.PORT, () => {
    logger.info(`Server is running on http://localhost:${process.env.PORT}`);
});
