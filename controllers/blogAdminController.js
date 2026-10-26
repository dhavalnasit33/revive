
const mongoose = require("mongoose");
const Blog = require("../models/Blog");

// Create a new blog post
const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      tags,
      status,
      readTime,
      metaTitle,
      metaDescription,
      images,
    } = req.body;

    const normalizedSlug = slug?.trim().toLowerCase();

    if (!title?.trim() || !normalizedSlug || !excerpt?.trim() ||
        !content?.trim() || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title, slug, excerpt, content, and category are required",
      });
    }

    const existingBlog = await Blog.findOne({ slug: normalizedSlug });

    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: "A blog with this slug already exists",
      });
    }

    const validStatus = status || "draft";

    if (!["draft", "published"].includes(validStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be draft or published",
      });
    }

    const coverImage = req.file
      ? `/uploads/blogs/${req.file.filename}`
      : "";

    const blog = await Blog.create({
      title: title.trim(),
      slug: normalizedSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage,
      images: Array.isArray(images) ? images : [],
      category: category.trim(),
      author: author?.trim() || "LUMORIA",
      tags: Array.isArray(tags) ? tags : [],
      status: validStatus,
      publishedAt: validStatus === "published" ? new Date() : null,
      readTime: Math.max(1, Number(readTime) || 1),
      metaTitle: metaTitle?.trim() || "",
      metaDescription: metaDescription?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Create blog error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A blog with this slug already exists",
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create blog",
    });
  }
};

// Get all blogs for admin, including drafts
const getAdminBlogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const filter = {};

    if (["draft", "published"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
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
    console.error("Get admin blogs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch blogs",
    });
  }
};

// Get one blog for admin by MongoDB ID
const getAdminBlogById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID",
      });
    }

    const blog = await Blog.findById(req.params.id);

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
    console.error("Get admin blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch blog",
    });
  }
};

// Update a blog
const updateBlog = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID",
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const fields = [
      "title",
      "slug",
      "excerpt",
      "content",
      "category",
      "author",
      "readTime",
      "metaTitle",
      "metaDescription",
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        blog[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (req.body.slug !== undefined) {
      blog.slug = req.body.slug.trim().toLowerCase();

      const duplicate = await Blog.findOne({
        slug: blog.slug,
        _id: { $ne: blog._id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A blog with this slug already exists",
        });
      }
    }

    if (req.body.tags !== undefined) {
      if (!Array.isArray(req.body.tags)) {
        return res.status(400).json({
          success: false,
          message: "Tags must be an array",
        });
      }

      blog.tags = req.body.tags;
    }

    if (req.body.images !== undefined) {
      if (!Array.isArray(req.body.images)) {
        return res.status(400).json({
          success: false,
          message: "Images must be an array",
        });
      }

      blog.images = req.body.images;
    }

    if (req.body.status !== undefined) {
      if (!["draft", "published"].includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be draft or published",
        });
      }

      if (req.body.status === "published" && blog.status !== "published") {
        blog.publishedAt = new Date();
      }

      if (req.body.status === "draft") {
        blog.publishedAt = null;
      }

      blog.status = req.body.status;
    }

    if (req.file) {
      blog.coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Update blog error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A blog with this slug already exists",
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update blog",
    });
  }
};

// Delete a blog
const deleteBlog = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID",
      });
    }

    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete blog",
    });
  }
};

module.exports = {
  createBlog,
  getAdminBlogs,
  getAdminBlogById,
  updateBlog,
  deleteBlog,
};
