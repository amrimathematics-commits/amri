const generateSlug = require("./slugify");
const { success, error } = require("./apiResponse");

/**
 * Builds a full set of CRUD handlers for a given Mongoose model.
 * @param {mongoose.Model} Model
 * @param {Object} options
 *   searchFields: array of string fields to run text search across
 *   filterFields: array of fields allowed as exact-match query filters
 */
const crudFactory = (Model, options = {}) => {
  const searchFields = options.searchFields || ["title"];
  const filterFields = options.filterFields || ["category", "status", "featured"];

  // Public: list only published items
  const getPublic = async (req, res, next) => {
    try {
      const query = buildQuery(req, { forcePublished: true });
      const result = await paginate(Model, query, req);
      return success(res, 200, "Fetched successfully", result.data, {
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  };

  // Admin: list all items (draft + published)
  const getAll = async (req, res, next) => {
    try {
      const query = buildQuery(req, { forcePublished: false });
      const result = await paginate(Model, query, req);
      return success(res, 200, "Fetched successfully", result.data, {
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  };

  const getOne = async (req, res, next) => {
    try {
      const doc = await Model.findOne({
        $or: [{ _id: safeId(req.params.id) }, { slug: req.params.id }],
      });
      if (!doc) return error(res, 404, "Not found");
      return success(res, 200, "Fetched successfully", doc);
    } catch (err) {
      next(err);
    }
  };

  const create = async (req, res, next) => {
    try {
      const payload = { ...req.body };
      if (!payload.slug && payload.title) {
        payload.slug = generateSlug(payload.title);
      }
      payload.slug = await ensureUniqueSlug(Model, payload.slug);
      const doc = await Model.create(payload);
      return success(res, 201, "Created successfully", doc);
    } catch (err) {
      next(err);
    }
  };

  const update = async (req, res, next) => {
    try {
      const payload = { ...req.body };
      if (payload.title && !payload.slug) {
        payload.slug = generateSlug(payload.title);
      }
      if (payload.slug) {
        payload.slug = await ensureUniqueSlug(Model, payload.slug, req.params.id);
      }
      const doc = await Model.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
      });
      if (!doc) return error(res, 404, "Not found");
      return success(res, 200, "Updated successfully", doc);
    } catch (err) {
      next(err);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return error(res, 404, "Not found");
      return success(res, 200, "Deleted successfully", doc);
    } catch (err) {
      next(err);
    }
  };

  const togglePublish = async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return error(res, 404, "Not found");
      doc.status = doc.status === "published" ? "draft" : "published";
      await doc.save();
      return success(res, 200, `Status changed to ${doc.status}`, doc);
    } catch (err) {
      next(err);
    }
  };

  const toggleFeatured = async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return error(res, 404, "Not found");
      doc.featured = !doc.featured;
      await doc.save();
      return success(res, 200, `Featured set to ${doc.featured}`, doc);
    } catch (err) {
      next(err);
    }
  };

  // ---- helpers ----

  function safeId(id) {
    const mongoose = require("mongoose");
    return mongoose.Types.ObjectId.isValid(id) ? id : null;
  }

  function buildQuery(req, { forcePublished }) {
    const query = {};

    if (forcePublished) {
      query.status = "published";
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    filterFields.forEach((field) => {
      if (field === "status") return; // handled above
      if (req.query[field] !== undefined) {
        if (field === "featured") {
          query.featured = req.query.featured === "true";
        } else {
          query[field] = req.query[field];
        }
      }
    });

    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      query.$or = searchFields.map((f) => ({ [f]: regex }));
    }

    return query;
  }

  async function paginate(Model, query, req) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sort || "-createdAt";

    const [data, total] = await Promise.all([
      Model.find(query).sort(sortField).skip(skip).limit(limit),
      Model.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async function ensureUniqueSlug(Model, baseSlug, excludeId = null) {
    let slug = baseSlug;
    let counter = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await Model.findOne({
        slug,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      });
      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  return {
    getPublic,
    getAll,
    getOne,
    create,
    update,
    remove,
    togglePublish,
    toggleFeatured,
  };
};

module.exports = crudFactory;
