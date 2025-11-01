const express = require("express");
const signRouter=  express.Router();
<<<<<<< HEAD
const [add,remove] = require('../controllers/sign-controller');


=======
const [add,remove,getSign] = require('../controllers/sign-controller');

signRouter.get('/getSign' , getSign);
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
signRouter.post('/add' , add);
signRouter.delete('/remove/:id' , remove);

module.exports = signRouter;