import mongoose from "mongoose";

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

export const UserModel = mongoose.model('User', userSchema);
