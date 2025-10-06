
import jwt from 'jsonwebtoken';
//login seller:/api/seller/login

export const sellerLogin=async (req ,res)=>{
   try{
     const{email,password}=req.body;

    //check email  & password
if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL)
{

        //generate tokens ,needs to pass unique key here it is email and a payload
        const token=jwt.sign({email},process.env.JWT_SECRET,{expiresIn:'7d'});

        //set this token in cookie and send this into response
        console.log("Setting cookie token:", token);
res.cookie("sellerToken", token, {
  httpOnly: true,  //prevent js from accessing cookies
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
});
return res.json({
    success:true,
    message:"logged in"

})
    }
    else{
        return res.json({
            success:false,
    message:"invalid crendentials"
        });
    }

   }catch(error){
    console.log(error.message);
    res.json({
        success:false,
        message:error.message
    });
   }
}

//seller authentication: /api/seller/is-auth

export const isSellerAuth=async (req ,res)=>{
    try{

        //simply return success true whenever is seller is logged in
          return res.json({
      success: true,
    });
        
    }catch(error){
            console.log(error.message);
            res.json({
                success:false,
                message:error.message
            })
    }
}

//sellerLogout: /api/seller/logout

export const sellerLogout=async (req ,res)=>{
    try{

       res.clearCookie("sellerToken", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
});

        return res.json({
            success:true,
            message:" seller logged out "
        })
    }catch(error){
         console.log(error.message);
            res.json({
                success:false,
                message:error.message
            })
    }
}