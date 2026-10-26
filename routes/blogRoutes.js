
const express = require("express");
const router = express.Router();

const {
  getPublishedBlogs,
  getPublishedBlogBySlug,
} = require("../controllers/blogController");

const {
  createBlog,
  getAdminBlogs,
  getAdminBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogAdminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/blogUploadMiddleware");

// Public routes
router.get("/", getPublishedBlogs);

// Admin routes — keep these before /:slug
router.get("/admin", protect, adminOnly, getAdminBlogs);
router.get("/admin/:id", protect, adminOnly, getAdminBlogById);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("coverImage"),
  createBlog
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("coverImage"),
  updateBlog
);

router.delete("/:id", protect, adminOnly, deleteBlog);

// Public single-blog route
router.get("/:slug", getPublishedBlogBySlug);

module.exports = router;
