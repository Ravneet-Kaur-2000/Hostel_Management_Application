const express = require('express');
const path= require('path');

const router = express.Router();

const studentControllers= require('../controllers/student');

router.get('/get-student-details/:id/:email',studentControllers.getStudentDetails);

router.post('/get-student-details',studentControllers.postgetStudentDetails);

router.get('/occupancy/:email/:clg/:hostel',studentControllers.getOccupancy);

router.post('/occupancy',studentControllers.postOccupancy);

router.get('/room/:email/:clg/:hostel/:occ',studentControllers.getRoom);

router.post('/room',studentControllers.postRoom);

router.get('/profile/:email',studentControllers.getProfile);

router.get('/complaint/:email',studentControllers.getComplaint);

router.post('/complaint',studentControllers.postComplaint);

router.get('/reallocate/:email',studentControllers.getReallocate);

router.post('/reallocate',studentControllers.postReallocate);

router.get('/change-room/:email/:hostel_no/:room_no/:floor/:occ',studentControllers.getChange);

module.exports=router;