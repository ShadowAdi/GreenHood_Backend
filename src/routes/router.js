import express from 'express'
import { GetAuthenticatedUser, GetUser, GetUsers, LoginUser, RegisterUser, UpdateUser } from '../controllers/User.controller.js'
import { AuthMiddleware } from '../utils/authMiddleware.js'
import { CreateEvent, DeleteEvent, GetAllEvents, GetEvent, GetUserEvents, UpdateEvent } from '../controllers/Event.controller.js'
import { CreateItem, DeleteItem, GetAllItems, GetClaimedItemsBasedOnUserId, GetItem, GetOwnedItemsBasedOnUserId, UpdateItem } from '../controllers/Item.controller.js'
import { CreateService, DeleteService, GetAllServices, GetService, GetUserServices, UpdateService } from '../controllers/Service.controller.js'


export const router = express.Router()



router.get("/user/users", GetUsers)
router.get("/user/:userId", GetUser)
router.get("/user/me", AuthMiddleware, GetAuthenticatedUser)
router.post("/user/register", RegisterUser)
router.post("/user/login", LoginUser)
router.patch("/user/update", AuthMiddleware, UpdateUser)

router.get("/event/events", GetAllEvents)
router.get("/event/:eventId", GetEvent)
router.get("/event/:userId", GetUserEvents)
router.post("/event/create", AuthMiddleware, CreateEvent)
router.patch("/event/update/:eventId", AuthMiddleware, UpdateEvent)
router.delete("/event/delete/:eventId", AuthMiddleware, DeleteEvent)

router.get("/item/items", GetAllItems)
router.get("/item/:itemId", GetItem)
router.get("/item/claimed/:userId", GetClaimedItemsBasedOnUserId)
router.get("/item/owned/:userId", GetOwnedItemsBasedOnUserId)
router.post("/item/create", AuthMiddleware, CreateItem)
router.post("/item/update/:itemId", AuthMiddleware, UpdateItem)
router.delete("/item/delete/:itemId", AuthMiddleware, DeleteItem)

router.get("/service/services", GetAllServices)
router.get("/service/:serviceId", GetService)
router.get("/service/:userId", GetUserServices)
router.post("/service/create", AuthMiddleware, CreateService)
router.patch("/service/update/:serviceId", AuthMiddleware, UpdateService)
router.delete("/service/delete/:serviceId", AuthMiddleware, DeleteService)