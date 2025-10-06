import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middleware/authSeller.js';
import { addProduct, changeProduct, ProductById, productList } from '../controller/productController.js';

const productRouter = express.Router();

productRouter.post('/add', upload.array(["images"]), authSeller, addProduct)
productRouter.get('/list', productList)
productRouter.get('/id', ProductById)
productRouter.post('/stock', authSeller, changeProduct)

export default productRouter;