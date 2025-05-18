import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  contactInfo: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const ServiceModel = mongoose.model('Service', serviceSchema);
