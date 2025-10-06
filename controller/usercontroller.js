



import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//register user:/api/user/register
export const register=async(req,res)=>{
    try{
        const{name,email,password}=req.body;

        //check if all fields entered
        if(!name||!email||!password){
            return res.json({
                success:false,
                message:"details missing"
            })
        }
        //check the user if exists already or not
         const existingUser=await User.findOne({email})
      //if user  exists 
         if(existingUser){
            return res.json({
                success:false,
                message:"user already exists"
            })
         }

         //if not exists,create the user and store in DB
         const hashedPassword=await bcrypt.hash(password,10)

         const user=await User.create({name,email,password:hashedPassword})
         // create/sign a token,whenever a new user is added into mongoose db it will autometically create a propert ._id
         const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
console.log("Setting cookie token:", token);
res.cookie("token", token, {
  httpOnly: true,  //prevent js from accessing cookies
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

        return res.json({
            success:true,
            user:{email:user.email,name:user.name}
        })
    }catch(error){
        console.log(error.message);
        res.json({
            success:false,
            message:error.message
        });
    }
}


//login user:/api/user/login

export const login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email||!password)
            return res.json({
        success:false,
        message:"email and password reqired"

    });
            const user=await User.findOne({email});

            if(!user){
                return res.json({
                    success:false,
                    message:'user does not exists'
                });
            }
            const isMatch=await bcrypt.compare(password,user.password)

            if(!isMatch) return res.json({
                success:false,
                message:"invalid email or password"
            });
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
        console.log("Setting cookie token:", token);
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

        return res.json({
            success:true,
            user:{email:user.email,name:user.name}
        })
    } catch(error){
 console.log(error.message);
        res.json({
            success:false,
            message:error.message
        });
    }
}

//auth controller:check if user is authinticated or not (authUser middleware used)
//    /api/user/is-auth
export const isAuth=async (req ,res)=>{
    try{
        const {userId}=req.userId;
        const user=await User.findById(userId).select("-password");
        if(!user){
            return res.json({
            success:false,
             message: "User not found"

        });
        }
          return res.json({
      success: true,
      user
    });
        
    }catch(error){
            console.log(error.message);
            res.json({
                success:false,
                message:error.message
            })
    }
}
//logout user : /api/user/logout
export const logout=async (req ,res)=>{
    try{

       res.clearCookie("token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
});

        return res.json({
            success:true,
            message:" user logged out "
        })
    }catch(error){
         console.log(error.message);
            res.json({
                success:false,
                message:error.message
            })
    }
}