import mongoose from 'mongoose';
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  location: { type: String, required: true, trim: true, maxlength: 160 },
  wages: { type: String, required: true, trim: true, maxlength: 80 },
  duration: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  hirer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  hirerName: { type: String, required: true },
  hirerEmail: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open', index: true }
}, { timestamps: true });
jobSchema.index({ title: 'text', description: 'text', location: 'text' });
export default mongoose.model('Job', jobSchema);
