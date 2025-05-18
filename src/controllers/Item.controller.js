import { ItemModel } from "../schema/ItemSchema.js"
import { UserModel } from "../schema/UserSchema.js"
import { CreateError } from "../utils/CreateError.js"

export const GetAllItems = async (req, res, next) => {
    try {
        const items = await ItemModel.find()
        return res.status(200).json({
            items,
            totalLength: items.length,
            success: true
        })
    } catch (error) {
        next(error)
    }
}

export const GetItem = async (req, res, next) => {
    try {
        const itemId = req.params.itemId
        if (!itemId) {
            throw CreateError(401, "Item Id Is Not Given")
        }
        const findItem = await ItemModel.findById(itemId)
        if (!findItem) {
            throw CreateError(409, "Item Not Found");
        }
        return res.status(200).json({
            findItem,
            success: true
        })
    } catch (error) {
        next(error)
    }
}

export const CreateItem = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }


        const findUser = await UserModel.findById(userId)
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }



        const { title, description, location, imageUrl, tags } = req.body
        if (!title || !description || !imageUrl) {
            throw CreateError(401, "Item Details Are Not Provided");
        }
        if (!location.lat || !location.lng || !location.address) {
            throw CreateError(401, "Location Is Not Given");
        }

        findUser.karma += 10
        await findUser.save()

        const CreatedItem = await ItemModel({ title, description, imageUrl, owner: userId, tags: tags, location: { lat: location.lat, lng: location.lng, address: location.address } })
        await CreatedItem.save()
        return res.status(201).json({
            message: "Item Posted",
            success: true,
            CreatedItem
        })
    } catch (error) {
        next(error)
    }
}

export const UpdateItem = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const { itemId } = req.params
        if (!itemId) {
            throw CreateError(400, "Item Id Is Not Found");
        }

        const findItem = ItemModel.findById(itemId)
        if (!findItem) {
            throw CreateError(409, "Item Is Not Found")
        }

        if (findItem.owner.toString() !== userId) {
            throw CreateError(409, "You Can Only Update Your Item")
        }

        const body = req.body
        const updatedItem = await ItemModel.findOneAndUpdate(itemId, body, { new: true })
        return res.status(200).json({
            message: "Item Updated",
            success: true,
            updatedItem
        })
    } catch (error) {
        console.log("error in updating item ", error)
        next(error)
    }
}

export const DeleteItem = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const { itemId } = req.params
        if (!itemId) {
            throw CreateError(400, "Item Id Is Not Found");
        }

        const findItem = ItemModel.findById(itemId)
        if (!findItem) {
            throw CreateError(409, "Item Is Not Found")
        }


        if (findItem.owner.toString() !== userId) {
            throw CreateError(409, "You Can Only Delete Your Item")
        }

        await ItemModel.findOneAndDelete(itemId)
        return res.status(200).json({
            message: "Item Deleted",
            success: true
        })
    } catch (error) {
        console.log("error in deleting Item ", error)
        next(error)
    }
}

export const ClaimItem = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const itemId = req.params.itemId
        if (!itemId) {
            throw CreateError(401, "Item Id Is Not Given")
        }
        const findItem = await ItemModel.findById(itemId)
        if (!findItem) {
            throw CreateError(409, "Item Not Found");
        }

        const findUser = await UserModel.findById(userId)
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }

        if (findItem.owner.toString() === userId) {
            throw CreateError(409, "Owner Can't Claim Item")
        }

        findUser.karma += 5
        await findUser.save()

        findItem.claimedBy = userId
        await findItem.save()
        return res.status(200).json({
            message: "Item has been claimed by " + findUser.name,
            success: true,
            findItem
        })

    } catch (error) {
        console.log("error in claiming item ", error)
        next(error)
    }
}

export const GetClaimedItemsBasedOnUserId = async (req, res, next) => {
    try {
        const { userId } = req.params
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }

        const findUser = await UserModel.findById(userId)
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }

        const claimedItems = await ItemModel.find({ claimedBy: userId })
        return res.status(200).json({
            claimedItems,
            success: true
        })
    } catch (error) {
        console.log("Error in getting claimed items ", error)
        next(error)
    }
}

export const GetOwnedItemsBasedOnUserId = async (req, res, next) => {
    try {
        const { userId } = req.params
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }

        const findUser = await UserModel.findById(userId)
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }

        const ownedItems = await ItemModel.find({ owner: userId })
        return res.status(200).json({
            ownedItems,
            success: true
        })
    } catch (error) {
        console.log("Error in getting owned items ", error)
        next(error)
    }
}