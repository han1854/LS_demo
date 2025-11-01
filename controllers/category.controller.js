const db = require('../models');
const Category = db.Category;

exports.create = async (req, res) => {
  try {

    const { Name, Description, ParentID } = req.body;

    const category = await Category.create({
      Name,
      Slug: null, // Để hook tự động sinh Slug
      Description,
      ParentID: ParentID || null,
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
      error: error.message,
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
