import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
  const { email, password, skills = [] , role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Enter each field" });
    }

    const alreadyAccount = await User.findOne({ email });

    if (alreadyAccount) {
      return res.status(409).json({
        // 409 for https status for any conflict
        message: "An account is already associated with this email id.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashPassword,
      skills,
      role
    });

    //Fire inngest events
    inngest.send({
      name: "user/signup", // this is the trigger name of the event
      data: { email },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({ message: "Field must not be empty" });
    }

    const userFound = User.findOne({ email });

    if (!userFound) {
      return res.status(401).json({ error: "User not found." });
    }

    const isMatch = bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Credentials are not correct." });
    }

    const token = jwt.sign(
      {
        _id: userFound._id,
        role: userFound.role,
      },
      process.env.JWT_SECRET
    );

    res.json({ userFound, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

export const logout = async(req,res)=>{
    try {
       const token =   req.headers.authorization.split(" ")[1]
       
       if(!token){
        return res.status(401).json({error:"User is unauthorized"});
       }

       jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err) return res.status(401).json({error:"Unauthorized"})
        
            res.json({message:"Logout successfully"})
       })

      
    } catch (error) {
        res.status(500).json({ error: "Login failed", details: error.message });
   
    }
}

export const updateUser = async(req,res)=>{
    const {skills=[] , role , email } = req.body;

    try {
        if(req.user?.role !== "admin"){
            return res.status(403).json({error:"Forbidden"})
        }

       const user = User.findOne({email})

       if(!user) return res.status(401).json({error:"User not found."})
        
        await User.updateOne(
            {email},
            {skills: skills.length ? skills : user.skills , role}
        )

        return res.json({message: "User updated successfully"})
    } catch (error) {
        res.status(500).json({ error: "Update failed", details: error.message });
    }
}

export const getUsers = async(req,res)=>{
 try {
    if(req.user?.role !== "admin"){
       return res.status(403).json({error: "Forbidden"})
    }

    const users = await User.find().select("-password")

    return res.json({users})
 } catch (error) {
    res.status(500).json({ error: "Fail to fetch users.", details: error.message });

 }
}