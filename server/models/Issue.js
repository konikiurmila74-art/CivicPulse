import mongoose from 'mongoose';

const VALID_STATUSES = ['Reported', 'Assigned', 'In Progress', 'Resolved'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const statusHistoryEntry = new mongoose.Schema(
  {
    previousStatus: { type: String, enum: VALID_STATUSES },
    newStatus: { type: String, enum: VALID_STATUSES, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { _id: true }
);

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title must be at most 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [3000, 'Description must be at most 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300],
    },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    imageUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\//i, 'Image URL must start with http(s)://'],
    },
    priority: {
      type: String,
      enum: VALID_PRIORITIES,
      default: 'Medium',
    },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: 'Reported',
    },
    trackingId: {
      type: String,
      unique: true,
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: { type: String, trim: true, maxlength: 2000 },
    resolvedAt: { type: Date, default: null },
    statusHistory: [statusHistoryEntry],
  },
  { timestamps: true }
);

issueSchema.index({ status: 1, priority: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ assignedTo: 1 });

function generateTrackingId() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CP-${y}${m}${d}-${rand}`;
}

issueSchema.pre('validate', function (next) {
  if (!this.trackingId) {
    this.trackingId = generateTrackingId();
  }
  next();
});

issueSchema.methods.addStatusHistory = function (actorId, previousStatus, newStatus, note) {
  this.statusHistory.push({
    previousStatus,
    newStatus,
    changedBy: actorId,
    note: note || undefined,
  });
};

export default mongoose.model('Issue', issueSchema);
export { VALID_STATUSES, VALID_PRIORITIES };
