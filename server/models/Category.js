import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name must be at most 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300],
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
