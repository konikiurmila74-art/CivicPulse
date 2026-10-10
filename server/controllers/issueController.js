import Issue, { VALID_STATUSES } from '../models/Issue.js';
import User from '../models/User.js';
import { isValidObjectId } from '../middleware/errorMiddleware.js';

const VALID_TRANSITIONS = {
  Reported: ['Assigned', 'In Progress', 'Resolved'],
  Assigned: ['In Progress', 'Resolved', 'Reported'],
  'In Progress': ['Resolved', 'Assigned', 'Reported'],
  Resolved: ['In Progress', 'Reported'],
};

function canView(issue, user) {
  if (user.role === 'admin') return true;
  if (issue.reportedBy?.toString() === user._id.toString()) return true;
  if (user.role === 'staff' && issue.assignedTo?.toString() === user._id.toString()) return true;
  return false;
}

const citizenEditable = ['title', 'description', 'category', 'address', 'latitude', 'longitude', 'imageUrl', 'priority'];
const adminStaffEditable = [...citizenEditable, 'priority', 'assignedTo'];

export async function createIssue(req, res, next) {
  try {
    const { title, description, category, address, latitude, longitude, imageUrl, priority } = req.body;
    if (!title || !description || !category || !address) {
      return res.status(400).json({ message: 'title, description, category, and address are required' });
    }
    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      address: address.trim(),
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      imageUrl: imageUrl || undefined,
      priority: priority || 'Medium',
      reportedBy: req.user._id,
      statusHistory: [
        {
          newStatus: 'Reported',
          changedBy: req.user._id,
          note: 'Issue created',
        },
      ],
    });
    await issue.populate('reportedBy', 'name email role');
    res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
}

export async function getIssues(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const status = req.query.status;
    const priority = req.query.priority;
    const category = req.query.category;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const filter = {};

    if (req.user.role === 'citizen') {
      filter.reportedBy = req.user._id;
    } else if (req.user.role === 'staff') {
      filter.$or = [{ assignedTo: req.user._id }, { reportedBy: req.user._id }];
    }

    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { trackingId: { $regex: search, $options: 'i' } },
        ],
      });
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = { $regex: category, $options: 'i' };

    const sort = {};
    sort[sortBy] = order;

    const [items, total] = await Promise.all([
      Issue.find(filter)
        .populate('reportedBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Issue.countDocuments(filter),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function getIssueById(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid issue id' });
    }
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.changedBy', 'name role');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (!canView(issue, req.user)) {
      return res.status(403).json({ message: 'You do not have access to this issue' });
    }
    res.json(issue);
  } catch (err) {
    next(err);
  }
}

export async function getIssueByTrackingId(req, res, next) {
  try {
    const issue = await Issue.findOne({ trackingId: req.params.trackingId })
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.changedBy', 'name role');
    if (!issue) return res.status(404).json({ message: 'Issue not found with that tracking id' });
    res.json(issue);
  } catch (err) {
    next(err);
  }
}

export async function updateIssue(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid issue id' });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const isOwner = issue.reportedBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to edit this issue' });
    }

    const allowed = req.user.role === 'citizen' ? citizenEditable : adminStaffEditable;

    Object.keys(req.body).forEach((key) => {
      if (!allowed.includes(key)) return;
      if (key === 'assignedTo') {
        if (req.body.assignedTo && isValidObjectId(req.body.assignedTo)) {
          issue.assignedTo = req.body.assignedTo;
        } else if (!req.body.assignedTo) {
          issue.assignedTo = null;
        }
      } else {
        issue[key] = req.body[key];
      }
    });

    const updated = await issue.save();
    await updated.populate('reportedBy', 'name email role');
    await updated.populate('assignedTo', 'name email role');
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid issue id' });
    }
    const { status, note } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const isOwner = issue.reportedBy?.toString() === req.user._id.toString();
    const isAssigned = issue.assignedTo?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isStaff = req.user.role === 'staff';

    if (!isAdmin && !isStaff && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this issue status' });
    }

    const allowed = VALID_TRANSITIONS[issue.status] || [];
    if (status !== issue.status && !allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from "${issue.status}" to "${status}". Allowed: ${allowed.join(', ') || 'none'}`,
      });
    }

    const previous = issue.status;
    issue.status = status;
    issue.addStatusHistory(req.user._id, previous, status, note);

    if (status === 'Resolved') {
      issue.resolvedAt = new Date();
      if (note) issue.resolutionNotes = note;
    } else {
      issue.resolvedAt = null;
    }

    const saved = await issue.save();
    await saved.populate('statusHistory.changedBy', 'name role');
    await saved.populate('assignedTo', 'name email role');
    res.json(saved);
  } catch (err) {
    next(err);
  }
}

export async function deleteIssue(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid issue id' });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const isOwner = issue.reportedBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    await issue.deleteOne();
    res.json({ message: 'Issue deleted', trackingId: issue.trackingId });
  } catch (err) {
    next(err);
  }
}
