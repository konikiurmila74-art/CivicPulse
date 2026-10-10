import Issue from '../models/Issue.js';

export async function getStats(req, res, next) {
  try {
    const baseFilter = {};
    if (req.user.role === 'citizen') {
      baseFilter.reportedBy = req.user._id;
    } else if (req.user.role === 'staff') {
      baseFilter.$or = [{ assignedTo: req.user._id }, { reportedBy: req.user._id }];
    }

    const [
      total,
      reported,
      assigned,
      inProgress,
      resolved,
      highPriority,
      byCategoryAgg,
      byStatusAgg,
      resolutionTimes,
      recent,
    ] = await Promise.all([
      Issue.countDocuments(baseFilter),
      Issue.countDocuments({ ...baseFilter, status: 'Reported' }),
      Issue.countDocuments({ ...baseFilter, status: 'Assigned' }),
      Issue.countDocuments({ ...baseFilter, status: 'In Progress' }),
      Issue.countDocuments({ ...baseFilter, status: 'Resolved' }),
      Issue.countDocuments({ ...baseFilter, priority: { $in: ['High', 'Critical'] } }),
      Issue.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Issue.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: { ...baseFilter, status: 'Resolved', resolvedAt: { $ne: null } } },
        {
          $project: {
            durationMs: { $subtract: ['$resolvedAt', '$createdAt'] },
          },
        },
        {
          $group: {
            _id: null,
            avgMs: { $avg: '$durationMs' },
            count: { $sum: 1 },
          },
        },
      ]),
      Issue.find(baseFilter)
        .populate('reportedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 1000) / 10 : 0;
    const avgMs = resolutionTimes[0]?.avgMs || 0;
    const avgResolutionHours = avgMs > 0 ? Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10 : 0;

    res.json({
      counts: {
        total,
        reported,
        assigned,
        inProgress,
        resolved,
        highPriority,
      },
      resolutionRate,
      avgResolutionHours,
      byCategory: byCategoryAgg.map((c) => ({ category: c._id, count: c.count })),
      byStatus: byStatusAgg.map((s) => ({ status: s._id, count: s.count })),
      recent,
    });
  } catch (err) {
    next(err);
  }
}
