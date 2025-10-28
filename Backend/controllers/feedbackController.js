import Feedback from "../models/Feedback.js";

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
export const submitFeedback = async (req, res) => {
  try {
    const { subject, message, category } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long",
      });
    }

    const metadata = {
      userAgent: req.headers["user-agent"] || "",
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const feedback = await Feedback.create({
      user: req.user.id,
      subject,
      message,
      category: category || "other",
      metadata,
    });

    await feedback.populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

// @desc    Get user's feedback history
// @route   GET /api/feedback/my
// @access  Private
export const getUserFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("response.respondedBy", "name");

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    console.error("Get user feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback history",
      error: error.message,
    });
  }
};

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:id
// @access  Private
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate("user", "name email")
      .populate("response.respondedBy", "name");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    if (
      feedback.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this feedback",
      });
    }

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Get feedback by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    if (feedback.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this feedback",
      });
    }

    if (feedback.response && feedback.response.message) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete feedback that has been responded to",
      });
    }

    await feedback.deleteOne();

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
      error: error.message,
    });
  }
};

// ============= ADMIN ONLY ROUTES =============

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback/admin/all
// @access  Private/Admin
export const getAllFeedback = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "desc" ? -1 : 1;

    const feedbacks = await Feedback.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "name email")
      .populate("response.respondedBy", "name");

    const total = await Feedback.countDocuments(filter);

    res.json({
      success: true,
      count: feedbacks.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      feedbacks,
    });
  } catch (error) {
    console.error("Get all feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

// @desc    Update feedback status (Admin)
// @route   PUT /api/feedback/admin/:id/status
// @access  Private/Admin
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status, priority } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    if (status) feedback.status = status;
    if (priority) feedback.priority = priority;

    await feedback.save();
    await feedback.populate("user", "name email");

    res.json({
      success: true,
      message: "Feedback status updated successfully",
      feedback,
    });
  } catch (error) {
    console.error("Update feedback status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update feedback status",
      error: error.message,
    });
  }
};

// @desc    Respond to feedback (Admin)
// @route   POST /api/feedback/admin/:id/respond
// @access  Private/Admin
export const respondToFeedback = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Response message must be at least 10 characters",
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    feedback.response = {
      message: message.trim(),
      respondedBy: req.user.id,
      respondedAt: new Date(),
    };

    feedback.status = "resolved";

    await feedback.save();
    await feedback.populate([
      { path: "user", select: "name email" },
      { path: "response.respondedBy", select: "name" },
    ]);

    res.json({
      success: true,
      message: "Response sent successfully",
      feedback,
    });
  } catch (error) {
    console.error("Respond to feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to feedback",
      error: error.message,
    });
  }
};

// @desc    Get feedback statistics (Admin)
// @route   GET /api/feedback/admin/stats
// @access  Private/Admin
export const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
              },
            },
          ],
          byPriority: [
            {
              $group: {
                _id: "$priority",
                count: { $sum: 1 },
              },
            },
          ],
          total: [
            {
              $count: "count",
            },
          ],
          avgResponseTime: [
            {
              $match: {
                "response.respondedAt": { $exists: true },
              },
            },
            {
              $project: {
                responseTime: {
                  $subtract: ["$response.respondedAt", "$createdAt"],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgTime: { $avg: "$responseTime" },
              },
            },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0],
    });
  } catch (error) {
    console.error("Get feedback stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback statistics",
      error: error.message,
    });
  }
};