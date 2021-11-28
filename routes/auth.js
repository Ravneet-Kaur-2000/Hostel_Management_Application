const express = require('express');
const path= require('path');

const router = express.Router();

const authControllers= require('../controllers/auth');

router.get('/signup',authControllers.getSignUp);

router.post('/signup',authControllers.postSignUp);

router.get('/login',authControllers.getLogin);

router.post('/login',authControllers.postLogin);

module.exports=router;