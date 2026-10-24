import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  mobile: { type: String, trim: true, default: '' },
  age: { type: Number, min: 18, max: 100 },
  role: { type: String, enum: ['worker', 'hirer'], required: true },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
}, { timestamps: true });
userSchema.set('toJSON', { transform: (_doc, ret) => { delete ret.passwordHash; delete ret.resetPasswordToken; delete ret.resetPasswordExpires; delete ret.__v; return ret; } });
export default mongoose.model('User', userSchema);