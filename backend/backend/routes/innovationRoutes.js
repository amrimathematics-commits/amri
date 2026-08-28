const express = require("express");
const Innovation = require("../models/Innovation");
const crudFactory = require("../utils/crudFactory");
const { protect } = require("../middleware/auth");

const router = express.Router();
const handlers = crudFactory(Innovation, {
  searchFields: ["title", "shortDescription", "category"],
  filterFields: ["category", "status", "featured", "department"],
});

router.get("/", handlers.getPublic);

router.get("/admin/all", protect, handlers.getAll);

router.get("/:id", handlers.getOne);

router.post("/", protect, handlers.create);
router.put("/:id", protect, handlers.update);
router.delete("/:id", protect, handlers.remove);
router.patch("/:id/publish", protect, handlers.togglePublish);
router.patch("/:id/feature", protect, handlers.toggleFeatured);

module.exports = router;
