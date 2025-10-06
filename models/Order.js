// import mongoose from "mongoose";


// const orderSchema=new mongoose.Schema({
// userId:{
//     type:String,
//     required:true,
//     ref:'user'
// },
// items:[{
// product:{type:String,required:true,ref:'product'},
// quantity:{type:Number,required:true}
// }],
// amount:{type:Number,required:true},
// address:{type:String,required:true,ref:address},
// paymentType:{type:String,required:true,default:false},
// isPaid:{type:Boolean,required:true,default:false},


// },{timestamps:true})

// const Order=mongoose.modelNames.order||mongoose.model('order',orderSchema)

// export default Order

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // matches your User model name
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product", // matches your Product model name
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address", // must match Address model name
      required: true,
    },
    paymentType: { type: String, required: true }, // default should not be false if it's a string
    isPaid: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Order =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
