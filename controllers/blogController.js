
const Blog = require("../models/Blog");

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
const getPublishedBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      20,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const filter = { status: "published" };

    if (req.query.category) {
      filter.category = req.query.category.trim();
    }

    if (req.query.search) {
      const search = req.query.search.trim();

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { excerpt: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }
    }

    const skip = (page - 1) * limit;

    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(filter)
        .select("-content")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Blog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: blogs.length,
      totalBlogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
      blogs,
    });
  } catch (error) {
    console.error("Get published blogs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch blogs",
    });
  }
};

// @desc    Get one published blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getPublishedBlogBySlug = async (req, res) => {
  try {
    const slug = req.params.slug?.trim().toLowerCase();

    const blog = await Blog.findOne({
      slug,
      status: "published",
    }).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Get blog by slug error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch blog",
    });
  }
};

module.exports = {
  getPublishedBlogs,
  getPublishedBlogBySlug,
};
