import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import ContentForm from "../../components/admin/ContentForm";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { programService } from "../../services/contentService";

const fields = [
  { name: "title", label: "Title", type: "text", required: true, wide: true },
  { name: "shortDescription", label: "Short Description", type: "textarea", wide: true },
  { name: "description", label: "Full Description", type: "textarea", wide: true },
  { name: "category", label: "Category", type: "text" },
  { name: "duration", label: "Duration", type: "text", placeholder: "6 weeks" },
  { name: "eligibility", label: "Eligibility", type: "textarea", wide: true },
  { name: "location", label: "Location", type: "text" },
  { name: "startDate", label: "Start Date", type: "date" },
  { name: "endDate", label: "End Date", type: "date" },
  { name: "applicationDeadline", label: "Application Deadline", type: "date" },
  { name: "registrationLink", label: "Registration Link", type: "url" },
  { name: "image", label: "Image URL", type: "url" },
  { name: "brochureUrl", label: "Brochure URL", type: "url" },
  { name: "coordinator", label: "Coordinator", type: "text" },
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
];

const ProgramsManager = () => {
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
      const res = await programService.getAll({ limit: 100 });
      setItems(res.data);
    } catch {
      setError("Could not load programs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editing) await programService.update(editing._id, payload);
      else await programService.create(payload);
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
      await programService.remove(deleting._id);
      setDeleting(null);
      load();
    } catch {
      setError("Delete failed.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[#101c4d]">Programs</h1>
          <p className="text-sm text-[#101c4d]/60">Manage programs</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-[#101c4d] text-white text-sm font-medium px-4 py-2.5 rounded-md hover:bg-[#1a2a63]"
          >
            <Plus size={16} /> Add Program
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
            {editing ? "Edit Program" : "New Program"}
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
          onEdit={(row) => {
            setEditing(row);
            setShowForm(true);
          }}
          onDelete={setDeleting}
          onTogglePublish={async (row) => {
            await programService.togglePublish(row._id);
            load();
          }}
          onToggleFeatured={async (row) => {
            await programService.toggleFeatured(row._id);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete program?"
        message={`"${deleting?.title}" will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default ProgramsManager;