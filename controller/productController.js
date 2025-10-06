import connectCloudinary from "../configs/claudinary.js";
import cloudinary from "cloudinary"
import Product from "../models/Product.js";



//Add product:/api/product/add
export const addProduct = async (req, res) => {
  try {
    let productdata = JSON.parse(req.body.productData)
    // let productdata = JSON.parse(req.body.formData)
    const images = req.files
    console.log("Images : ", images)
    console.log("product data", productdata);
    if (images.length < 1) {
      return res.json({
        success: false,
        message: "Please upload atleast an image"
      })
    }

    await connectCloudinary()
    let imageUrl = await Promise.all(
      images.map(async (item) => {
        try {
          let result = await cloudinary.v2.uploader.upload(item.path, {
            resource_type: 'image',
          });
          return result.secure_url;
        } catch (err) {
          console.error(`Upload failed for ${item.path}:`, err);
          return null; // or skip this one
        }
      })
    );
    console.log("image uploaded")
    await Product.create({ ...productdata, image: imageUrl })
    return res.json({
      success: true,
      message: "product added"
    })
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: error.message
    })
  }
}

//Get product:/api/product/list
export const productList = async (req, res) => {
  try {
    // console.log("Enter")
    const products = await Product.find({})
    // console.log("Products ", products)
    res.json({
      success: true,
      products
    })
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    })
  }
}
//Get Single product:/api/product/id
export const ProductById = async (req, res) => {
  try {
    const { id } = req.body
    const product = await Product.findById(id)
    res.json({
      success: true,
      product
    })
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    })
  }
}

//Change product in stock:/api/product/stock
export const changeProduct = async (req, res) => {
  try {

    const { id, inStock } = req.body
    const product = await Product.findById(id, { inStock })
    res.json({
      success: true,
      message: "stock updated"
    })
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    })
  }
}