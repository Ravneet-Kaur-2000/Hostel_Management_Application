const express = require('express');
const path= require('path');

const router = express.Router();

const adminControllers= require('../controllers/admin');

router.get('/viewStudents',adminControllers.viewStudents);

router.get('/viewComplaints',adminControllers.viewComplaints);

router.get('/addNewRoom',adminControllers.getAddRoom);

router.post('/addNewRoom',adminControllers.postAddRoom);

router.get('/addNewStudent',adminControllers.getAddNewStudent);

router.post('/addNewStudent',adminControllers.postAddNewStudent);

router.get('/deleteStudent',adminControllers.getDeleteStudent);

router.post('/deleteStudent',adminControllers.postDeleteStudent);

router.get('/reportGeneration',adminControllers.reportGeneration);

module.exports=router;