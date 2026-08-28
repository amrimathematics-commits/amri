import { useEffect, useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import ContentForm from "../../components/admin/ContentForm";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { innovationService } from "../../services/contentService";

const fields = [
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
    wide: true,
  },
  {
    name: "shortDescription",
    label: "Short Description",
    type: "textarea",
    wide: true,
  },
  {
    name: "description",
    label: "Full Description",
    type: "textarea",
    wide: true,
  },
  {
    name: "category",
    label: "Category",
    type: "text",
  },
  {
    name: "department",
    label: "Department",
    type: "text",
  },
  {
    name: "technology",
    label: "Technologies",
    type: "array",
  },
  {
    name: "innovators",
    label: "Innovators",
    type: "array",
  },
  {
    name: "problemStatement",
    label: "Problem Statement",
    type: "textarea",
    wide: true,
  },
  {
    name: "solution",
    label: "Solution",
    type: "textarea",
    wide: true,
  },
  {
    name: "impact",
    label: "Impact",
    type: "textarea",
    wide: true,
  },

  // Image is handled separately through Cloudinary.
  // Do NOT add image as a normal ContentForm field.

  {
    name: "gallery",
    label: "Gallery URLs",
    type: "array",
  },
  {
    name: "videoUrl",
    label: "Video URL",
    type: "url",
  },
  {
    name: "externalUrl",
    label: "External URL",
    type: "url",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["draft", "published"],
  },
  {
    name: "featured",
    label: "Featured",
    type: "checkbox",
  },
];

