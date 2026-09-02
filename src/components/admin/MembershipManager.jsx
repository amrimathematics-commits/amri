import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  Search,
  UserCheck,
  X,
  Landmark,
  RotateCcw,
  Ban,
} from "lucide-react";

const STATUS_LABELS = {
  submitted: "New Request",
  bank_details_sent: "Bank Details Sent",
  payment_received: "Payment Received",
  member: "Member",
  stopped: "Stopped",
};

const STATUS_STYLES = {
  submitted:
    "bg-blue-50 text-blue-700 border-blue-100",

  bank_details_sent:
    "bg-amber-50 text-amber-700 border-amber-100",

  payment_received:
    "bg-green-50 text-green-700 border-green-100",

  member:
    "bg-[#101c4d]/10 text-[#101c4d] border-[#101c4d]/10",

  stopped:
    "bg-red-50 text-red-700 border-red-100",
};

const MembershipManager = () => {
  /*
  |--------------------------------------------------------------------------
  | MEMBERSHIPS
  |--------------------------------------------------------------------------
  */

  const [memberships, setMemberships] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | SELECTED MEMBERSHIP
  |--------------------------------------------------------------------------
  */

  const [selectedMembership, setSelectedMembership] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | SEARCH / FILTER
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  /*
  |--------------------------------------------------------------------------
  | ACTION STATE
  |--------------------------------------------------------------------------
  */

  const [actionLoading, setActionLoading] =
    useState(null);

  const [actionError, setActionError] =
    useState("");

  const [actionSuccess, setActionSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | BANK DETAILS
  |--------------------------------------------------------------------------
  */

  const [bankDetails, setBankDetails] =
    useState({
      accountName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      branch: "",
      upiId: "",
      paymentInstructions: "",
    });

  const [bankLoading, setBankLoading] =
    useState(false);

  const [bankSaving, setBankSaving] =
    useState(false);

  const [bankError, setBankError] =
    useState("");

  const [bankSuccess, setBankSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | RENEWALS
  |--------------------------------------------------------------------------
  */

  const [pendingRenewals, setPendingRenewals] =
    useState([]);

  const [renewalLoading, setRenewalLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | ERROR HELPER
  |--------------------------------------------------------------------------
  */

  const getErrorMessage = (
    err,
    fallback
  ) => {
    return (
      err?.response?.data?.message ||
      err?.message ||
      fallback
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD MEMBERSHIPS
  |--------------------------------------------------------------------------
  */

  const loadMemberships = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/membership");

      setMemberships(
        response.data?.data || []
      );
    } catch (err) {
      console.error(
        "Load memberships failed:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load membership applications."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD BANK DETAILS
  |--------------------------------------------------------------------------
  */

  const loadBankDetails = async () => {
    try {
      setBankLoading(true);
      setBankError("");

      const response =
        await api.get(
          "/membership/bank-details"
        );

      const data =
        response.data?.data;

      if (data) {
        setBankDetails({
          accountName:
            data.accountName || "",

          bankName:
            data.bankName || "",

          accountNumber:
            data.accountNumber || "",

          ifscCode:
            data.ifscCode ||
            data.ifsc ||
            "",

          branch:
            data.branch || "",

          upiId:
            data.upiId ||
            data.upi ||
            "",

          paymentInstructions:
            data.paymentInstructions ||
            "",
        });
      }
    } catch (err) {
      console.error(
        "Load bank details failed:",
        err
      );

      setBankError(
        getErrorMessage(
          err,
          "Unable to load bank details."
        )
      );
    } finally {
      setBankLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE BANK DETAILS
  |--------------------------------------------------------------------------
  */

  const saveBankDetails = async () => {
    try {
      setBankSaving(true);
      setBankError("");
      setBankSuccess("");

      const response =
        await api.put(
          "/membership/bank-details",
          bankDetails
        );

      const data =
        response.data?.data;

      if (data) {
        setBankDetails({
          accountName:
            data.accountName || "",

          bankName:
            data.bankName || "",

          accountNumber:
            data.accountNumber || "",

          ifscCode:
            data.ifscCode ||
            data.ifsc ||
            "",

          branch:
            data.branch || "",

          upiId:
            data.upiId ||
            data.upi ||
            "",

          paymentInstructions:
            data.paymentInstructions ||
            "",
        });
      }

      setBankSuccess(
        "Bank details saved successfully."
      );
    } catch (err) {
      console.error(
        "Save bank details failed:",
        err
      );

      setBankError(
        getErrorMessage(
          err,
          "Unable to save bank details."
        )
      );
    } finally {
      setBankSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD PENDING RENEWALS
  |--------------------------------------------------------------------------
  */

  const loadPendingRenewals =
    async () => {
      try {
        setRenewalLoading(true);

        const response =
          await api.get(
            "/admin/membership-renewals/pending"
          );

        setPendingRenewals(
          response.data?.data || []
        );
      } catch (err) {
        console.error(
          "Load pending renewals failed:",
          err
        );

        setPendingRenewals([]);

        /*
        |--------------------------------------------------------------------------
        | Do not break membership page if renewal endpoint
        | is unavailable.
        |--------------------------------------------------------------------------
        */

        if (
          err.response?.status !== 404
        ) {
          setError(
            getErrorMessage(
              err,
              "Unable to load pending renewals."
            )
          );
        }
      } finally {
        setRenewalLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadMemberships();
    loadBankDetails();
    loadPendingRenewals();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTERED MEMBERSHIPS
  |--------------------------------------------------------------------------
  */

  const filteredMemberships = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return memberships.filter(
      (item) => {
        const matchesSearch =
          !query ||
          item.name
            ?.toLowerCase()
            .includes(query) ||
          item.email
            ?.toLowerCase()
            .includes(query) ||
          item.membershipType
            ?.toLowerCase()
            .includes(query) ||
          item.memberId
            ?.toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          item.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    memberships,
    search,
    statusFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | STATUS COUNTS
  |--------------------------------------------------------------------------
  */

  const counts = useMemo(() => {
    return {
      all: memberships.length,

      submitted:
        memberships.filter(
          (item) =>
            item.status === "submitted"
        ).length,

      bank_details_sent:
        memberships.filter(
          (item) =>
            item.status ===
            "bank_details_sent"
        ).length,

      payment_received:
        memberships.filter(
          (item) =>
            item.status ===
            "payment_received"
        ).length,

      member:
        memberships.filter(
          (item) =>
            item.status === "member"
        ).length,

      stopped:
        memberships.filter(
          (item) =>
            item.status === "stopped"
        ).length,
    };
  }, [memberships]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE LOCAL MEMBERSHIP
  |--------------------------------------------------------------------------
  */

  const updateLocalMembership = (
    updatedMembership
  ) => {
    if (!updatedMembership?._id) {
      return;
    }

    setMemberships((current) =>
      current.map((item) =>
        item._id ===
        updatedMembership._id
          ? {
              ...item,
              ...updatedMembership,
            }
          : item
      )
    );

    setSelectedMembership(
      (current) =>
        current?._id ===
        updatedMembership._id
          ? {
              ...current,
              ...updatedMembership,
            }
          : current
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SEND BANK DETAILS
  |--------------------------------------------------------------------------
  */

  const handleSendBankDetails =
    async (membership) => {
      const confirmed =
        window.confirm(
          `Send payment/bank details to ${membership.name}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `bank-${membership._id}`
        );

        setActionError("");
        setActionSuccess("");
        setError("");

        const response =
          await api.post(
            `/membership/${membership._id}/send-bank-details`
          );

        const updatedMembership =
          response.data?.data;

        if (updatedMembership) {
          updateLocalMembership(
            updatedMembership
          );
        } else {
          await loadMemberships();
        }

        setActionSuccess(
          `Bank details sent successfully to ${membership.email}.`
        );
      } catch (err) {
        console.error(
          "Send bank details failed:",
          err
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to send bank details."
          )
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | PAYMENT RECEIVED
  |--------------------------------------------------------------------------
  */

  const handlePaymentReceived =
    async (membership) => {
      const confirmed =
        window.confirm(
          `Confirm that payment has been received from ${membership.name}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `payment-${membership._id}`
        );

        setActionError("");
        setActionSuccess("");
        setError("");

        const response =
          await api.patch(
            `/membership/${membership._id}/payment-received`
          );

        const updatedMembership =
          response.data?.data;

        if (updatedMembership) {
          updateLocalMembership(
            updatedMembership
          );
        } else {
          await loadMemberships();
        }

        setActionSuccess(
          "Payment marked as received."
        );
      } catch (err) {
        console.error(
          "Payment confirmation failed:",
          err
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to mark payment received."
          )
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | MAKE MEMBER
  |--------------------------------------------------------------------------
  */

  const handleMakeMember =
    async (membership) => {
      const confirmed =
        window.confirm(
          `Make ${membership.name} an official AMRI member?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `member-${membership._id}`
        );

        setActionError("");
        setActionSuccess("");
        setError("");

        const response =
          await api.patch(
            `/membership/${membership._id}/make-member`
          );

        const updatedMembership =
          response.data?.data;

        if (updatedMembership) {
          updateLocalMembership(
            updatedMembership
          );
        } else {
          await loadMemberships();
        }

        setActionSuccess(
          `${membership.name} is now an AMRI member.`
        );
      } catch (err) {
        console.error(
          "Make member failed:",
          err
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to activate membership."
          )
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | STOP MEMBERSHIP
  |--------------------------------------------------------------------------
  */

  const handleStopMembership =
    async (membership) => {
      const reason =
        window.prompt(
          `Why are you stopping ${membership.name}'s membership?`
        );

      if (reason === null) {
        return;
      }

      const cleanReason =
        reason.trim();

      if (!cleanReason) {
        setActionError(
          "Please provide a reason for stopping the membership."
        );

        return;
      }

      try {
        setActionLoading(
          `stop-${membership._id}`
        );

        setActionError("");
        setActionSuccess("");

        const response =
          await api.patch(
            `/membership/${membership._id}/stop`,
            {
              reason: cleanReason,
            }
          );

        const updatedMembership =
          response.data?.data;

        if (updatedMembership) {
          updateLocalMembership(
            updatedMembership
          );
        } else {
          await loadMemberships();
        }

        setActionSuccess(
          "Membership stopped successfully."
        );
      } catch (err) {
        console.error(
          "Stop membership failed:",
          err
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to stop membership."
          )
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | REACTIVATE MEMBERSHIP
  |--------------------------------------------------------------------------
  */

  const handleReactivate =
    async (membership) => {
      const confirmed =
        window.confirm(
          `Reactivate ${membership.name}'s membership?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `reactivate-${membership._id}`
        );

        setActionError("");
        setActionSuccess("");

        const response =
          await api.patch(
            `/membership/${membership._id}/reactivate`
          );

        const updatedMembership =
          response.data?.data;

        if (updatedMembership) {
          updateLocalMembership(
            updatedMembership
          );
        } else {
          await loadMemberships();
        }

        setActionSuccess(
          "Membership reactivated successfully."
        );
      } catch (err) {
        console.error(
          "Reactivate membership failed:",
          err
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to reactivate membership."
          )
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | DELETE MEMBERSHIP
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async (membership) => {
      const confirmed =
        window.confirm(
          `Permanently delete the membership application for ${membership.name}? This cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `delete-${membership._id}`
        );

        setActionError("");
        setActionSuccess("");

        await api.delete(
          `/membership/${membership._id}`
        );

        setMemberships(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                membership._id
            )
        );

        setSelectedMembership(
          (current) =>
            current?._id ===
            membership._id
              ? null
              : current
        );

        setActionSuccess(
          "Membership application deleted successfully."
        );
      } catch (err) {
        console.error(
          "Delete membership failed:",
          err
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to delete membership."
          )
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | APPROVE RENEWAL
  |--------------------------------------------------------------------------
  */

  const handleApproveRenewal =
    async (membership) => {
      const confirmed =
        window.confirm(
          `Approve the renewal request for ${membership.name}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `approve-renewal-${membership._id}`
        );

        setActionError("");
        setActionSuccess("");

        const response =
          await api.post(
            `/admin/membership-renewals/${membership._id}/approve`
          );

        const updatedMembership =
          response.data?.data;

        if (updatedMembership) {
          updateLocalMembership(
            updatedMembership
          );
        }

        setPendingRenewals(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                membership._id
            )
        );

        setActionSuccess(
          "Renewal approved successfully."
        );
      } catch (err) {
        console.error(
          "Approve renewal failed:",
          err
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to approve renewal."
          )
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | REJECT RENEWAL
  |--------------------------------------------------------------------------
  */

  const handleRejectRenewal =
    async (membership) => {
      const reason =
        window.prompt(
          `Reason for rejecting ${membership.name}'s renewal:`
        );

      if (reason === null) {
        return;
      }

      const cleanReason =
        reason.trim();

      if (!cleanReason) {
        setActionError(
          "Please provide a reason for rejecting the renewal."
        );

        return;
      }

      try {
        setActionLoading(
          `reject-renewal-${membership._id}`
        );

        setActionError("");
        setActionSuccess("");

        await api.post(
          `/admin/membership-renewals/${membership._id}/reject`,
          {
            reason: cleanReason,
          }
        );

        setPendingRenewals(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                membership._id
            )
        );

        setActionSuccess(
          "Renewal rejected successfully."
        );
      } catch (err) {
        console.error(
          "Reject renewal failed:",
          err
        );

        setActionError(
          getErrorMessage(
            err,
            "Unable to reject renewal."
          )
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | ACTION BUTTONS
  |--------------------------------------------------------------------------
  */

  const renderActions = (
    membership
  ) => {
    const bankLoading =
      actionLoading ===
      `bank-${membership._id}`;

    const paymentLoading =
      actionLoading ===
      `payment-${membership._id}`;

    const memberLoading =
      actionLoading ===
      `member-${membership._id}`;

    const stopLoading =
      actionLoading ===
      `stop-${membership._id}`;

    const reactivateLoading =
      actionLoading ===
      `reactivate-${membership._id}`;

    const deleteLoading =
      actionLoading ===
      `delete-${membership._id}`;

    if (
      membership.status ===
      "submitted"
    ) {
      return (
        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              handleSendBankDetails(
                membership
              )
            }
            disabled={!!actionLoading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f2a223] px-4 py-2.5 text-xs font-medium text-[#101c4d] hover:bg-[#e49a1e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bankLoading ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                Sending...
              </>
            ) : (
              <>
                <Mail size={14} />
                Send Bank Details
              </>
            )}
          </button>

        </div>
      );
    }

    if (
      membership.status ===
      "bank_details_sent"
    ) {
      return (
        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              handlePaymentReceived(
                membership
              )
            }
            disabled={!!actionLoading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {paymentLoading ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                Updating...
              </>
            ) : (
              <>
                <CreditCard size={14} />
                Payment Received
              </>
            )}
          </button>

        </div>
      );
    }

    if (
      membership.status ===
      "payment_received"
    ) {
      return (
        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              handleMakeMember(
                membership
              )
            }
            disabled={!!actionLoading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#101c4d] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#17275f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {memberLoading ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                Activating...
              </>
            ) : (
              <>
                <UserCheck size={14} />
                Make Member
              </>
            )}
          </button>

        </div>
      );
    }

    if (
      membership.status ===
      "stopped"
    ) {
      return (
        <button
          type="button"
          onClick={() =>
            handleReactivate(
              membership
            )
          }
          disabled={!!actionLoading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {reactivateLoading ? (
            <>
              <Loader2
                size={14}
                className="animate-spin"
              />
              Reactivating...
            </>
          ) : (
            <>
              <RotateCcw size={14} />
              Reactivate
            </>
          )}
        </button>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">

        <span className="inline-flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
          <CheckCircle2 size={14} />
          Active Member
        </span>

      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh = async () => {
    setActionError("");
    setActionSuccess("");

    await Promise.all([
      loadMemberships(),
      loadBankDetails(),
      loadPendingRenewals(),
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">

        <div className="flex items-center gap-3 text-sm text-[#101c4d]/60">

          <Loader2
            size={18}
            className="animate-spin"
          />

          Loading membership applications...

        </div>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative">

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="mb-7">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f2a223]">
              Administration
            </p>

            <h1 className="font-serif text-2xl text-[#101c4d]">
              Membership
            </h1>

            <p className="mt-1 text-sm text-[#101c4d]/60">
              Manage membership applications,
              payments, renewals and active
              members.
            </p>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-[#101c4d]/15 px-4 py-2.5 text-xs font-medium text-[#101c4d] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

      </div>

      {/* ============================================================
          ALERTS
      ============================================================ */}

      {(error ||
        actionError ||
        actionSuccess) && (
        <div className="mb-5 space-y-2">

          {(error ||
            actionError) && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error || actionError}
            </div>
          )}

          {actionSuccess && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {actionSuccess}
            </div>
          )}

        </div>
      )}

      {/* ============================================================
          STATUS SUMMARY
      ============================================================ */}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">

        {[
          {
            key: "all",
            label: "All",
            icon: FileText,
          },
          {
            key: "submitted",
            label: "New",
            icon: Clock3,
          },
          {
            key: "bank_details_sent",
            label: "Bank Sent",
            icon: Mail,
          },
          {
            key: "payment_received",
            label: "Paid",
            icon: CreditCard,
          },
          {
            key: "member",
            label: "Members",
            icon: UserCheck,
          },
        ].map(
          ({
            key,
            label,
            icon: Icon,
          }) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setStatusFilter(key)
              }
              className={`rounded-lg border bg-white p-4 text-left transition-colors ${
                statusFilter === key
                  ? "border-[#101c4d] ring-1 ring-[#101c4d]"
                  : "border-[#101c4d]/10 hover:border-[#101c4d]/25"
              }`}
            >

              <div className="flex items-center justify-between">

                <Icon
                  size={18}
                  className="text-[#f2a223]"
                  strokeWidth={1.8}
                />

                <span className="font-serif text-2xl text-[#101c4d]">
                  {counts[key]}
                </span>

              </div>

              <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-[#101c4d]/50">
                {label}
              </p>

            </button>
          )
        )}

      </div>

      {/* ============================================================
          BANK DETAILS
      ============================================================ */}

      <section className="mb-6 overflow-hidden rounded-lg border border-[#101c4d]/10 bg-white">

        <div className="border-b border-[#101c4d]/10 px-6 py-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Landmark
                  size={18}
                  className="text-[#f2a223]"
                />

                <h2 className="font-serif text-lg text-[#101c4d]">
                  Payment Bank Details
                </h2>

              </div>

              <p className="mt-1 text-xs text-[#101c4d]/50">
                These details are sent to
                applicants when payment is
                requested.
              </p>

            </div>

            <button
              type="button"
              onClick={loadBankDetails}
              disabled={bankLoading}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#101c4d]/15 px-3 py-2 text-xs font-medium text-[#101c4d] hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={
                  bankLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Reload

            </button>

          </div>

        </div>

        <div className="p-6">

          {bankError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {bankError}
            </div>
          )}

          {bankSuccess && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {bankSuccess}
            </div>
          )}

          {bankLoading ? (

            <div className="flex items-center gap-2 text-sm text-[#101c4d]/50">

              <Loader2
                size={16}
                className="animate-spin"
              />

              Loading bank details...

            </div>

          ) : (

            <div className="grid gap-4 md:grid-cols-2">

              <BankInput
                label="Account Name"
                value={
                  bankDetails.accountName
                }
                onChange={(value) =>
                  setBankDetails(
                    (current) => ({
                      ...current,
                      accountName:
                        value,
                    })
                  )
                }
              />

              <BankInput
                label="Bank Name"
                value={
                  bankDetails.bankName
                }
                onChange={(value) =>
                  setBankDetails(
                    (current) => ({
                      ...current,
                      bankName:
                        value,
                    })
                  )
                }
              />

              <BankInput
                label="Account Number"
                value={
                  bankDetails.accountNumber
                }
                onChange={(value) =>
                  setBankDetails(
                    (current) => ({
                      ...current,
                      accountNumber:
                        value,
                    })
                  )
                }
              />

              <BankInput
                label="IFSC Code"
                value={
                  bankDetails.ifscCode
                }
                onChange={(value) =>
                  setBankDetails(
                    (current) => ({
                      ...current,
                      ifscCode:
                        value,
                    })
                  )
                }
              />

              <BankInput
                label="Branch"
                value={
                  bankDetails.branch
                }
                onChange={(value) =>
                  setBankDetails(
                    (current) => ({
                      ...current,
                      branch:
                        value,
                    })
                  )
                }
              />

              <BankInput
                label="UPI ID"
                value={
                  bankDetails.upiId
                }
                onChange={(value) =>
                  setBankDetails(
                    (current) => ({
                      ...current,
                      upiId:
                        value,
                    })
                  )
                }
              />

              <div className="md:col-span-2">

                <label className="block">

                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#101c4d]/40">
                    Payment Instructions
                  </span>

                  <textarea
                    value={
                      bankDetails.paymentInstructions
                    }
                    onChange={(e) =>
                      setBankDetails(
                        (current) => ({
                          ...current,
                          paymentInstructions:
                            e.target.value,
                        })
                      )
                    }
                    rows={3}
                    className="mt-2 w-full rounded-md border border-[#101c4d]/15 bg-white px-3 py-2.5 text-sm text-[#101c4d] outline-none focus:border-[#101c4d]"
                    placeholder="Enter payment instructions..."
                  />

                </label>

              </div>

              <div className="md:col-span-2">

                <button
                  type="button"
                  onClick={saveBankDetails}
                  disabled={bankSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#101c4d] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#17275f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bankSaving ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Bank Details
                    </>
                  )}
                </button>

              </div>

            </div>

          )}

        </div>

      </section>

      {/* ============================================================
          PENDING RENEWALS
      ============================================================ */}

      {pendingRenewals.length > 0 && (

        <section className="mb-6 overflow-hidden rounded-lg border border-[#101c4d]/10 bg-white">

          <div className="border-b border-[#101c4d]/10 px-6 py-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Renewals
                </p>

                <h2 className="mt-1 font-serif text-lg text-[#101c4d]">
                  Pending Renewal Requests
                </h2>

              </div>

              <span className="rounded-full bg-amber-50 px-3 py-1 font-mono text-[10px] text-amber-700">
                {pendingRenewals.length}
              </span>

            </div>

          </div>

          <div className="divide-y divide-[#101c4d]/10">

            {pendingRenewals.map(
              (renewal) => {

                const approveLoading =
                  actionLoading ===
                  `approve-renewal-${renewal._id}`;

                const rejectLoading =
                  actionLoading ===
                  `reject-renewal-${renewal._id}`;

                return (
                  <div
                    key={renewal._id}
                    className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                  >

                    <div>

                      <h3 className="font-serif text-base text-[#101c4d]">
                        {renewal.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#101c4d]/60">
                        {renewal.email}
                      </p>

                      <p className="mt-2 text-xs text-[#101c4d]/45">
                        {renewal.membershipType ||
                          "Membership renewal"}
                      </p>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleApproveRenewal(
                            renewal
                          )
                        }
                        disabled={
                          !!actionLoading
                        }
                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {approveLoading ? (
                          <>
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2
                              size={14}
                            />
                            Approve
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRejectRenewal(
                            renewal
                          )
                        }
                        disabled={
                          !!actionLoading
                        }
                        className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {rejectLoading ? (
                          <>
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <Ban
                              size={14}
                            />
                            Reject
                          </>
                        )}
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

      )}

      {/* ============================================================
          SEARCH
      ============================================================ */}

      <div className="mb-5 flex flex-col gap-3 md:flex-row">

        <div className="relative flex-1">

          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#101c4d]/40"
          />

          <input
            type="search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search name, email, membership or member ID..."
            className="w-full rounded-md border border-[#101c4d]/15 bg-white py-3 pl-10 pr-4 text-sm text-[#101c4d] outline-none focus:border-[#101c4d]"
          />

        </div>

      </div>

      {/* ============================================================
          MEMBERSHIP LIST
      ============================================================ */}

      <div className="overflow-hidden rounded-lg border border-[#101c4d]/10 bg-white">

        {filteredMemberships.length ===
        0 ? (

          <div className="px-6 py-14 text-center">

            <FileText
              size={32}
              className="mx-auto mb-3 text-[#101c4d]/20"
            />

            <p className="font-serif text-lg text-[#101c4d]">
              No membership applications
            </p>

            <p className="mt-1 text-sm text-[#101c4d]/50">
              Applications matching your
              filters will appear here.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-[#101c4d]/10">

            {filteredMemberships.map(
              (membership) => (

                <div
                  key={membership._id}
                  className="p-5"
                >

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    {/* APPLICANT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="font-serif text-lg text-[#101c4d]">
                          {membership.name}
                        </h2>

                        <span
                          className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide ${
                            STATUS_STYLES[
                              membership.status
                            ] ||
                            "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {STATUS_LABELS[
                            membership.status
                          ] ||
                            membership.status}
                        </span>

                      </div>

                      <p className="mt-1 break-all text-sm text-[#101c4d]/60">
                        {membership.email}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#101c4d]/50">

                        <span>
                          {membership.applicantType ||
                            "Applicant"}
                        </span>

                        <span>
                          {membership.membershipType ||
                            "Membership"}
                        </span>

                        <span className="font-medium text-[#101c4d]/70">
                          ₹
                          {membership.amount}
                        </span>

                        {membership.memberId && (
                          <span>
                            ID:{" "}
                            {membership.memberId}
                          </span>
                        )}

                        <span>
                          {membership.createdAt
                            ? new Date(
                                membership.createdAt
                              ).toLocaleDateString()
                            : ""}
                        </span>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-wrap items-center gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMembership(
                            membership
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-[#101c4d]/15 px-4 py-2.5 text-xs font-medium text-[#101c4d] hover:bg-gray-50"
                      >
                        <Eye size={14} />
                        View
                      </button>

                      {renderActions(
                        membership
                      )}

                      {membership.status ===
                        "member" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStopMembership(
                              membership
                            )
                          }
                          disabled={
                            !!actionLoading
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {actionLoading ===
                          `stop-${membership._id}` ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Ban
                              size={14}
                            />
                          )}

                          Stop

                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            membership
                          )
                        }
                        disabled={
                          !!actionLoading
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionLoading ===
                        `delete-${membership._id}` ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <X size={14} />
                        )}

                        Delete

                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* ============================================================
          DETAILS MODAL
      ============================================================ */}

      {selectedMembership && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedMembership(
                null
              );
            }
          }}
        >

          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-[#101c4d]/10 px-6 py-5">

              <div>

                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Membership Application
                </p>

                <h2 className="mt-1 font-serif text-xl text-[#101c4d]">
                  {selectedMembership.name}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMembership(
                    null
                  )
                }
                className="rounded-md p-2 text-[#101c4d]/50 hover:bg-gray-100 hover:text-[#101c4d]"
                aria-label="Close"
              >
                <X size={18} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="space-y-7 overflow-y-auto p-6">

              {/* APPLICANT */}

              <section>

                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Applicant Information
                </p>

                <div className="grid gap-4 sm:grid-cols-2">

                  <Detail
                    label="Full Name"
                    value={
                      selectedMembership.name
                    }
                  />

                  <Detail
                    label="Email"
                    value={
                      selectedMembership.email
                    }
                  />

                  <Detail
                    label="Phone"
                    value={
                      selectedMembership.phone
                    }
                  />

                  <Detail
                    label="Applicant Type"
                    value={
                      selectedMembership.applicantType
                    }
                  />

                </div>

                <div className="mt-4">

                  <Detail
                    label="Address"
                    value={
                      selectedMembership.address
                    }
                  />

                </div>

              </section>

              {/* MEMBERSHIP */}

              <section className="border-t border-[#101c4d]/10 pt-6">

                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Membership
                </p>

                <div className="grid gap-4 sm:grid-cols-3">

                  <Detail
                    label="Membership Type"
                    value={
                      selectedMembership.membershipType
                    }
                  />

                  <Detail
                    label="Duration"
                    value={
                      selectedMembership.membershipDuration
                    }
                  />

                  <Detail
                    label="Amount"
                    value={
                      selectedMembership.amount
                        ? `₹${selectedMembership.amount}`
                        : "—"
                    }
                  />

                </div>

              </section>

              {/* STATUS */}

              <section className="border-t border-[#101c4d]/10 pt-6">

                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Application Status
                </p>

                <div className="rounded-lg border border-[#101c4d]/10 bg-[#f8f9fc] p-4">

                  <div className="flex flex-wrap items-center gap-3">

                    <span
                      className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide ${
                        STATUS_STYLES[
                          selectedMembership.status
                        ] ||
                        "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {STATUS_LABELS[
                        selectedMembership.status
                      ] ||
                        selectedMembership.status}
                    </span>

                    {selectedMembership.memberId && (
                      <span className="font-mono text-xs text-[#101c4d]/60">
                        Member ID:{" "}
                        <strong className="text-[#101c4d]">
                          {
                            selectedMembership.memberId
                          }
                        </strong>
                      </span>
                    )}

                  </div>

                </div>

              </section>

              {/* STOP REASON */}

              {selectedMembership.stopReason && (
                <section className="border-t border-[#101c4d]/10 pt-6">

                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                    Stop Reason
                  </p>

                  <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {
                      selectedMembership.stopReason
                    }
                  </div>

                </section>
              )}

              {/* RECEIPT */}

              {selectedMembership.receipt
                ?.url && (

                <section className="border-t border-[#101c4d]/10 pt-6">

                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                    Payment Receipt
                  </p>

                  <a
                    href={
                      selectedMembership
                        .receipt.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-[#101c4d] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#17275f]"
                  >
                    <FileText size={14} />
                    View Receipt
                  </a>

                  {selectedMembership
                    .receipt.fileName && (
                    <p className="mt-2 text-xs text-[#101c4d]/50">
                      {
                        selectedMembership
                          .receipt.fileName
                      }
                    </p>
                  )}

                </section>

              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-wrap justify-end gap-2 border-t border-[#101c4d]/10 bg-white px-6 py-4">

              {renderActions(
                selectedMembership
              )}

              {selectedMembership.status ===
                "member" && (
                <button
                  type="button"
                  onClick={() =>
                    handleStopMembership(
                      selectedMembership
                    )
                  }
                  disabled={
                    !!actionLoading
                  }
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Ban size={14} />
                  Stop Membership
                </button>
              )}

              {selectedMembership.status ===
                "stopped" && (
                <button
                  type="button"
                  onClick={() =>
                    handleReactivate(
                      selectedMembership
                    )
                  }
                  disabled={
                    !!actionLoading
                  }
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  Reactivate
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    selectedMembership
                  )
                }
                disabled={
                  !!actionLoading
                }
                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <X size={14} />
                Delete
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedMembership(
                    null
                  )
                }
                className="rounded-md border border-[#101c4d]/15 px-4 py-2.5 text-xs font-medium text-[#101c4d] hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

/*
|--------------------------------------------------------------------------
| DETAIL COMPONENT
|--------------------------------------------------------------------------
*/

const Detail = ({
  label,
  value,
}) => (
  <div>

    <p className="font-mono text-[9px] uppercase tracking-wider text-[#101c4d]/40">
      {label}
    </p>

    <p className="mt-1 whitespace-pre-line break-words text-sm text-[#101c4d]">
      {value || "—"}
    </p>

  </div>
);

/*
|--------------------------------------------------------------------------
| BANK INPUT
|--------------------------------------------------------------------------
*/

const BankInput = ({
  label,
  value,
  onChange,
}) => (
  <label className="block">

    <span className="font-mono text-[9px] uppercase tracking-wider text-[#101c4d]/40">
      {label}
    </span>

    <input
      type="text"
      value={value || ""}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="mt-2 w-full rounded-md border border-[#101c4d]/15 bg-white px-3 py-2.5 text-sm text-[#101c4d] outline-none focus:border-[#101c4d]"
    />

  </label>
);

export default MembershipManager;