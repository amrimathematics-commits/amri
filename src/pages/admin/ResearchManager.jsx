import { useEffect, useState } from "react";
import { Plus, Upload, X } from "lucide-react";

import DataTable from "../../components/admin/DataTable";
import ContentForm from "../../components/admin/ContentForm";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

import { researchService } from "../../services/contentService";

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
    name: "researchArea",
    label: "Research Area",
    type: "text",
  },
  {
    name: "authors",
    label: "Authors",
    type: "array",
  },
  {
    name: "publicationDate",
    label: "Publication Date",
    type: "date",
  },

  // Image is handled separately through Cloudinary.

  {
    name: "documentUrl",
    label: "Document URL",
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
  {
    key: "updatedAt",
    label: "Updated",
    render: (row) =>
      row.updatedAt
        ? new Date(row.updatedAt).toLocaleDateString()
        : "-",
  },
];

const ResearchManager = () => {
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [saving, setSaving] = useState(false);

  // ============================================================
  // IMAGE STATE
  // ============================================================

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // ============================================================
  // LOAD
  // ============================================================

  const load = async () => {
    setLoading(true);

    try {
      setError("");

      const res = await researchService.getAll({
        limit: 100,
      });

      setItems(res.data || []);
    } catch (err) {
      console.error(
        "Failed to load research:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not load research items."
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

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError("");

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);

    // New image must be uploaded before saving.
    setImageUrl("");
  };

  // ============================================================
  // UPLOAD IMAGE
  // ============================================================

  const handleImageUpload = async () => {
    if (!selectedImage) {
      setError("Please choose an image first.");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const res =
        await researchService.uploadImage(
          selectedImage
        );

      const url = res.data?.url;

      if (!url) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      setImageUrl(url);
      setImagePreview(url);
    } catch (err) {
      console.error(
        "Research image upload failed:",
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
  // CREATE
  // ============================================================

  const handleCreate = () => {
    setEditing(null);

    handleRemoveImage();

    setError("");
    setShowForm(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (row) => {
    setEditing(row);

    setSelectedImage(null);

    // Preserve existing image.
    setImageUrl(row.image || "");
    setImagePreview(row.image || "");

    setError("");
    setShowForm(true);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError("");

    try {
      const finalPayload = {
        ...payload,

        image:
          imageUrl ||
          editing?.image ||
          "",
      };

      if (editing) {
        await researchService.update(
          editing._id,
          finalPayload
        );
      } else {
        await researchService.create(
          finalPayload
        );
      }

      setShowForm(false);
      setEditing(null);

      handleRemoveImage();

      await load();
    } catch (err) {
      console.error(
        "Save research failed:",
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
      await researchService.remove(
        deleting._id
      );

      setDeleting(null);

      await load();
    } catch (err) {
      console.error(
        "Delete research failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Delete failed."
      );
    }
  };

  // ============================================================
  // PUBLISH
  // ============================================================

  const handleTogglePublish = async (row) => {
    try {
      setError("");

      await researchService.togglePublish(
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
  // FEATURED
  // ============================================================

  const handleToggleFeatured = async (row) => {
    try {
      setError("");

      await researchService.toggleFeatured(
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
      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[#101c4d]">
            Research
          </h1>

          <p className="text-sm text-[#101c4d]/60">
            Manage research entries
          </p>
        </div>

        {!showForm && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#101c4d] text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-[#1a2a63]"
          >
            <Plus size={16} />
            Add Research
          </button>
        )}
      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {/* FORM */}

      {showForm ? (
        <div className="bg-white rounded-lg border border-[#101c4d]/10 p-6 mb-6">
          <h2 className="font-serif text-lg text-[#101c4d] mb-5">
            {editing
              ? "Edit Research"
              : "New Research"}
          </h2>

          {/* IMAGE UPLOAD */}

          <div className="mb-6 border border-[#101c4d]/10 rounded-md p-5">
            <label className="block text-sm font-medium text-[#101c4d] mb-3">
              Research Image
            </label>

            <div className="flex flex-col sm:flex-row gap-4">
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

            {imagePreview && (
              <div className="mt-5">
                <p className="text-xs text-[#101c4d]/60 mb-2">
                  Preview
                </p>

                <img
                  src={imagePreview}
                  alt="Research preview"
                  className="w-full max-w-md h-48 object-cover rounded-md border border-[#101c4d]/10"
                />
              </div>
            )}

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

          {/* FORM FIELDS */}

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
        <p className="font-mono text-sm text-[#101c4d]/60">
          Loading…
        </p>
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          onEdit={handleEdit}
          onDelete={setDeleting}
          onTogglePublish={handleTogglePublish}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      {/* DELETE */}

      <ConfirmDialog
        open={!!deleting}
        title="Delete research entry?"
        message={`"${deleting?.title}" will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default ResearchManager;