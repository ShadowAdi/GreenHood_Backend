import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { faker } from '@faker-js/faker'
import { UserModel } from './src/schema/UserSchema.js'
import { ItemModel } from './src/schema/ItemSchema.js'
import { EventModel } from './src/schema/EventSchema.js'
import { ServiceModel } from './src/schema/ServiceSchema.js'
import { logger } from './src/utils/logger.js'
import { connectDB } from './src/db/connect.js'

dotenv.config()
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hackathon', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('DB Connected')).catch(console.error)

const NUM_USERS = 10
const ITEMS_PER_USER = 3
const EVENTS = 5
const SERVICES = 5

const generateLocation = () => ({
    lat: faker.location.latitude(),
    lng: faker.location.longitude(),
    address: faker.location.streetAddress(),
})

const generateUsers = async () => {
    const users = []
    for (let i = 0; i < NUM_USERS; i++) {
        const user = new UserModel({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            location: faker.location.city(),
        })
        await user.save()
        users.push(user)
    }
    return users
}

const generateItems = async (users) => {
    for (const user of users) {
        for (let i = 0; i < ITEMS_PER_USER; i++) {
            const item = new ItemModel({
                title: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                imageUrl: faker.image.url(),
                tags: faker.lorem.words(3).split(' '),
                status: 'available',
                location: generateLocation(),
                owner: user._id,
            })
            await item.save()
            user.itemsDonated.push(item._id)
        }
        await user.save()
    }
}

const generateEvents = async (users) => {
    for (let i = 0; i < EVENTS; i++) {
        const organizer = faker.helpers.arrayElement(users)
        const attendees = faker.helpers.arrayElements(users, faker.number.int({ min: 2, max: users.length }))
        const event = new EventModel({
            title: faker.company.catchPhrase(),
            description: faker.lorem.paragraph(),
            location: generateLocation(),
            date: faker.date.future(),
            organizer: organizer._id,
            attendees: attendees.map((u) => u._id),
            attendeesCount: attendees.length,
        })
        await event.save()
        attendees.forEach((u) => u.eventsAttended.push(event._id))
        await Promise.all(attendees.map((u) => u.save()))
    }
}

const generateServices = async (users) => {
    for (let i = 0; i < SERVICES; i++) {
        const user = faker.helpers.arrayElement(users)
        const service = new ServiceModel({
            title: faker.commerce.product(),
            description: faker.commerce.productDescription(),
            category: faker.commerce.department(),
            contactInfo: faker.phone.number(),
            location: generateLocation(),
            postedBy: user._id,
        })
        await service.save()
        user.servicesPosted.push(service._id)
        await user.save()
    }
}

const main = async () => {
    try {
        connectDB()

        await UserModel.deleteMany({});
        await ItemModel.deleteMany({});
        await EventModel.deleteMany({});
        await ServiceModel.deleteMany({});

        const users = await generateUsers();
        await generateItems(users);
        await generateEvents(users);
        await generateServices(users);

        console.log('✅ Dummy data generated successfully');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.disconnect();
    }
};

main()
