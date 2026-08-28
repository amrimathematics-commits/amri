import { useEffect, useState } from "react";

import {
  FlaskConical,
  CalendarDays,
  Lightbulb,
  GraduationCap,
  UserPlus,
  ShieldCheck,
  Shield,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

import { fetchDashboardStats } from "../../services/contentService";
import { useAuth } from "../../context/AuthContext";

const statCards = [
  {
    key: "totalResearch",
    label: "Total Research",
    icon: FlaskConical,
  },
  {
    key: "totalEvents",
    label: "Total Events",
    icon: CalendarDays,
  },
  {
    key: "totalInnovations",
    label: "Total Innovations",
    icon: Lightbulb,
  },
  {
    key: "totalPrograms",
    label: "Total Programs",
    icon: GraduationCap,
  },
];

const AdminDashboard = () => {
  const { admin } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD STATE
  |--------------------------------------------------------------------------
  */

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | ADMIN MANAGEMENT STATE
  |--------------------------------------------------------------------------
  */

  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsError, setAdminsError] = useState("");

  const [showAddAdmin, setShowAddAdmin] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | ADMIN ACTION STATE
  |--------------------------------------------------------------------------
  */

  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD STATS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetchDashboardStats();

        setStats(res.data);
      } catch (err) {
        console.error(
          "Failed to load dashboard stats:",
          err
        );

        setError(
          err.message ||
            "Could not load dashboard stats."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD ADMINS
  |--------------------------------------------------------------------------
  */

  const loadAdmins = async () => {
    if (admin?.role !== "superadmin") {
      return;
    }

    try {
      setAdminsLoading(true);
      setAdminsError("");

      const token = localStorage.getItem(
        "amri_admin_token"
      );

      const response = await fetch(
        "/api/auth/admins",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
      |--------------------------------------------------------------------------
      | SAFELY READ RESPONSE
      |--------------------------------------------------------------------------
      */

      const contentType =
        response.headers.get("content-type") || "";

      let result = null;

      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          `Server returned ${response.status} instead of JSON. ${
            text.slice(0, 100) || ""
          }`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to load administrators."
        );
      }

      setAdmins(result?.data || []);
    } catch (err) {
      console.error(
        "Failed to load admins:",
        err
      );

      setAdminsError(
        err.message ||
          "Unable to load administrators."
      );
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.role === "superadmin") {
      loadAdmins();
    }
  }, [admin]);

  /*
  |--------------------------------------------------------------------------
  | FORM HANDLER
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE ADD ADMIN MODAL
  |--------------------------------------------------------------------------
  */

  const closeAddAdmin = () => {
    if (creatingAdmin) {
      return;
    }

    setShowAddAdmin(false);

    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setCreateError("");
    setCreateSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE ADMIN
  |--------------------------------------------------------------------------
  */

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!form.name.trim()) {
      setCreateError(
        "Please enter the admin name."
      );
      return;
    }

    if (!form.email.trim()) {
      setCreateError(
        "Please enter the admin email."
      );
      return;
    }

    if (form.password.length < 8) {
      setCreateError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setCreateError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setCreatingAdmin(true);

      const token = localStorage.getItem(
        "amri_admin_token"
      );

      const response = await fetch(
        "/api/auth/admins",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email
              .trim()
              .toLowerCase(),
            password: form.password,
          }),
        }
      );

      /*
      |--------------------------------------------------------------------------
      | SAFELY READ RESPONSE
      |--------------------------------------------------------------------------
      */

      const contentType =
        response.headers.get("content-type") || "";

      let result = null;

      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          `Server returned ${response.status} instead of JSON. ${
            text.slice(0, 100) || ""
          }`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to create admin."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | ADD NEW ADMIN TO LIST
      |--------------------------------------------------------------------------
      */

      if (result?.data) {
        setAdmins((current) => [
          result.data,
          ...current,
        ]);
      }

      setCreateSuccess(
        "New admin created successfully."
      );

      /*
      |--------------------------------------------------------------------------
      | RESET FORM
      |--------------------------------------------------------------------------
      */

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      /*
      |--------------------------------------------------------------------------
      | CLOSE MODAL
      |--------------------------------------------------------------------------
      */

      setTimeout(() => {
        setShowAddAdmin(false);
        setCreateSuccess("");
      }, 1200);
    } catch (err) {
      console.error(
        "Failed to create admin:",
        err
      );

      setCreateError(
        err.message ||
          "Unable to create admin."
      );
    } finally {
      setCreatingAdmin(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PROMOTE ADMIN
  |--------------------------------------------------------------------------
  */

  const handlePromoteAdmin = async (adminId) => {
    const selectedAdmin = admins.find(
      (item) => item._id === adminId
    );

    if (!selectedAdmin) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to promote ${selectedAdmin.name} to Super Admin?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `promote-${adminId}`
      );

      setActionError("");
      setActionSuccess("");

      const token = localStorage.getItem(
        "amri_admin_token"
      );

      const response = await fetch(
        `/api/auth/admins/${adminId}/promote`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
      |--------------------------------------------------------------------------
      | SAFELY READ RESPONSE
      |--------------------------------------------------------------------------
      */

      const contentType =
        response.headers.get("content-type") || "";

      let result = null;

      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          `Server returned ${response.status} instead of JSON. ${
            text.slice(0, 100) || ""
          }`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to promote admin."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE ADMIN IN LOCAL STATE
      |--------------------------------------------------------------------------
      */

      setAdmins((current) =>
        current.map((item) =>
          item._id === adminId
            ? {
                ...item,
                role: "superadmin",
              }
            : item
        )
      );

      setActionSuccess(
        `${selectedAdmin.name} is now a Super Admin.`
      );
    } catch (err) {
      console.error(
        "Failed to promote admin:",
        err
      );

      setActionError(
        err.message ||
          "Unable to promote admin."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE ADMIN
  |--------------------------------------------------------------------------
  */

  const handleDeleteAdmin = async (adminId) => {
    const selectedAdmin = admins.find(
      (item) => item._id === adminId
    );

    if (!selectedAdmin) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | PREVENT SELF DELETE
    |--------------------------------------------------------------------------
    */

    if (
      admin?._id &&
      String(admin._id) ===
        String(adminId)
    ) {
      window.alert(
        "You cannot delete your own account."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIRM DELETE
    |--------------------------------------------------------------------------
    */

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedAdmin.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `delete-${adminId}`
      );

      setActionError("");
      setActionSuccess("");

      const token = localStorage.getItem(
        "amri_admin_token"
      );

      const response = await fetch(
        `/api/auth/admins/${adminId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
      |--------------------------------------------------------------------------
      | SAFELY READ RESPONSE
      |--------------------------------------------------------------------------
      */

      const contentType =
        response.headers.get("content-type") || "";

      let result = null;

      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          `Server returned ${response.status} instead of JSON. ${
            text.slice(0, 100) || ""
          }`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to delete admin."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | REMOVE ADMIN FROM LOCAL STATE
      |--------------------------------------------------------------------------
      */

      setAdmins((current) =>
        current.filter(
          (item) => item._id !== adminId
        )
      );

      setActionSuccess(
        `${selectedAdmin.name} was deleted successfully.`
      );
    } catch (err) {
      console.error(
        "Failed to delete admin:",
        err
      );

      setActionError(
        err.message ||
          "Unable to delete admin."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <p className="font-mono text-sm text-[#101c4d]/60">
        Loading dashboard…
      </p>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <p className="text-red-600 text-sm">
        {error}
      </p>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="mb-8">
        <h1 className="font-serif text-2xl text-[#101c4d] mb-1">
          Dashboard
        </h1>

        <p className="text-sm text-[#101c4d]/60">
          Overview of AMRI content
        </p>
      </div>

      {/* =========================================================
          STATS
      ========================================================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map(
          ({
            key,
            label,
            icon: Icon,
          }) => (
            <div
              key={key}
              className="bg-white rounded-lg border border-[#101c4d]/10 p-5"
            >
              <Icon
                size={20}
                className="text-[#f2a223] mb-3"
                strokeWidth={1.75}
              />

              <p className="font-serif text-3xl text-[#101c4d]">
                {stats?.totals?.[key] ?? 0}
              </p>

              <p className="font-mono text-[11px] uppercase tracking-wide text-[#101c4d]/50 mt-1">
                {label}
              </p>
            </div>
          )
        )}
      </div>

      {/* =========================================================
          ADMIN MANAGEMENT
          SUPERADMIN ONLY
      ========================================================= */}

      {admin?.role === "superadmin" && (
        <section className="mb-10">
          {/* HEADER */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={20}
                  className="text-[#f2a223]"
                />

                <h2 className="font-serif text-lg text-[#101c4d]">
                  Admin Management
                </h2>
              </div>

              <p className="text-sm text-[#101c4d]/60 mt-1">
                Manage AMRI administrator
                accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddAdmin(true);
                setCreateError("");
                setCreateSuccess("");
                setActionError("");
                setActionSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#101c4d] text-white px-5 py-3 rounded-md text-sm hover:bg-[#17275f] transition-colors"
            >
              <UserPlus size={17} />
              Add New Admin
            </button>
          </div>

          {/* =====================================================
              ACTION MESSAGES
          ===================================================== */}

          {actionError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
              {actionError}
            </div>
          )}

          {actionSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3">
              {actionSuccess}
            </div>
          )}

          {/* =====================================================
              ADMIN LIST
          ===================================================== */}

          <div className="bg-white rounded-lg border border-[#101c4d]/10 overflow-hidden">
            {adminsLoading && (
              <div className="p-6 flex items-center gap-3 text-sm text-[#101c4d]/50">
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Loading administrators…
              </div>
            )}

            {adminsError && (
              <div className="p-6 text-sm text-red-600">
                {adminsError}
              </div>
            )}

            {!adminsLoading &&
              !adminsError &&
              admins.length === 0 && (
                <div className="p-6 text-sm text-[#101c4d]/50">
                  No administrators found.
                </div>
              )}

            {!adminsLoading &&
              !adminsError &&
              admins.length > 0 && (
                <div className="divide-y divide-[#101c4d]/10">
                  {admins.map((item) => {
                    const isCurrentAdmin =
                      admin?._id &&
                      String(admin._id) ===
                        String(item._id);

                    const isSuperAdmin =
                      item.role ===
                      "superadmin";

                    const promoting =
                      actionLoading ===
                      `promote-${item._id}`;

                    const deleting =
                      actionLoading ===
                      `delete-${item._id}`;

                    return (
                      <div
                        key={item._id}
                        className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
                      >
                        {/* ADMIN INFO */}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-medium text-[#101c4d]">
                              {item.name}
                            </p>

                            {/* ROLE BADGE */}

                            <span
                              className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide px-3 py-1 rounded-full ${
                                isSuperAdmin
                                  ? "bg-[#f2a223]/15 text-[#9a6200]"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isSuperAdmin ? (
                                <ShieldCheck
                                  size={12}
                                />
                              ) : (
                                <Shield
                                  size={12}
                                />
                              )}

                              {isSuperAdmin
                                ? "Super Admin"
                                : "Admin"}
                            </span>

                            {/* CURRENT USER */}

                            {isCurrentAdmin && (
                              <span className="font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#101c4d]/5 text-[#101c4d]/60">
                                You
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-[#101c4d]/60 mt-1 break-all">
                            {item.email}
                          </p>

                          {item.createdAt && (
                            <p className="text-xs text-[#101c4d]/40 mt-2">
                              Added{" "}
                              {new Date(
                                item.createdAt
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-wrap items-center gap-2">
                          {/* PROMOTE */}

                          {!isSuperAdmin &&
                            !isCurrentAdmin && (
                              <button
                                type="button"
                                onClick={() =>
                                  handlePromoteAdmin(
                                    item._id
                                  )
                                }
                                disabled={
                                  actionLoading !==
                                    null
                                }
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium bg-[#f2a223] text-[#101c4d] hover:bg-[#e49a1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {promoting ? (
                                  <>
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                    Promoting...
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck
                                      size={14}
                                    />
                                    Promote to
                                    Super Admin
                                  </>
                                )}
                              </button>
                            )}

                          {/* DELETE */}

                          {!isCurrentAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteAdmin(
                                  item._id
                                )
                              }
                              disabled={
                                actionLoading !==
                                  null
                              }
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deleting ? (
                                <>
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2
                                    size={14}
                                  />
                                  Delete
                                </>
                              )}
                            </button>
                          )}

                          {/* CURRENT USER MESSAGE */}

                          {isCurrentAdmin && (
                            <span className="text-xs text-[#101c4d]/40">
                              Current account
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>

          {/* =====================================================
              ADD ADMIN MODAL
          ===================================================== */}

          {showAddAdmin && (
            <div
              className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
              onMouseDown={(e) => {
                if (
                  e.target === e.currentTarget &&
                  !creatingAdmin
                ) {
                  closeAddAdmin();
                }
              }}
            >
              <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* MODAL HEADER */}

                <div className="flex items-center justify-between px-6 py-5 border-b border-[#101c4d]/10">
                  <div>
                    <h3 className="font-serif text-xl text-[#101c4d]">
                      Add New Admin
                    </h3>

                    <p className="text-sm text-[#101c4d]/60 mt-1">
                      Create a new AMRI
                      administrator account.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeAddAdmin}
                    disabled={creatingAdmin}
                    className="text-[#101c4d]/50 hover:text-[#101c4d] disabled:opacity-40"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* FORM */}

                <form
                  onSubmit={handleCreateAdmin}
                  className="p-6 space-y-5"
                >
                  {/* NAME */}

                  <div>
                    <label className="block text-sm font-medium text-[#101c4d] mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter admin name"
                      autoComplete="name"
                      className="w-full border border-[#101c4d]/15 rounded-md px-4 py-3 text-sm outline-none focus:border-[#f2a223]"
                      disabled={
                        creatingAdmin
                      }
                    />
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label className="block text-sm font-medium text-[#101c4d] mb-2">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@example.com"
                      autoComplete="email"
                      className="w-full border border-[#101c4d]/15 rounded-md px-4 py-3 text-sm outline-none focus:border-[#f2a223]"
                      disabled={
                        creatingAdmin
                      }
                    />
                  </div>

                  {/* PASSWORD */}

                  <div>
                    <label className="block text-sm font-medium text-[#101c4d] mb-2">
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="w-full border border-[#101c4d]/15 rounded-md px-4 py-3 text-sm outline-none focus:border-[#f2a223]"
                      disabled={
                        creatingAdmin
                      }
                    />
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>
                    <label className="block text-sm font-medium text-[#101c4d] mb-2">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      name="confirmPassword"
                      value={
                        form.confirmPassword
                      }
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      className="w-full border border-[#101c4d]/15 rounded-md px-4 py-3 text-sm outline-none focus:border-[#f2a223]"
                      disabled={
                        creatingAdmin
                      }
                    />
                  </div>

                  {/* ERROR */}

                  {createError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                      {createError}
                    </div>
                  )}

                  {/* SUCCESS */}

                  {createSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3">
                      {createSuccess}
                    </div>
                  )}

                  {/* BUTTONS */}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeAddAdmin}
                      disabled={
                        creatingAdmin
                      }
                      className="px-5 py-2.5 text-sm border border-[#101c4d]/15 rounded-md text-[#101c4d] hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        creatingAdmin
                      }
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-md bg-[#f2a223] text-[#101c4d] font-medium hover:bg-[#e49a1e] disabled:opacity-60"
                    >
                      {creatingAdmin ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />

                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus
                            size={15}
                          />

                          Create Admin
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =========================================================
          RECENTLY UPDATED
      ========================================================= */}

      <h2 className="font-serif text-lg text-[#101c4d] mb-4">
        Recently Updated
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(
          stats?.recent || {}
        ).map(([module, items]) => (
          <div
            key={module}
            className="bg-white rounded-lg border border-[#101c4d]/10 p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#101c4d]/50 mb-3 capitalize">
              {module}
            </p>

            {items.length === 0 && (
              <p className="text-sm text-[#101c4d]/40">
                Nothing yet.
              </p>
            )}

            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[#101c4d] truncate pr-3">
                    {item.title}
                  </span>

                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded ${
                      item.status ===
                      "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;