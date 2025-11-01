const express = require('express');
const UserRouter = express.Router();
<<<<<<< HEAD
const [signup,login,remove,verify,userInfo,updateSign,getUser] = require('../controllers/user-controller');

UserRouter.get('/get/:id' , getUser);
UserRouter.get('/verify' , verify);
UserRouter.get('/userInfo' , userInfo);
UserRouter.post('/signup' , signup);
UserRouter.post('/updateSign' , updateSign);
UserRouter.post('/login' , login);
UserRouter.delete('/delete' , remove)



module.exports = UserRouter;

=======
const [
  signup,
  login,
  remove,
  verify,
  userInfo,
  updateSign,
  getUser,
  updateProfile,
  deleteAccount,
  changePassword
] = require('../controllers/user-controller');

UserRouter.get('/get/:id', getUser);
UserRouter.get('/verify', verify);
UserRouter.get('/userInfo', userInfo);

UserRouter.post('/signup', signup);
UserRouter.post('/login', login);
UserRouter.post('/updateSign', updateSign);


UserRouter.put('/updateProfile', updateProfile);

UserRouter.put('/changePassword', changePassword);

UserRouter.delete('/delete', remove);

module.exports = UserRouter;


>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
