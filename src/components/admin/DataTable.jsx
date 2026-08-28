import { Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";

const DataTable = ({ columns, rows, onEdit, onDelete, onTogglePublish, onToggleFeatured }) => {
  if (!rows.length) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-[#101c4d]/20 py-16 text-center">
        <p className="text-sm text-[#101c4d]/50">No items yet. Add your first one above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#101c4d]/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#101c4d]/5 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-[#101c4d]/60"
              >
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-[#101c4d]/60 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#101c4d]/5">
          {rows.map((row) => (
            <tr key={row._id} className="hover:bg-[#101c4d]/[0.02]">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    title={row.featured ? "Unfeature" : "Feature"}
                    onClick={() => onToggleFeatured(row)}
                    className={`p-1.5 rounded hover:bg-[#101c4d]/5 ${
                      row.featured ? "text-[#f2a223]" : "text-[#101c4d]/30"
                    }`}
                  >
                    <Star size={16} fill={row.featured ? "currentColor" : "none"} />
                  </button>
                  <button
                    title={row.status === "published" ? "Unpublish" : "Publish"}
                    onClick={() => onTogglePublish(row)}
                    className="p-1.5 rounded hover:bg-[#101c4d]/5 text-[#101c4d]/60"
                  >
                    {row.status === "published" ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    title="Edit"
                    onClick={() => onEdit(row)}
                    className="p-1.5 rounded hover:bg-[#101c4d]/5 text-[#101c4d]/60"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => onDelete(row)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;