const UserModel = require('../models/UserModel');
const AwsService = require('../AWS/aws');
const mongoose = require('mongoose');

//validation function.....
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)

}

// ...................first API(create product)............................

const newProduct = async (req, res) => {
    try {
        const data = req.body;
        const file = req.files;

        const keys = Object.keys(data);

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: 'Please Input Data' });
        }

        console.log(keys.length)

        // ...............data validation........................................
        const requiredFields = ['title', 'description', 'price', 'category'];
        for (let i = 0; i < requiredFields.length; i++) {
            if (data[requiredFields[i]] === undefined) {
                return res.status(400).send({ status: false, message: `${requiredFields[i]} field is required` });
            }
        }

        // validation to check duplicate title.....................
        const isTitleAlreadyUsed = await UserModel.findOne({ title: data.title })
        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: "Title is already used" })
        }

        // inserting product image in AWS s3 bucket...............
        if (file && file.length > 0) {
            if (file[0].mimetype.indexOf('image') == -1) {    //here I am checking that inserted file is image or not
                return res.status(400).send({ status: false, message: 'Only image files are allowed !' });
            }
            const profile_url = await AwsService.uploadFile(file[0]);
            console.log(profile_url); 
            data.productImage = profile_url.Location;
        }
        else {
            return res.status(400).send({ status: false, message: 'Product Image field is required' });
        }

        const productCreated = await UserModel.create(data);
        return res.status(201).send({ status: true, message: "Product created  successfully", data: productCreated });
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


// ...................second API(FETCH ALL THE PRODUCTS).........................

const getProducts = async (req, res) => {
    try {
        const fetchAllProducts = await UserModel.find({ isDeleted: false, deletedAt: null }).sort({ price: 1 });
        if (fetchAllProducts.length == 0) {
            return res.status(404).send({ status: false, message: 'Product not found !' });
        }
        return res.status(200).send({ status: true, message: 'fetch success', count: fetchAllProducts.length, data: fetchAllProducts });
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}


// ..................THIRD api(FILTER PRODUCT BY NAME(TITLE) AND CATEGORY)....................

const filterProduct = async (req, res) => {
    try {
        const data = req.query;
        const keys = Object.keys(data);

        // Validations
        if (keys.length > 0) {
            const requiredParams = ['title', 'category'];
            for (let i = 0; i < keys.length; i++) {
                if (!requiredParams.includes(keys[i])) {
                    return res.status(400).send({ status: false, message: `Only title and category are allowed` });
                }
            }

            let dataToBeFilter = {};                //Creating empty object
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] == 'title') {
                    dataToBeFilter.title = data.title;
                }
                else if (keys[i] == 'category') {
                    dataToBeFilter.category = data.category
                }
            }

            console.log(dataToBeFilter)
            dataToBeFilter.isDeleted = false;
            dataToBeFilter.deletedAt = null;

            const filterData = await UserModel.find(dataToBeFilter).sort({ price: 1 });
            if (filterData.length == 0) {
                return res.status(404).send({ status: false, message: 'Product not found !' });
            }

            return res.status(200).send({ status: true, message: 'fetch success', count: filterData.length, data: filterData });

        }
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}


// ............ fourt API (update particular product by ID)...........................

const updateProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const data = req.body;
        const keys = Object.keys(data);
        const file = req.files;

        // validations
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: 'Please  Input Some Data' });
        }
        if (!isValidObjectId(productId.trim())) {
            return res.status(400).send({ status: false, message: 'Invalid ID !' });
        }
        const productRes = await UserModel.findById(productId);
        if (!productRes) {
            return res.status(404).send({ status: false, message: 'Product not found !' });
        }
        if (productRes.isDeleted === true && productRes.deletedAt != null) {
            return res.status(404).send({ status: false, message: 'Product not found !' });
        }
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] == '_id') {
                return res.status(400).send({ status: false, message: 'You are not allow to update id property' });
            }
        }


        // validation for duplicate title(name).......
        const isTitleAlreadyUsed = await UserModel.findOne({ title: data.title })
        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: "Title is already used" })
        }

        if (file && file.length > 0) {
            if (file[0].mimetype.indexOf('image') == -1) {
                return res.status(400).send({ status: false, message: 'Only image files are allowed !' });
            }
            const profile_url = await AwsService.uploadFile(file[0]);
            data.productImage = profile_url;
        }
        const updateRes = await UserModel.findByIdAndUpdate(productId, data, { new: true });
        return res.status(200).send({ status: true, message: `${Object.keys(data).length} field has been updated successfully !`, data: updateRes });

    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


// ..................fifth API(delete perticular product )...................

const deleteProductById = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!isValidObjectId(productId.trim())) {
            return res.status(400).send({ status: false, message: 'Invalid ID !' });
        }
        const productRes = await UserModel.findById(productId);
        if (!productRes) {
            return res.status(404).send({ status: false, message: 'Product not found !' });
        }
        if (productRes.isDeleted && productRes.deletedAt != null) {
            return res.status(404).send({ status: false, message: 'Product not found !' });
        }

        const deleteRes = await UserModel.findByIdAndUpdate(productId, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return res.status(200).send({ status: true, message: `Delete success`, data: deleteRes });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports.newProduct = newProduct
module.exports.getProducts = getProducts
module.exports.filterProduct = filterProduct
module.exports.updateProductById = updateProductById
module.exports.deleteProductById = deleteProductById