import { UserModel } from "../schema/UserSchema.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { CreateError } from "../utils/CreateError.js"
dotenv.config()

export const RegisterUser = async (req, res, next) => {
    try {
        const { email, name, password, location } = req.body
        if (!email || !name || !password || !location) {
            throw CreateError(401, "Details Are Not Provided");
        }
        const isUserFound = await UserModel.findOne({ email: email })
        if (isUserFound) {
            throw CreateError(409, "User Already Exists");
        }

        const hashedPassword = bcrypt.hash(password, 10)

        const newUser = await UserModel({ email, password: hashedPassword, name, location: location })
        await newUser.save()
        return res.status(201).json({
            success: true,
            message: "User Is Created"
        })

    } catch (error) {
        console.log("Error in creating user ", error)
        next(error);
    }
}

export const LoginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            throw CreateError(401, "Credentials Are Not Provided");
        }
        const isUserFound = await UserModel.findOne({ email: email })
        if (!isUserFound) {
            throw CreateError(409, "User Not Found. Register Yourself First");
        }

        const isPasswordCorrect = await bcrypt.compare(password, isUserFound.password);
        if (!isPasswordCorrect) {
            throw CreateError(401, "Incorrect credentials");
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw CreateError(500, "Jwt Secret Not Found");
        }


        const token = jwt.sign(
            { email: isUserFound.email, userId: isUserFound._id },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login Successfull",
            success: true,
            token,
            user: {
                email: isUserFound.email,
                name: isUserFound.name,
                id: isUserFound._id
            }
        })


    } catch (error) {
        console.log("Error in Logging user ", error)
        next(error);
    }
}

export const GetUser = async (req, res, next) => {
    try {
        const userId = req.params.userId
        if (!userId) {
            throw CreateError(401, "User Id Is Not Given")
        }
        const findUser = await UserModel.findOne(userId).select("-password")
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }

        return res.status(200).json({
            user: findUser,
            success: true,
        })
    } catch (error) {
        console.log("Error in finding user ", error)
        next(error)
    }
}

export const GetUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find().sort("-karma").select("-password")
        return res.status(200).json({
            users,
            success: true
        })
    } catch (error) {
        console.log("Error in finding users ", error)
        next(error)
    }
}

export const UpdateUser = async (req, res, next) => {
    try {
        const { _, userId } = req.user;
        if (!userId) {
            throw CreateError(400, "You Are Not Logged In");
        }

        const findUser = await UserModel.findOne({ _id: userId });
        if (!findUser) {
            throw CreateError(404, "User not found");

        }

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: userId },
            req.body,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error in updating user:", error);
        next(error)
    }
};

export const GetAuthenticatedUser = async (req, res, next) => {
    try {
        const { _, userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Logged In");
        }
        const findUser = await UserModel.findOne({ _id: userId }).select("-password");
        if (!findUser) {
            throw CreateError(404, "User not found");

        }
        return res.status(200).json({
            success: true,
            message: "User found successfully",
            user: findUser
        });
    } catch (error) {
        console.error("Error in getting user:", error);
        next(error)
    }
}
