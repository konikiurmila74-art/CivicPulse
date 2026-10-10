import Category from '../models/Category.js';
import { isValidObjectId } from '../middleware/errorMiddleware.js';

export async function getCategories(req, res, next) {
  try {
    const onlyActive = req.query.includeInactive !== 'true';
    const filter = onlyActive ? { active: true } : {};
    const cats = await Category.find(filter).sort({ name: 1 });
    res.json(cats);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const cat = await Category.create({ name: name.trim(), description: description?.trim() || '' });
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const { name, description, active } = req.body;
    if (name !== undefined) cat.name = name.trim();
    if (description !== undefined) cat.description = description.trim();
    if (active !== undefined) cat.active = Boolean(active);
    const saved = await cat.save();
    res.json(saved);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    cat.active = false;
    await cat.save();
    res.json({ message: 'Category deactivated', _id: cat._id });
  } catch (err) {
    next(err);
  }
}
