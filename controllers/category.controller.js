const db = require('../models');
const Category = db.Category;

const generateSlug = (name) => {
  return String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const validateCategory = async (data) => {
  const errors = [];
  if (!data.Name || String(data.Name).trim() === '') {
    errors.push('Tên danh mục là bắt buộc');
  }
  if (data.ParentID) {
    const parentExists = await Category.findByPk(data.ParentID);
    if (!parentExists) {
      errors.push('Danh mục cha không tồn tại');
    }
  }
  return errors;
};

exports.create = async (req, res) => {
  try {
    // Accept both PascalCase and camelCase from clients
    const data = {
      Name: (req.body.Name || req.body.name || '').trim(),
      Description: req.body.Description || req.body.description || null,
      ParentID: req.body.ParentID || req.body.parentId || null,
      Status: req.body.Status || req.body.status || 'active'
    };

    // Validate
    const errors = await validateCategory(data);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }

    // Generate slug and ensure uniqueness
    let baseSlug = generateSlug(data.Name);
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingCategory = await Category.findOne({ where: { Slug: slug } });
      if (!existingCategory) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const category = await Category.create({
      Name: data.Name,
      Slug: slug,
      Description: data.Description,
      ParentID: data.ParentID,
      Status: data.Status
    });

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo danh mục',
      error: error.message || error.toString(),
      details: error.stack
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Category,
          as: 'children',
          include: ['children'],
        },
      ],
      where: {
        ParentID: null, // Chỉ lấy danh mục gốc
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục',
      error: error.message,
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'children',
        },
        {
          model: Category,
          as: 'parent',
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin danh mục',
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { Name, Description, ParentID, Status } = req.body;
    const categoryId = req.params.id;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
      });
    }

    // Kiểm tra không cho phép chọn chính nó làm danh mục cha
    if (ParentID && ParentID === categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Không thể chọn chính danh mục này làm danh mục cha',
      });
    }

    await category.update({
      Name,
      Description,
      ParentID: ParentID || null,
      Status,
    });

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: category,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật danh mục',
      error: error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục',
      });
    }

    // Kiểm tra xem có danh mục con không
    const hasChildren = await Category.count({
      where: { ParentID: req.params.id },
    });

    if (hasChildren > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa danh mục có danh mục con',
      });
    }

    // Kiểm tra xem có khóa học trong danh mục không
    const hasCourses = await db.Course.count({
      where: { CategoryID: req.params.id },
    });

    if (hasCourses > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa danh mục có khóa học',
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Xóa danh mục thành công',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa danh mục',
      error: error.message,
    });
  }
};
