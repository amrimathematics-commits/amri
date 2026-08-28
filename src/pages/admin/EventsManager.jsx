import { useEffect, useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import ContentForm from "../../components/admin/ContentForm";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { eventService } from "../../services/contentService";

const fields = [
  { name: "title", label: "Title", type: "text", required: true, wide: true },
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
    name: "eventDate",
    label: "Event Date",
    type: "date",
    required: true,
  },
  {
    name: "startTime",
    label: "Start Time",
    type: "text",
    placeholder: "10:00 AM",
  },
  {
    name: "endTime",
    label: "End Time",
    type: "text",
    placeholder: "1:00 PM",
  },
  { name: "location", label: "Location", type: "text" },
  { name: "organizer", label: "Organizer", type: "text" },
  { name: "category", label: "Category", type: "text" },
  { name: "speaker", label: "Speaker", type: "text" },
  { name: "registrationLink", label: "Registration Link", type: "url" },

  // Image is handled separately through Cloudinary.
  // Do NOT keep the old Image URL field here.

  { name: "gallery", label: "Gallery URLs", type: "array" },
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
  { key: "title", label: "Title" },
  {
    key: "eventDate",
    label: "Date",
    render: (row) =>
      row.eventDate
        ? new Date(row.eventDate).toLocaleDateString()
        : "-",
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

const EventsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [saving, setSaving] = useState(false);

  // Cloudinary states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const res = await eventService.getAll({ limit: 100 });
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /*
   * Select image from computer.
   */
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Basic validation
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

    // Local preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  /*
   * Upload selected image to Cloudinary.
   */
  const handleImageUpload = async () => {
    if (!selectedImage) {
      setError("Please choose an image first.");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const res = await eventService.uploadImage(selectedImage);

      const url = res.data?.url;

      if (!url) {
        throw new Error("Cloudinary did not return an image URL.");
      }

      setImageUrl(url);

      // Use Cloudinary URL as preview
      setImagePreview(url);
    } catch (err) {
      console.error("Image upload failed:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Image upload failed."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  /*
   * Remove selected/uploaded image.
   */
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setImageUrl("");
  };

  /*
   * Save event.
   */
  const handleSubmit = async (payload) => {
    setSaving(true);
    setError("");

    try {
      /*
       * Add Cloudinary URL to event payload.
       *
       * If editing an event and no new image was selected,
       * preserve its existing image.
       */
      const finalPayload = {
        ...payload,
        image:
          imageUrl ||
          editing?.image ||
          "",
      };

      if (editing) {
        await eventService.update(
          editing._id,
          finalPayload
        );
      } else {
        await eventService.create(finalPayload);
      }

      setShowForm(false);
      setEditing(null);

      handleRemoveImage();

      await load();
    } catch (err) {
      console.error("Save event failed:", err);

      setError(
        err.response?.data?.message ||
          "Save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Open a new event form.
   */
  const handleAddEvent = () => {
    setEditing(null);

    setSelectedImage(null);
    setImagePreview("");
    setImageUrl("");

    setError("");
    setShowForm(true);
  };

  /*
   * Open an existing event.
   */
  const handleEditEvent = (row) => {
    setEditing(row);

    setSelectedImage(null);

    // Existing Cloudinary image
    setImageUrl(row.image || "");
    setImagePreview(row.image || "");

    setError("");
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await eventService.remove(deleting._id);

      setDeleting(null);

      await load();
    } catch (err) {
      console.error(err);
      setError("Delete failed.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[#101c4d]">
            Events
          </h1>

          <p className="text-sm text-[#101c4d]/60">
            Manage events
          </p>
        </div>

        {!showForm && (
          <button
            onClick={handleAddEvent}
            className="flex items-center gap-2 bg-[#101c4d] text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-[#1a2a63]"
          >
            <Plus size={16} />
            Add Event
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-lg border border-[#101c4d]/10 p-6 mb-6">
          <h2 className="font-serif text-lg text-[#101c4d] mb-5">
            {editing ? "Edit Event" : "New Event"}
          </h2>

          {/* CLOUDINARY IMAGE UPLOAD */}
          <div className="mb-6 border border-[#101c4d]/10 rounded-md p-5">
            <label className="block text-sm font-medium text-[#101c4d] mb-3">
              Event Image
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

              {(selectedImage || imagePreview) && (
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
                  alt="Event preview"
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
          onEdit={handleEditEvent}
          onDelete={setDeleting}
          onTogglePublish={async (row) => {
            try {
              await eventService.togglePublish(row._id);
              await load();
            } catch (err) {
              setError(
                err.response?.data?.message ||
                  "Could not change publish status."
              );
            }
          }}
          onToggleFeatured={async (row) => {
            try {
              await eventService.toggleFeatured(row._id);
              await load();
            } catch (err) {
              setError(
                err.response?.data?.message ||
                  "Could not change featured status."
              );
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete event?"
        message={`"${deleting?.title}" will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default EventsManager;
