import mongoose from 'mongoose';
const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  coverNote: { type: String, trim: true, maxlength: 1000, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });
applicationSchema.index({ job: 1, worker: 1 }, { unique: true });
export default mongoose.model('JobApplication', applicationSchema);
