import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import ContentForm from "../../components/admin/ContentForm";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { researchService } from "../../services/contentService";

const fields = [
  { name: "title", label: "Title", type: "text", required: true, wide: true },
  { name: "shortDescription", label: "Short Description", type: "textarea", wide: true },
  { name: "description", label: "Full Description", type: "textarea", wide: true },
  { name: "category", label: "Category", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "researchArea", label: "Research Area", type: "text" },
  { name: "authors", label: "Authors", type: "array" },
  { name: "publicationDate", label: "Publication Date", type: "date" },
  { name: "image", label: "Image URL", type: "url" },
  { name: "documentUrl", label: "Document URL", type: "url" },
  { name: "externalUrl", label: "External URL", type: "url" },
  { name: "status", label: "Status", type: "select", options: ["draft", "published"] },
  { name: "featured", label: "Featured", type: "checkbox" },
];

const columns = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded ${
          row.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
        }`}
      >
        {row.status}
      </span>
    ),
  },
  { key: "updatedAt", label: "Updated", render: (row) => new Date(row.updatedAt).toLocaleDateString() },
];

const ResearchManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await researchService.getAll({ limit: 100 });
      setItems(res.data);
    } catch {
      setError("Could not load research items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (row) => {
    setEditing(row);
    setShowForm(true);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editing) await researchService.update(editing._id, payload);
      else await researchService.create(payload);
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await researchService.remove(deleting._id);
      setDeleting(null);
      load();
    } catch {
      setError("Delete failed.");
    }
  };

  const handleTogglePublish = async (row) => {
    await researchService.togglePublish(row._id);
    load();
  };

  const handleToggleFeatured = async (row) => {
    await researchService.toggleFeatured(row._id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[#101c4d]">Research</h1>
          <p className="text-sm text-[#101c4d]/60">Manage research entries</p>
        </div>
        {!showForm && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#101c4d] text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-[#1a2a63]"
          >
            <Plus size={16} /> Add Research
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
            {editing ? "Edit Research" : "New Research"}
          </h2>
          <ContentForm
            fields={fields}
            initialValues={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            submitting={saving}
          />
        </div>
      ) : loading ? (
        <p className="font-mono text-sm text-[#101c4d]/60">Loading…</p>
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