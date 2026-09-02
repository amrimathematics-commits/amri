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
  Ban,
  Trash2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";



const STATUS_LABELS = {
  submitted: "New Request",

  bank_details_sent: "Bank Details Sent",

  payment_submitted: "Payment Submitted",

  payment_received: "Payment Received",

  member: "Active Member",

  stopped: "Membership Stopped",

  expired: "Membership Expired",
};

/*
|--------------------------------------------------------------------------
| STATUS STYLES
|--------------------------------------------------------------------------
*/

const STATUS_STYLES = {
  submitted:
    "bg-blue-50 text-blue-700 border-blue-100",

  bank_details_sent:
    "bg-amber-50 text-amber-700 border-amber-100",

  payment_submitted:
    "bg-purple-50 text-purple-700 border-purple-100",

  payment_received:
    "bg-green-50 text-green-700 border-green-100",

  member:
    "bg-[#101c4d]/10 text-[#101c4d] border-[#101c4d]/10",

  stopped:
    "bg-red-50 text-red-700 border-red-100",

  expired:
    "bg-gray-100 text-gray-700 border-gray-200",
};

/*
|--------------------------------------------------------------------------
| EMPTY BANK DETAILS
|--------------------------------------------------------------------------
*/

const emptyBankDetails = {
  accountName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  branch: "",
  upiId: "",
  paymentInstructions: "",
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString();
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString();
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

const MembershipManager = () => {
  const [memberships, setMemberships] = useState([]);

  const [bankDetails, setBankDetails] =
    useState(emptyBankDetails);

  const [pendingRenewals, setPendingRenewals] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [bankLoading, setBankLoading] =
    useState(true);

  const [renewalLoading, setRenewalLoading] =
    useState(false);

  const [savingBank, setSavingBank] =
    useState(false);

  const [error, setError] = useState("");

  const [bankError, setBankError] =
    useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedMembership, setSelectedMembership] =
    useState(null);

  const [actionLoading, setActionLoading] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | AUTH HEADERS
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | UPDATE MEMBERSHIP IN STATE
  |--------------------------------------------------------------------------
  */

  const updateMembership = (
    updatedMembership
  ) => {
    if (!updatedMembership?._id) {
      return;
    }

    setMemberships(
      (current) =>
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
  | LOAD MEMBERSHIPS
  |--------------------------------------------------------------------------
  */

  const loadMemberships = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/membership");

      const result = response.data;

      setMemberships(
        result?.data || []
      );
    } catch (err) {
      console.error(
        "Load memberships failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load membership applications."
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

      const response = await api.get(
        "/membership/bank-details"
      );

      const result = response.data;

      if (result?.data) {
        setBankDetails({
          accountName:
            result.data.accountName ||
            "",

          bankName:
            result.data.bankName ||
            "",

          accountNumber:
            result.data.accountNumber ||
            "",

          ifscCode:
            result.data.ifscCode ||
            result.data.ifsc ||
            "",

          branch:
            result.data.branch ||
            "",

          upiId:
            result.data.upiId ||
            result.data.upi ||
            "",

          paymentInstructions:
            result.data
              .paymentInstructions ||
            "",
        });
      }
    } catch (err) {
      console.error(
        "Load bank details failed:",
        err
      );

      setBankError(
        err.message ||
          "Unable to load bank details."
      );
    } finally {
      setBankLoading(false);
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

        const response = await api.get(
          "/admin/membership-renewals/pending"
        );

        const result = response.data;

        setPendingRenewals(
          result?.data || []
        );
      } catch (err) {
        console.error(
          "Load pending renewals failed:",
          err
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | Renewal failure must NOT crash the whole
        | membership page.
        |--------------------------------------------------------------------------
        */

        setPendingRenewals([]);

        /*
        |--------------------------------------------------------------------------
        | Ignore normal 404 when renewal route is not
        | available yet.
        |--------------------------------------------------------------------------
        */

        if (err.response?.status !== 404) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load pending renewals."
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
  | SAVE BANK DETAILS
  |--------------------------------------------------------------------------
  */

  const handleBankChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setBankDetails(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setBankError("");
    setSuccess("");
  };

  const handleSaveBankDetails =
    async (e) => {
      e.preventDefault();

      try {
        setSavingBank(true);
        setBankError("");
        setError("");
        setSuccess("");

        const response = await api.put(
          "/membership/bank-details",
          bankDetails
        );

        const result = response.data;

        if (result?.data) {
          setBankDetails({
            accountName:
              result.data.accountName ||
              "",

            bankName:
              result.data.bankName ||
              "",

            accountNumber:
              result.data.accountNumber ||
              "",

            ifscCode:
              result.data.ifscCode ||
              result.data.ifsc ||
              "",

            branch:
              result.data.branch ||
              "",

            upiId:
              result.data.upiId ||
              result.data.upi ||
              "",

            paymentInstructions:
              result.data
                .paymentInstructions ||
              "",
          });
        }

        setSuccess(
          "Bank details saved successfully."
        );
      } catch (err) {
        console.error(
          "Save bank details failed:",
          err
        );

        setBankError(
          err.response?.data?.message ||
            err.message ||
            "Unable to save bank details."
        );
      } finally {
        setSavingBank(false);
      }
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
          `Send bank details to ${membership.name}?`
        );

      if (!confirmed) return;

      try {
        setActionLoading(
          `bank-${membership._id}`
        );

        setError("");
        setSuccess("");

        const response = await api.post(
          `/membership/${membership._id}/send-bank-details`
        );

        const result = response.data;

        updateMembership(
          result.data
        );

        setSuccess(
          `Bank details sent to ${membership.email}.`
        );
      } catch (err) {
        console.error(
          "Send bank details failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to send bank details."
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
      if (
        membership.status !==
        "payment_submitted"
      ) {
        setError(
          "Payment can only be verified after the applicant submits a receipt."
        );

        return;
      }

      if (
        !membership.receipt?.url
      ) {
        setError(
          "A payment receipt is required before confirming payment."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Verify payment received from ${membership.name}?`
        );

      if (!confirmed) return;

      try {
        setActionLoading(
          `payment-${membership._id}`
        );

        setError("");
        setSuccess("");

        const response = await api.patch(
          `/membership/${membership._id}/payment-received`
        );

        const result = response.data;

        updateMembership(
          result.data
        );

        setSuccess(
          "Payment verified successfully."
        );
      } catch (err) {
        console.error(
          "Payment verification failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to verify payment."
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

      if (!confirmed) return;

      try {
        setActionLoading(
          `member-${membership._id}`
        );

        setError("");
        setSuccess("");

        const response = await api.patch(
          `/membership/${membership._id}/make-member`
        );

        const result = response.data;

        updateMembership(
          result.data
        );

        setSuccess(
          `${membership.name} is now an AMRI member.`
        );
      } catch (err) {
        console.error(
          "Make member failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to activate membership."
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | DELETE MEMBERSHIP REQUEST
  |--------------------------------------------------------------------------
  */

  const handleDeleteMembership =
    async (membership) => {
      /*
      |--------------------------------------------------------------------------
      | NEVER DELETE ACTIVE MEMBER
      |--------------------------------------------------------------------------
      */

      if (
        membership.isMember ||
        membership.status === "member"
      ) {
        setError(
          "Active members cannot be deleted. Stop the membership first."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | CONFIRMATION
      |--------------------------------------------------------------------------
      */

      const confirmed =
        window.confirm(
          `Delete ${membership.name}'s membership record permanently?\n\nThis action cannot be undone.`
        );

      if (!confirmed) return;

      try {
        setActionLoading(
          `delete-${membership._id}`
        );

        setError("");
        setSuccess("");

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

        if (
          selectedMembership?._id ===
          membership._id
        ) {
          setSelectedMembership(null);
        }

        setSuccess(
          `${membership.name}'s membership record was deleted successfully.`
        );
      } catch (err) {
        console.error(
          "Delete membership failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to delete membership."
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
      if (
        !membership.isMember &&
        membership.status !== "member"
      ) {
        setError(
          "This applicant does not have an active membership."
        );

        return;
      }

      const reason =
        window.prompt(
          `Why are you stopping ${membership.name}'s membership?`,
          "Membership stopped by administrator."
        );

      if (reason === null) {
        return;
      }

      const cleanReason =
        reason.trim() ||
        "Membership stopped by administrator.";

      const confirmed =
        window.confirm(
          `Stop ${membership.name}'s AMRI membership?\n\nA membership stopped email will be sent to the member.`
        );

      if (!confirmed) return;

      try {
        setActionLoading(
          `stop-${membership._id}`
        );

        setError("");
        setSuccess("");

        const response = await api.patch(
          `/membership/${membership._id}/stop`,
          { reason: cleanReason }
        );

        const result = response.data;

        updateMembership(
          result.data
        );

        setSuccess(
          `${membership.name}'s membership has been stopped and the member has been notified by email.`
        );
      } catch (err) {
        console.error(
          "Stop membership failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to stop membership."
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

  const handleReactivateMembership =
    async (membership) => {
      const confirmed =
        window.confirm(
          `Reactivate ${membership.name}'s membership?\n\nThis will restore the membership using the existing membership period.`
        );

      if (!confirmed) return;

      try {
        setActionLoading(
          `reactivate-${membership._id}`
        );

        setError("");
        setSuccess("");

        const response = await api.patch(
          `/membership/${membership._id}/reactivate`
        );

        const result = response.data;

        updateMembership(
          result.data
        );

        setSuccess(
          `${membership.name}'s membership has been reactivated.`
        );
      } catch (err) {
        console.error(
          "Reactivate membership failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to reactivate membership."
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
          `Approve the ₹500 renewal payment from ${membership.name}?`
        );

      if (!confirmed) return;

      try {
        setActionLoading(
          `approve-renewal-${membership._id}`
        );

        setError("");
        setSuccess("");

        const response = await api.post(
          `/admin/membership-renewals/${membership._id}/approve`
        );

        const result = response.data;

        setPendingRenewals(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                membership._id
            )
        );

        if (result.data) {
          updateMembership(
            result.data
          );
        } else {
          await loadMemberships();
        }

        setSuccess(
          `Renewal approved for ${membership.name}.`
        );
      } catch (err) {
        console.error(
          "Approve renewal failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to approve renewal."
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
      const confirmed =
        window.confirm(
          `Reject the renewal payment submitted by ${membership.name}?`
        );

      if (!confirmed) return;

      try {
        setActionLoading(
          `reject-renewal-${membership._id}`
        );

        setError("");
        setSuccess("");

        const response = await api.post(
          `/admin/membership-renewals/${membership._id}/reject`
        );

        const result = response.data;

        setPendingRenewals(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                membership._id
            )
        );

        if (result.data) {
          updateMembership(
            result.data
          );
        }

        setSuccess(
          `Renewal payment from ${membership.name} was rejected.`
        );
      } catch (err) {
        console.error(
          "Reject renewal failed:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to reject renewal."
        );
      } finally {
        setActionLoading(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredMemberships =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

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
              .includes(query) ||
            item.renewalId
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            item.status ===
              statusFilter;

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
  | COUNTS
  |--------------------------------------------------------------------------
  */

  const counts = useMemo(
    () => ({
      all:
        memberships.length,

      submitted:
        memberships.filter(
          (item) =>
            item.status ===
            "submitted"
        ).length,

      bank_details_sent:
        memberships.filter(
          (item) =>
            item.status ===
            "bank_details_sent"
        ).length,

      payment_submitted:
        memberships.filter(
          (item) =>
            item.status ===
            "payment_submitted"
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
            item.status ===
            "member"
        ).length,

      stopped:
        memberships.filter(
          (item) =>
            item.status ===
            "stopped"
        ).length,

      expired:
        memberships.filter(
          (item) =>
            item.status ===
            "expired"
        ).length,
    }),
    [memberships]
  );

  /*
  |--------------------------------------------------------------------------
  | ACTION BUTTONS
  |--------------------------------------------------------------------------
  */

  const renderAction =
    (membership) => {
      const bankLoading =
        actionLoading ===
        `bank-${membership._id}`;

      const paymentLoading =
        actionLoading ===
        `payment-${membership._id}`;

      const memberLoading =
        actionLoading ===
        `member-${membership._id}`;

      const deleteLoading =
        actionLoading ===
        `delete-${membership._id}`;

      const stopLoading =
        actionLoading ===
        `stop-${membership._id}`;

      const reactivateLoading =
        actionLoading ===
        `reactivate-${membership._id}`;

      /*
      |--------------------------------------------------------------------------
      | NEW REQUEST
      |--------------------------------------------------------------------------
      */

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
              disabled={
                !!actionLoading
              }
              className="inline-flex items-center gap-2 rounded-md bg-[#f2a223] px-4 py-2.5 text-xs font-medium text-[#101c4d] hover:bg-[#e49a1e] disabled:opacity-50"
            >
              {bankLoading ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Mail size={14} />
              )}

              {bankLoading
                ? "Sending..."
                : "Send Bank Details"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleDeleteMembership(
                  membership
                )
              }
              disabled={
                !!actionLoading
              }
              className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {deleteLoading ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={14} />
              )}

              {deleteLoading
                ? "Deleting..."
                : "Delete Request"}
            </button>

          </div>
        );
      }

      /*
      |--------------------------------------------------------------------------
      | BANK DETAILS SENT
      |--------------------------------------------------------------------------
      */

      if (
        membership.status ===
        "bank_details_sent"
      ) {
        return (
          <div className="flex flex-wrap gap-2">

            <span className="inline-flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700">
              <Clock3 size={14} />
              Waiting for Payment
            </span>

            <button
              type="button"
              onClick={() =>
                handleDeleteMembership(
                  membership
                )
              }
              disabled={
                !!actionLoading
              }
              className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {deleteLoading ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={14} />
              )}

              {deleteLoading
                ? "Deleting..."
                : "Delete Request"}
            </button>

          </div>
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PAYMENT SUBMITTED
      |--------------------------------------------------------------------------
      */

      if (
        membership.status ===
        "payment_submitted"
      ) {
        return (
          <button
            type="button"
            onClick={() =>
              handlePaymentReceived(
                membership
              )
            }
            disabled={
              !!actionLoading
            }
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {paymentLoading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <CreditCard size={14} />
            )}

            {paymentLoading
              ? "Verifying..."
              : "Verify Payment"}
          </button>
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PAYMENT RECEIVED
      |--------------------------------------------------------------------------
      */

      if (
        membership.status ===
        "payment_received"
      ) {
        return (
          <button
            type="button"
            onClick={() =>
              handleMakeMember(
                membership
              )
            }
            disabled={
              !!actionLoading
            }
            className="inline-flex items-center gap-2 rounded-md bg-[#101c4d] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#17275f] disabled:opacity-50"
          >
            {memberLoading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <UserCheck size={14} />
            )}

            {memberLoading
              ? "Activating..."
              : "Make Member"}
          </button>
        );
      }

      /*
      |--------------------------------------------------------------------------
      | ACTIVE MEMBER
      |--------------------------------------------------------------------------
      */

      if (
        membership.isMember &&
        membership.status ===
          "member"
      ) {
        return (
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
            className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {stopLoading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Ban size={14} />
            )}

            {stopLoading
              ? "Stopping..."
              : "Stop Membership"}
          </button>
        );
      }

      /*
      |--------------------------------------------------------------------------
      | STOPPED / EXPIRED
      |--------------------------------------------------------------------------
      */

      if (
        membership.status ===
          "stopped" ||
        membership.status ===
          "expired"
      ) {
        return (
          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                handleReactivateMembership(
                  membership
                )
              }
              disabled={
                !!actionLoading
              }
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {reactivateLoading ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <RotateCcw
                  size={14}
                />
              )}

              {reactivateLoading
                ? "Reactivating..."
                : "Reactivate"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleDeleteMembership(
                  membership
                )
              }
              disabled={
                !!actionLoading
              }
              className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {deleteLoading ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={14} />
              )}

              {deleteLoading
                ? "Deleting..."
                : "Delete Member"}
            </button>

          </div>
        );
      }

      return null;
    };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-[#101c4d]/60">
        <Loader2
          size={17}
          className="animate-spin"
        />

        Loading memberships...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div>

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>

          <h1 className="font-serif text-2xl text-[#101c4d]">
            Membership
          </h1>

          <p className="mt-1 text-sm text-[#101c4d]/60">
            Manage applications, payments,
            members and renewals.
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            loadMemberships();
            loadBankDetails();
            loadPendingRenewals();
          }}
          className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-[#101c4d]/15 px-4 py-2.5 text-xs font-medium text-[#101c4d] hover:bg-white"
        >
          <RefreshCw size={14} />
          Refresh
        </button>

      </div>

      {/* MESSAGES */}

      {(error || success) && (
        <div className="mb-5 space-y-2">

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

        </div>
      )}

      {bankError && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {bankError}
        </div>
      )}

      {/* SUMMARY */}

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

        <StatCard
          label="All"
          value={counts.all}
        />

        <StatCard
          label="New"
          value={counts.submitted}
        />

        <StatCard
          label="Payment Review"
          value={
            counts.payment_submitted
          }
        />

        <StatCard
          label="Active Members"
          value={counts.member}
        />

        <StatCard
          label="Pending Renewals"
          value={
            pendingRenewals.length
          }
        />

      </section>

      {/* PENDING RENEWALS */}

      <section className="mb-8">

        <div className="mb-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-100 text-green-700">
              <RotateCcw size={17} />
            </div>

            <div>

              <h2 className="font-serif text-lg text-[#101c4d]">
                Pending Renewals
              </h2>

              <p className="mt-0.5 text-xs text-[#101c4d]/50">
                Review renewal payments submitted by existing members.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              loadPendingRenewals
            }
            disabled={
              renewalLoading
            }
            className="inline-flex items-center gap-2 rounded-md border border-[#101c4d]/15 px-3 py-2 text-xs font-medium text-[#101c4d] hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                renewalLoading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {renewalLoading ? (

          <div className="rounded-lg border border-[#101c4d]/10 bg-white p-8 text-center">

            <Loader2
              size={20}
              className="mx-auto animate-spin text-[#101c4d]/50"
            />

            <p className="mt-3 text-sm text-[#101c4d]/50">
              Loading pending renewals...
            </p>

          </div>

        ) : pendingRenewals.length ===
          0 ? (

          <div className="rounded-lg border border-[#101c4d]/10 bg-white p-8 text-center">

            <CheckCircle2
              size={24}
              className="mx-auto text-green-500"
            />

            <p className="mt-3 text-sm font-medium text-[#101c4d]">
              No pending renewals
            </p>

            <p className="mt-1 text-xs text-[#101c4d]/50">
              Renewal payments submitted by members will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

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
                    key={
                      renewal._id
                    }
                    className="rounded-lg border border-green-200 bg-white p-5"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="font-serif text-lg text-[#101c4d]">
                            {
                              renewal.name
                            }
                          </h3>

                          <span className="rounded-full border border-green-100 bg-green-50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide text-green-700">
                            Renewal Payment
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-[#101c4d]/60">
                          {
                            renewal.email
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#101c4d]/50">

                          <span>
                            Member ID:{" "}
                            {
                              renewal.memberId ||
                              "—"
                            }
                          </span>

                          <span>
                            Renewal ID:{" "}
                            {
                              renewal.renewalId ||
                              "—"
                            }
                          </span>

                          <span>
                            Amount: ₹500
                          </span>

                          <span>
                            Submitted:{" "}
                            {
                              formatDateTime(
                                renewal.renewalPaymentSubmittedAt
                              )
                            }
                          </span>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        {renewal.receipt?.url && (
                          <a
                            href={
                              renewal
                                .receipt
                                .url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-[#101c4d]/15 px-4 py-2.5 text-xs font-medium text-[#101c4d] hover:bg-gray-50"
                          >
                            <FileText
                              size={14}
                            />
                            View Receipt
                          </a>
                        )}

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
                          className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {rejectLoading ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <X size={14} />
                          )}

                          Reject
                        </button>

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
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2
                              size={14}
                            />
                          )}

                          Approve Renewal
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

      {/* BANK DETAILS */}

      <section className="mb-8">

        <div className="mb-4 flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f2a223]/15 text-[#101c4d]">
            <Landmark size={18} />
          </div>

          <div>

            <h2 className="font-serif text-lg text-[#101c4d]">
              Payment Bank Details
            </h2>

            <p className="text-xs text-[#101c4d]/50">
              These details are sent to applicants when payment instructions are issued.
            </p>

          </div>

        </div>

        <div className="rounded-lg border border-[#101c4d]/10 bg-white p-6">

          {bankLoading ? (

            <div className="flex items-center gap-2 text-sm text-[#101c4d]/50">
              <Loader2
                size={16}
                className="animate-spin"
              />
              Loading bank details...
            </div>

          ) : (

            <form
              onSubmit={
                handleSaveBankDetails
              }
              className="space-y-5"
            >

              <div className="grid gap-5 md:grid-cols-2">

                <BankInput
                  label="Account Name"
                  name="accountName"
                  value={
                    bankDetails.accountName
                  }
                  onChange={
                    handleBankChange
                  }
                  required
                />

                <BankInput
                  label="Bank Name"
                  name="bankName"
                  value={
                    bankDetails.bankName
                  }
                  onChange={
                    handleBankChange
                  }
                  required
                />

                <BankInput
                  label="Account Number"
                  name="accountNumber"
                  value={
                    bankDetails.accountNumber
                  }
                  onChange={
                    handleBankChange
                  }
                  required
                />

                <BankInput
                  label="IFSC Code"
                  name="ifscCode"
                  value={
                    bankDetails.ifscCode
                  }
                  onChange={
                    handleBankChange
                  }
                  required
                />

                <BankInput
                  label="Branch"
                  name="branch"
                  value={
                    bankDetails.branch
                  }
                  onChange={
                    handleBankChange
                  }
                  required
                />

                <BankInput
                  label="UPI ID"
                  name="upiId"
                  value={
                    bankDetails.upiId
                  }
                  onChange={
                    handleBankChange
                  }
                />

              </div>

              <div>

                <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#101c4d]/50">
                  Payment Instructions
                </label>

                <textarea
                  name="paymentInstructions"
                  value={
                    bankDetails.paymentInstructions
                  }
                  onChange={
                    handleBankChange
                  }
                  rows={4}
                  placeholder="Please mention any payment instructions..."
                  className="w-full rounded-md border border-[#101c4d]/15 bg-[#f8f9fc] px-4 py-3 text-sm text-[#101c4d] outline-none transition-colors focus:border-[#101c4d]"
                />

              </div>

              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={
                    savingBank
                  }
                  className="inline-flex items-center gap-2 rounded-md bg-[#101c4d] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#17275f] disabled:opacity-50"
                >
                  {savingBank ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={14} />
                  )}

                  {savingBank
                    ? "Saving..."
                    : "Save Bank Details"}
                </button>

              </div>

            </form>

          )}

        </div>

      </section>

      {/* MEMBERSHIP APPLICATIONS */}

      <section>

        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="font-serif text-lg text-[#101c4d]">
              Membership Applications
            </h2>

            <p className="mt-1 text-xs text-[#101c4d]/50">
              Review applications, payments, members and membership lifecycle.
            </p>

          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

            <div className="relative">

              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#101c4d]/35"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search applications..."
                className="w-full rounded-md border border-[#101c4d]/15 bg-white py-2.5 pl-9 pr-4 text-xs outline-none focus:border-[#101c4d] sm:w-64"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-md border border-[#101c4d]/15 bg-white px-4 py-2.5 text-xs text-[#101c4d] outline-none focus:border-[#101c4d]"
            >

              <option value="all">
                All ({counts.all})
              </option>

              <option value="submitted">
                New Requests ({counts.submitted})
              </option>

              <option value="bank_details_sent">
                Bank Details Sent ({counts.bank_details_sent})
              </option>

              <option value="payment_submitted">
                Payment Submitted ({counts.payment_submitted})
              </option>

              <option value="payment_received">
                Payment Received ({counts.payment_received})
              </option>

              <option value="member">
                Active Members ({counts.member})
              </option>

              <option value="stopped">
                Stopped ({counts.stopped})
              </option>

              <option value="expired">
                Expired ({counts.expired})
              </option>

            </select>

          </div>

        </div>

        <div className="overflow-hidden rounded-lg border border-[#101c4d]/10 bg-white">

          {filteredMemberships.length ===
          0 ? (

            <div className="px-6 py-14 text-center">

              <FileText
                size={30}
                className="mx-auto mb-3 text-[#101c4d]/20"
              />

              <p className="font-serif text-lg text-[#101c4d]">
                No membership applications
              </p>

              <p className="mt-1 text-sm text-[#101c4d]/50">
                New applications will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-[#101c4d]/10">

              {filteredMemberships.map(
                (membership) => (

                  <div
                    key={
                      membership._id
                    }
                    className="p-5"
                  >

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="font-serif text-lg text-[#101c4d]">
                            {
                              membership.name
                            }
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide ${
                              STATUS_STYLES[
                                membership.status
                              ] ||
                              "bg-gray-50 text-gray-600"
                            }`}
                          >
                            {
                              STATUS_LABELS[
                                membership.status
                              ] ||
                              membership.status
                            }
                          </span>

                        </div>

                        <p className="mt-1 break-all text-sm text-[#101c4d]/60">
                          {
                            membership.email
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#101c4d]/50">

                          <span>
                            {
                              membership.applicantType
                            }
                          </span>

                          <span>
                            {
                              membership.membershipType
                            }
                          </span>

                          <span className="font-medium text-[#101c4d]/70">
                            ₹
                            {
                              membership.amount
                            }
                          </span>

                          {membership.memberId && (
                            <span>
                              ID:{" "}
                              {
                                membership.memberId
                              }
                            </span>
                          )}

                          {membership.renewalId && (
                            <span>
                              Renewal ID:{" "}
                              {
                                membership.renewalId
                              }
                            </span>
                          )}

                          {membership.membershipExpiryDate && (
                            <span>
                              Expires:{" "}
                              {formatDate(
                                membership.membershipExpiryDate
                              )}
                            </span>
                          )}

                          {membership.receipt?.url && (
                            <span className="inline-flex items-center gap-1 text-purple-600">
                              <FileText
                                size={12}
                              />
                              Receipt Uploaded
                            </span>
                          )}

                        </div>

                      </div>

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

                        {renderAction(
                          membership
                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </section>

      {/* APPLICATION MODAL */}

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

          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-[#101c4d]/10 px-6 py-5">

              <div>

                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Membership Application
                </p>

                <h2 className="mt-1 font-serif text-xl text-[#101c4d]">
                  {
                    selectedMembership.name
                  }
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMembership(
                    null
                  )
                }
                className="rounded-md p-2 text-[#101c4d]/50 hover:bg-gray-100"
              >
                <X size={18} />
              </button>

            </div>

            {/* BODY */}

            <div className="space-y-7 overflow-y-auto p-6">

              {/* APPLICANT */}

              <section>

                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Applicant Information
                </p>

                <div className="grid gap-5 sm:grid-cols-2">

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

                <div className="mt-5">

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

                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Membership
                </p>

                <div className="grid gap-5 sm:grid-cols-3">

                  <Detail
                    label="Type"
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
                    value={`₹${selectedMembership.amount}`}
                  />

                </div>

              </section>

              {/* STATUS */}

              <section className="border-t border-[#101c4d]/10 pt-6">

                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Status
                </p>

                <div className="rounded-lg border border-[#101c4d]/10 bg-[#f8f9fc] p-4">

                  <span
                    className={`inline-flex rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide ${
                      STATUS_STYLES[
                        selectedMembership.status
                      ] ||
                      "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {
                      STATUS_LABELS[
                        selectedMembership.status
                      ] ||
                      selectedMembership.status
                    }
                  </span>

                  {selectedMembership.memberId && (
                    <p className="mt-3 text-sm text-[#101c4d]/60">
                      Member ID:{" "}
                      <strong className="text-[#101c4d]">
                        {
                          selectedMembership.memberId
                        }
                      </strong>
                    </p>
                  )}

                </div>

              </section>

              {/* LIFECYCLE */}

              {(selectedMembership.membershipStartDate ||
                selectedMembership.membershipExpiryDate ||
                selectedMembership.renewalId) && (

                <section className="border-t border-[#101c4d]/10 pt-6">

                  <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                    Membership Lifecycle
                  </p>

                  <div className="grid gap-5 sm:grid-cols-2">

                    <Detail
                      label="Membership Start"
                      value={formatDate(
                        selectedMembership.membershipStartDate
                      )}
                    />

                    <Detail
                      label="Membership Expiry"
                      value={formatDate(
                        selectedMembership.membershipExpiryDate
                      )}
                    />

                    <Detail
                      label="Renewal ID"
                      value={
                        selectedMembership.renewalId
                      }
                    />

                    <Detail
                      label="Membership Since"
                      value={formatDate(
                        selectedMembership.becameMemberAt
                      )}
                    />

                  </div>

                </section>

              )}

              {/* PAYMENT */}

              <section className="border-t border-[#101c4d]/10 pt-6">

                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Payment
                </p>

                <div className="grid gap-5 sm:grid-cols-2">

                  <Detail
                    label="Bank Details Sent"
                    value={
                      selectedMembership.bankDetailsSent
                        ? "Yes"
                        : "No"
                    }
                  />

                  <Detail
                    label="Payment Received"
                    value={
                      selectedMembership.paymentReceived
                        ? "Yes"
                        : "No"
                    }
                  />

                  <Detail
                    label="Payment Submitted"
                    value={
                      selectedMembership.receipt?.url
                        ? "Yes"
                        : "No"
                    }
                  />

                  <Detail
                    label="Payment Date"
                    value={formatDateTime(
                      selectedMembership.paymentReceivedAt
                    )}
                  />

                </div>

              </section>

              {/* RECEIPT */}

              {selectedMembership.receipt?.url && (

                <section className="border-t border-[#101c4d]/10 pt-6">

                  <div className="mb-4 flex items-center justify-between gap-4">

                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                      Payment Receipt
                    </p>

                    {selectedMembership.status ===
                      "payment_submitted" && (
                      <span className="rounded-full border border-purple-100 bg-purple-50 px-2.5 py-1 text-[10px] font-medium text-purple-700">
                        Awaiting Verification
                      </span>
                    )}

                  </div>

                  <div className="rounded-lg border border-[#101c4d]/10 bg-[#f8f9fc] p-4">

                    <p className="mb-4 text-sm text-[#101c4d]/60">
                      The applicant has uploaded a payment receipt.
                    </p>

                    <a
                      href={
                        selectedMembership.receipt.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-[#101c4d] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#17275f]"
                    >
                      <FileText size={14} />
                      View Receipt
                    </a>

                  </div>

                </section>

              )}

              {/* ACTIVE */}

              {selectedMembership.isMember && (

                <section className="rounded-lg border border-green-200 bg-green-50 p-4">

                  <div className="flex items-start gap-3">

                    <CheckCircle2
                      size={20}
                      className="mt-0.5 text-green-600"
                    />

                    <div>

                      <p className="font-medium text-green-800">
                        Active AMRI Member
                      </p>

                      {selectedMembership.memberId && (
                        <p className="mt-1 text-sm text-green-700">
                          Member ID:{" "}
                          <strong>
                            {
                              selectedMembership.memberId
                            }
                          </strong>
                        </p>
                      )}

                      {selectedMembership.membershipExpiryDate && (
                        <p className="mt-1 text-sm text-green-700">
                          Valid until:{" "}
                          <strong>
                            {formatDate(
                              selectedMembership.membershipExpiryDate
                            )}
                          </strong>
                        </p>
                      )}

                    </div>

                  </div>

                </section>

              )}

              {/* STOPPED */}

              {selectedMembership.status ===
                "stopped" && (

                <section className="rounded-lg border border-red-200 bg-red-50 p-4">

                  <div className="flex items-start gap-3">

                    <Ban
                      size={20}
                      className="mt-0.5 text-red-600"
                    />

                    <div>

                      <p className="font-medium text-red-800">
                        Membership Stopped
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        Stopped on:{" "}
                        <strong>
                          {formatDateTime(
                            selectedMembership.membershipStoppedAt
                          )}
                        </strong>
                      </p>

                      {selectedMembership.membershipStoppedReason && (
                        <p className="mt-2 text-sm text-red-700">
                          Reason:{" "}
                          {
                            selectedMembership.membershipStoppedReason
                          }
                        </p>
                      )}

                    </div>

                  </div>

                </section>

              )}

              {/* EXPIRED */}

              {selectedMembership.status ===
                "expired" && (

                <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <div className="flex items-start gap-3">

                    <ShieldCheck
                      size={20}
                      className="mt-0.5 text-gray-600"
                    />

                    <div>

                      <p className="font-medium text-gray-800">
                        Membership Expired
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Expired on:{" "}
                        <strong>
                          {formatDate(
                            selectedMembership.membershipExpiryDate
                          )}
                        </strong>
                      </p>

                    </div>

                  </div>

                </section>

              )}

            </div>

            {/* FOOTER */}

            <div className="flex flex-wrap justify-end gap-2 border-t border-[#101c4d]/10 bg-white px-6 py-4">

              {renderAction(
                selectedMembership
              )}

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
| STAT CARD
|--------------------------------------------------------------------------
*/

const StatCard = ({
  label,
  value,
}) => (
  <div className="rounded-lg border border-[#101c4d]/10 bg-white p-4">

    <p className="font-mono text-[9px] uppercase tracking-wider text-[#101c4d]/40">
      {label}
    </p>

    <p className="mt-2 font-serif text-2xl text-[#101c4d]">
      {value}
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
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
}) => (
  <div>

    <label
      htmlFor={`bank-${name}`}
      className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#101c4d]/50"
    >
      {label}

      {required && (
        <span className="text-red-500">
          {" "}*
        </span>
      )}

    </label>

    <input
      id={`bank-${name}`}
      name={name}
      type="text"
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-md border border-[#101c4d]/15 bg-[#f8f9fc] px-4 py-3 text-sm text-[#101c4d] outline-none transition-colors focus:border-[#101c4d]"
    />

  </div>
);

/*
|--------------------------------------------------------------------------
| DETAIL
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

export default MembershipManager;