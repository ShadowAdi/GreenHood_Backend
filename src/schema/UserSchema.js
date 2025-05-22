import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    karma: { type: Number, default: 0 },
    location: { type: String, required: true },
    eventsAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    itemsClaimed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    itemsDonated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    servicesPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
}, { timestamps: true });

// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next()
//     const salt = await bcrypt.genSalt(10)
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
// })

export const UserModel = mongoose.model('User', userSchema);


