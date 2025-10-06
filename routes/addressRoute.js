import express from 'express';
import authUser from '../middleware/authUser.js';
import { addAddress, getAddress } from '../controller/addressConroller.js';


const addAddressRouter=express.Router();
addAddressRouter.post('/add',authUser,addAddress);
addAddressRouter.get('/get',authUser,getAddress);

export default addAddressRouter;


