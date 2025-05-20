import { EventModel } from "../schema/EventSchema.js"
import { UserModel } from "../schema/UserSchema.js"
import { CreateError } from "../utils/CreateError.js"

export const GetAllEvents = async (req, res, next) => {
    try {
        const events = await EventModel.find().populate("organizer", "_id name email").populate("attendees", "_id name email")
        return res.status(200).json({
            events,
            totalLength: events.length,
            success: true
        })
    } catch (error) {
        next(error)
    }
}


export const GetEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId
        if (!eventId) {
            throw CreateError(401, "Event Id Is Not Given")
        }
        const findEvent = await EventModel.findById(eventId)
        if (!findEvent) {
            throw CreateError(409, "Event Not Found");
        }
        return res.status(200).json({
            findEvent,
            success: true
        })
    } catch (error) {
        next(error)
    }
}

export const CreateEvent = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const findUser = await UserModel.findById(userId)
        if (!findUser) {
            throw CreateError(409, "User Not Found");
        }

        const { title, description, location, date } = req.body
        if (!title || !description || !date) {
            throw CreateError(401, "Event Details Are Not Provided");
        }
        if (!location.lat || !location.lng || !location.address) {
            throw CreateError(401, "Location Is Not Given");
        }

        findUser.karma += 10
        await findUser.save()

        const CreatedEvent = await EventModel({ title, description, date, organizer: userId, location: { lat: location.lat, lng: location.lng, address: location.address } })


        await CreatedEvent.save()


        return res.status(201).json({
            message: "Event Created",
            success: true,
            CreatedEvent
        })
    } catch (error) {
        next(error)
    }
}


export const UpdateEvent = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const { eventId } = req.params
        if (!eventId) {
            throw CreateError(400, "Event Id Is Not Found");
        }

        const findEvent = EventModel.findById(eventId)
        if (!findEvent) {
            throw CreateError(409, "Event Is Not Found")
        }

        if (findEvent.organizer.toString() !== userId) {
            throw CreateError(409, "You Can Only Update Your Event")
        }

        const body = req.body
        const updatedEvent = await EventModel.findOneAndUpdate(eventId, body, { new: true })
        return res.status(200).json({
            message: "Event Updated",
            success: true,
            updatedEvent
        })
    } catch (error) {
        console.log("error in updating event ", error)
        next(error)
    }
}

export const DeleteEvent = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const { eventId } = req.params
        if (!eventId) {
            throw CreateError(400, "Event Id Is Not Found");
        }

        const findEvent = EventModel.findById(eventId)
        if (!findEvent) {
            throw CreateError(409, "Event Is Not Found")
        }


        if (findEvent.organizer.toString() !== userId) {
            throw CreateError(409, "You Can Only Delete Your Event")
        }

        await EventModel.findOneAndDelete(eventId)
        return res.status(200).json({
            message: "Event Deleted",
            success: true
        })
    } catch (error) {
        console.log("error in deleting event ", error)
        next(error)
    }
}


export const GetUserEvents = async (req, res, next) => {
    try {
        const { userId } = req.params
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }


        const findEvents = EventModel.find({ organizer: userId })
        return res.status(200).json({
            message: "Events Found",
            success: true,
            findEvents,
            totalEvents: findEvents.length
        })
    } catch (error) {
        console.log("error in getting User Events ", error)
        next(error)
    }
}

export const AttendEvent = async (req, res, next) => {
    try {
        const { userId } = req.user
        if (!userId) {
            throw CreateError(400, "You Are Not Authenticated");
        }
        const { eventId } = req.params
        if (!eventId) {
            throw CreateError(400, "Event Id Is Not Found");
        }

        const findEvent = EventModel.findById(eventId)
        if (!findEvent) {
            throw CreateError(409, "Event Is Not Found")
        }

        if (findEvent.organizer.toString() === userId) {
            throw CreateError(403, "You can't join your own event");
        }

        const alreadyAttending = findEvent.attendees.includes(userId);
        if (alreadyAttending) {
            return res.status(200).json({ message: "Already attending", success: true });
        }

        findEvent.attendees.push(userId)
        findEvent.attendeesCount += 1
        await findEvent.save()

        await UserModel.findByIdAndUpdate(
            userId,
            {
                $addToSet: { eventsAttended: eventId },
                $inc: { karma: 10 }
            },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "You have successfully joined the event",
        });

    } catch (error) {
        console.log("Failed to Join An Event ", error)
        next(error);
    }
}