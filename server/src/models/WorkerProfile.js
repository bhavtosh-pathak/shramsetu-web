import mongoose from 'mongoose';
const workerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, trim: true, maxlength: 1500, default: '' },
  skills: [{ type: String, trim: true }],
  experience: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  availability: { type: String, trim: true, default: 'Available' }
}, { timestamps: true });
export default mongoose.model('WorkerProfile', workerProfileSchema);
