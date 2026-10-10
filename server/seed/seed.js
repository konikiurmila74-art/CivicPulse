import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Issue from '../models/Issue.js';
import Category from '../models/Category.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Set MONGODB_URI in server/.env before seeding.');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected — seeding…');

  await User.deleteMany({});
  await Issue.deleteMany({});
  await Category.deleteMany({});

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@civicpulse.test',
    password: 'password123',
    role: 'admin',
  });

  const staff = await User.create({
    name: 'Staff Worker',
    email: 'staff@civicpulse.test',
    password: 'password123',
    role: 'staff',
  });

  const citizen = await User.create({
    name: 'Jane Citizen',
    email: 'jane@civicpulse.test',
    password: 'password123',
    role: 'citizen',
  });

  const cats = await Category.insertMany([
    { name: 'Potholes', description: 'Road surface damage', active: true },
    { name: 'Garbage', description: 'Waste collection issues', active: true },
    { name: 'Streetlights', description: 'Lighting failures', active: true },
    { name: 'Water', description: 'Water leakage and supply', active: true },
    { name: 'Drainage', description: 'Drainage and flooding', active: true },
    { name: 'Footpaths', description: 'Damaged walkways', active: true },
  ]);

  const issues = [
    {
      title: 'Large pothole on Main Street',
      description: 'A deep pothole near the intersection of Main and 5th is damaging vehicles.',
      category: 'Potholes',
      address: 'Main St & 5th Ave',
      priority: 'High',
      status: 'Reported',
      reportedBy: citizen._id,
    },
    {
      title: 'Overflowing garbage bin at Riverside Park',
      description: 'The bin near the park entrance has not been emptied in over a week.',
      category: 'Garbage',
      address: 'Riverside Park Entrance',
      priority: 'Medium',
      status: 'In Progress',
      reportedBy: citizen._id,
      assignedTo: staff._id,
    },
    {
      title: 'Streetlight out on Oak Road',
      description: 'The streetlight pole #12 on Oak Road has been dark for three nights.',
      category: 'Streetlights',
      address: 'Oak Road, Pole 12',
      priority: 'Medium',
      status: 'Assigned',
      reportedBy: citizen._id,
      assignedTo: staff._id,
    },
    {
      title: 'Water leakage near City Library',
      description: 'Steady water flow from a cracked pipe near the library sidewalk.',
      category: 'Water',
      address: 'Library Avenue 22',
      priority: 'Critical',
      status: 'Resolved',
      reportedBy: citizen._id,
      assignedTo: staff._id,
      resolvedAt: new Date(Date.now() - 86400000 * 2),
      resolutionNotes: 'Pipe joint replaced and tested.',
    },
    {
      title: 'Damaged footpath on Elm Street',
      description: 'Sections of the footpath are broken and pose a tripping hazard.',
      category: 'Footpaths',
      address: 'Elm Street 45',
      priority: 'Low',
      status: 'Reported',
      reportedBy: citizen._id,
    },
  ];

  for (const d of issues) {
    const issue = await Issue.create(d);
    const hist = [{ newStatus: 'Reported', changedBy: citizen._id, note: 'Issue created' }];
    if (d.status === 'Assigned' || d.status === 'In Progress' || d.status === 'Resolved') {
      hist.push({ previousStatus: 'Reported', newStatus: 'Assigned', changedBy: admin._id, note: 'Assigned to staff' });
    }
    if (d.status === 'In Progress' || d.status === 'Resolved') {
      hist.push({ previousStatus: 'Assigned', newStatus: 'In Progress', changedBy: staff._id });
    }
    if (d.status === 'Resolved') {
      hist.push({ previousStatus: 'In Progress', newStatus: 'Resolved', changedBy: staff._id, note: d.resolutionNotes });
    }
    issue.statusHistory = hist;
    await issue.save();
  }

  console.log('\nSeeded successfully!');
  console.log('Users:');
  console.log('  admin  admin@civicpulse.test  / password123');
  console.log('  staff  staff@civicpulse.test  / password123');
  console.log('  citizen jane@civicpulse.test  / password123');
  console.log(`Categories: ${cats.length}`);
  console.log(`Issues: ${issues.length}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
