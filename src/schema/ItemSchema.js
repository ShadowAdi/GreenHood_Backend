import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  tags: [String],
  status: { type: String, default: 'available' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
}, { timestamps: true });

export const ItemModel = mongoose.model('Item', itemSchema);