const columns = [
  {
    key: "title",
    label: "Title",
  },
  {
    key: "category",
    label: "Category",
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded ${
          row.status === "published"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

const InnovationsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [saving, setSaving] = useState(false);

  // ============================================================
  // CLOUDINARY IMAGE STATES
  // ============================================================

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // ============================================================
  // LOAD INNOVATIONS
  // ============================================================

  const load = async () => {
    setLoading(true);

    try {
      setError("");

      const res = await innovationService.getAll({
        limit: 100,
      });

      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to load innovations:", err);

      setError(
        err.response?.data?.message ||
          "Could not load innovations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ============================================================
  // SELECT IMAGE
  // ============================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError("");

    setSelectedImage(file);

    // Create local preview
    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);

    // New file means it has not been uploaded yet.
    setImageUrl("");
  };

  // ============================================================
  // UPLOAD IMAGE TO CLOUDINARY
  // ============================================================

  const handleImageUpload = async () => {
    if (!selectedImage) {
      setError("Please choose an image first.");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const res = await innovationService.uploadImage(
        selectedImage
      );

      const url = res.data?.url;

      if (!url) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      // Save Cloudinary URL
      setImageUrl(url);

      // Show Cloudinary image as preview
      setImagePreview(url);
    } catch (err) {
      console.error(
        "Innovation image upload failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Image upload failed."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // ============================================================
  // REMOVE IMAGE
  // ============================================================

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setImageUrl("");
  };

  // ============================================================
  // ADD NEW INNOVATION
  // ============================================================

  const handleAddInnovation = () => {
    setEditing(null);

    setSelectedImage(null);
    setImagePreview("");
    setImageUrl("");

    setError("");
    setShowForm(true);
  };

  // ============================================================
  // EDIT INNOVATION
  // ============================================================

  const handleEditInnovation = (row) => {
    setEditing(row);

    setSelectedImage(null);

    // Preserve existing Cloudinary image.
    setImageUrl(row.image || "");
    setImagePreview(row.image || "");

    setError("");
    setShowForm(true);
  };

  // ============================================================
  // SAVE INNOVATION
  // ============================================================

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError("");

    try {
      /*
       * IMPORTANT:
       * Preserve the existing image when editing if
       * the user did not select a new image.
       *
       * If a new image was uploaded, imageUrl contains
       * the new Cloudinary URL.
       */

      const finalPayload = {
        ...payload,
        image:
          imageUrl ||
          editing?.image ||
          "",
      };

      if (editing) {
        await innovationService.update(
          editing._id,
          finalPayload
        );
      } else {
        await innovationService.create(
          finalPayload
        );
      }

      // Close form
      setShowForm(false);
      setEditing(null);

      // Clear image state
      handleRemoveImage();

      // Reload table
      await load();
    } catch (err) {
      console.error(
        "Save innovation failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await innovationService.remove(
        deleting._id
      );

      setDeleting(null);

      await load();
    } catch (err) {
      console.error(
        "Delete innovation failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Delete failed."
      );
    }
  };

  // ============================================================
  // TOGGLE PUBLISH
  // ============================================================

  const handleTogglePublish = async (row) => {
    try {
      setError("");

      await innovationService.togglePublish(
        row._id
      );

      await load();
    } catch (err) {
      console.error(
        "Publish toggle failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not change publish status."
      );
    }
  };

  // ============================================================
  // TOGGLE FEATURED
  // ============================================================

  const handleToggleFeatured = async (row) => {
    try {
      setError("");

      await innovationService.toggleFeatured(
        row._id
      );

      await load();
    } catch (err) {
      console.error(
        "Featured toggle failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not change featured status."
      );
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[#101c4d]">
            Innovations
          </h1>

          <p className="text-sm text-[#101c4d]/60">
            Manage innovations
          </p>
        </div>

        {!showForm && (
          <button
            onClick={handleAddInnovation}
            className="flex items-center gap-2 bg-[#101c4d] text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-[#1a2a63]"
          >
            <Plus size={16} />
            Add Innovation
          </button>
        )}
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {/* ======================================================
          FORM
      ====================================================== */}

      {showForm ? (
        <div className="bg-white rounded-lg border border-[#101c4d]/10 p-6 mb-6">
          <h2 className="font-serif text-lg text-[#101c4d] mb-5">
            {editing
              ? "Edit Innovation"
              : "New Innovation"}
          </h2>

          {/* ==================================================
              CLOUDINARY IMAGE UPLOAD
          ================================================== */}

          <div className="mb-6 border border-[#101c4d]/10 rounded-md p-5">
            <label className="block text-sm font-medium text-[#101c4d] mb-3">
              Innovation Image
            </label>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* CHOOSE IMAGE */}

              <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-[#101c4d] text-white text-sm px-4 py-2.5 rounded-md hover:bg-[#1a2a63]">
                <Upload size={16} />

                {selectedImage
                  ? "Change Image"
                  : "Choose Image"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* UPLOAD */}

              {selectedImage && !imageUrl && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className="inline-flex items-center justify-center gap-2 bg-[#c9a227] text-white text-sm px-4 py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  <Upload size={16} />

                  {uploadingImage
                    ? "Uploading..."
                    : "Upload to Cloudinary"}
                </button>
              )}

              {/* REMOVE */}

              {(selectedImage ||
                imagePreview) && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-md hover:bg-red-50"
                >
                  <X size={16} />
                  Remove
                </button>
              )}
            </div>

            {/* IMAGE PREVIEW */}

            {imagePreview && (
              <div className="mt-5">
                <p className="text-xs text-[#101c4d]/60 mb-2">
                  Preview
                </p>

                <img
                  src={imagePreview}
                  alt="Innovation preview"
                  className="w-full max-w-md h-48 object-cover rounded-md border border-[#101c4d]/10"
                />
              </div>
            )}

            {/* CLOUDINARY URL */}

            {imageUrl && (
              <div className="mt-3">
                <p className="text-xs text-green-600">
                  ✓ Image uploaded to Cloudinary
                </p>

                <p className="text-xs text-[#101c4d]/50 mt-1 break-all">
                  {imageUrl}
                </p>
              </div>
            )}
          </div>

          {/* ==================================================
              ALL OTHER INNOVATION FIELDS
          ================================================== */}

          <ContentForm
            fields={fields}
            initialValues={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
              handleRemoveImage();
            }}
            submitting={saving}
          />
        </div>
      ) : loading ? (
        /* ====================================================
           LOADING
        ==================================================== */

        <p className="font-mono text-sm text-[#101c4d]/60">
          Loading…
        </p>
      ) : (
        /* ====================================================
           TABLE
        ==================================================== */

        <DataTable
          columns={columns}
          rows={items}
          onEdit={handleEditInnovation}
          onDelete={setDeleting}
          onTogglePublish={handleTogglePublish}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <ConfirmDialog
        open={!!deleting}
        title="Delete innovation?"
        message={`"${deleting?.title}" will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default InnovationsManager;