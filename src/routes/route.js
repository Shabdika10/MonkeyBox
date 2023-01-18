const express = require('express');
const router = express.Router();


const userController = require('../controllers/UserController');

router.post('/createProduct', userController.newProduct);
router.get('/getAllProducts', userController.getProducts)
router.get('/filterProduct', userController.filterProduct)
router.put('/updateData/:productId', userController.updateProductById)
router.delete('/deleteProduct/:productId', userController.deleteProductById)


module.exports = router;
