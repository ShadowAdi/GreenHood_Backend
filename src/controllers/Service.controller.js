import { ServiceModel } from "../schema/ServiceSchema.js"
import { UserModel } from "../schema/UserSchema.js"
import { CreateError } from "../utils/CreateError.js"

export const GetAllServices = async (req, res, next) => {
    try {
        const services = await ServiceModel.find()
        return res.status(200).json({
            services,
            totalLength: items.length,
            success: true
        })
    } catch (error) {
        console.log("Error in getting services ", error)
        next(error)
    }
}

export const GetService = async (req, res, next) => {
    try {
        const serviceId = req.params.serviceId
        if (!serviceId) {
            throw CreateError(401, "Service Id Is Not Given")
        }
        const findService = await ServiceModel.findById(itemId)
        if (!findService) {
            throw CreateError(409, "Service Not Found");
        }
        return res.status(200).json({
            findService,
            success: true
        })
    } catch (error) {
        console.log("Failed to get the service")
        next(error)
    }
}

export const CreateService = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }


        const findUser = await UserModel.findById(userId)
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }



        const { title, description, location, category, contactInfo } = req.body
        if (!title || !description || !contactInfo || !category) {
            throw CreateError(401, "Service Details Are Not Provided");
        }
        if (!location.lat || !location.lng || !location.address) {
            throw CreateError(401, "Location Is Not Given");
        }

        findUser.karma += 10
        await findUser.save()

        const CreatedService = await EventModel({ title, description, category, postedBy: userId, contactInfo, location: { lat: location.lat, lng: location.lng, address: location.address } })
        await CreatedService.save()
        return res.status(201).json({
            message: "Service Created",
            success: true,
            CreateService
        })
    } catch (error) {
        console.log("Error in Creating Service ", error)
        next(error)
    }
}

export const UpdateService = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const findUser = await UserModel.findById(userId)
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }

        const { serviceId } = req.params
        if (!serviceId) {
            throw CreateError(400, "Service Id Is Not Found");
        }

        const findService = ServiceModel.findById(serviceId)
        if (!findService) {
            throw CreateError(409, "Service Is Not Found")
        }

        if (findService.postedBy.toString() !== userId) {
            throw CreateError(409, "You Can Only Update Your Service")
        }

        const body = req.body
        const updatedService = await ServiceModel.findOneAndUpdate(serviceId, body, { new: true })
        return res.status(200).json({
            message: "Service Updated",
            success: true,
            updatedService
        })
    } catch (error) {
        console.log("error in updating service ", error)
        next(error)
    }
}

export const DeleteService = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const findUser = await UserModel.findById(userId)
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }

        const { serviceId } = req.params
        if (!serviceId) {
            throw CreateError(400, "Service Id Is Not Found");
        }

        const findService = ServiceModel.findById(serviceId)
        if (!findService) {
            throw CreateError(409, "Service Is Not Found")
        }


        if (findService.postedBy.toString() !== userId) {
            throw CreateError(409, "You Can Only Delete Your Item")
        }

        await ServiceModel.findOneAndDelete(serviceId)
        return res.status(200).json({
            message: "Service Deleted",
            success: true
        })
    } catch (error) {
        console.log("error in deleting Service ", error)
        next(error)
    }
}

export const GetUserServices = async (req, res, next) => {
    try {
        const { userId } = req.params
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const findUser = await UserModel.findById(userId)
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }

        const services = await ServiceModel.find({ postedBy: userId })
        return res.status(200).json({
            services,
            totalLength: items.length,
            success: true
        })
    } catch (error) {
        console.log("Error in getting user services ", error)
        next(error)
    }
}
