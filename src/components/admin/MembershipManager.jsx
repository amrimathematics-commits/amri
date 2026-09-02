import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  Mail,
  Search,
  UserCheck,
  X,
} from "lucide-react";

const STATUS_LABELS = {
  submitted: "New Request",
  bank_details_sent: "Bank Details Sent",
  payment_received: "Payment Received",
  member: "Member",
};

const STATUS_STYLES = {
  submitted: "bg-blue-50 text-blue-700 border-blue-100",
  bank_details_sent: "bg-amber-50 text-amber-700 border-amber-100",
  payment_received: "bg-green-50 text-green-700 border-green-100",
  member: "bg-[#101c4d]/10 text-[#101c4d] border-[#101c4d]/10",
};

const MembershipManager = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMembership, setSelectedMembership] =
    useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [actionLoading, setActionLoading] =
    useState(null);

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD MEMBERSHIPS
  |--------------------------------------------------------------------------
  */

  const loadMemberships = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem(
        "amri_admin_token"
      );

      const response = await fetch(
        "/api/membership",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let result;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        result = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          `Server returned ${response.status}. ${
            text.slice(0, 120) || ""
          }`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to load membership applications."
        );
      }

      setMemberships(result?.data || []);
    } catch (err) {
      console.error(
        "Failed to load memberships:",
        err
      );

      setError(
        err.message ||
          "Unable to load membership applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberships();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredMemberships = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return memberships.filter((item) => {
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
    });
  }, [
    memberships,
    search,
    statusFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SEND BANK DETAILS
  |--------------------------------------------------------------------------
  */

  const handleSendBankDetails = async (
    membership
  ) => {
    const confirmed = window.confirm(
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

      const token = localStorage.getItem(
        "amri_admin_token"
      );

      const response = await fetch(
        `/api/membership/${membership._id}/send-bank-details`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to send bank details."
        );
      }

      setMemberships((current) =>
        current.map((item) =>
          item._id === membership._id
            ? {
                ...item,
                status:
                  "bank_details_sent",
                bankDetailsSent: true,
                bankDetailsSentAt:
                  new Date().toISOString(),
              }
            : item
        )
      );

      setSelectedMembership((current) =>
        current?._id === membership._id
          ? {
              ...current,
              status:
                "bank_details_sent",
              bankDetailsSent: true,
              bankDetailsSentAt:
                new Date().toISOString(),
            }
          : current
      );

      setActionSuccess(
        `Bank details sent successfully to ${membership.email}.`
      );
    } catch (err) {
      console.error(
        "Send bank details failed:",
        err
      );

      setActionError(
        err.message ||
          "Unable to send bank details."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | MARK PAYMENT RECEIVED
  |--------------------------------------------------------------------------
  */

  const handlePaymentReceived = async (
    membership
  ) => {
    const confirmed = window.confirm(
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

      const token = localStorage.getItem(
        "amri_admin_token"
      );

      const response = await fetch(
        `/api/membership/${membership._id}/payment-received`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to mark payment received."
        );
      }

      setMemberships((current) =>
        current.map((item) =>
          item._id === membership._id
            ? {
                ...item,
                status:
                  "payment_received",
                paymentReceived: true,
                paymentReceivedAt:
                  new Date().toISOString(),
              }
            : item
        )
      );

      setSelectedMembership((current) =>
        current?._id === membership._id
          ? {
              ...current,
              status:
                "payment_received",
              paymentReceived: true,
              paymentReceivedAt:
                new Date().toISOString(),
            }
          : current
      );

      setActionSuccess(
        "Payment marked as received."
      );
    } catch (err) {
      console.error(
        "Payment confirmation failed:",
        err
      );

      setActionError(
        err.message ||
          "Unable to mark payment received."
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

  const handleMakeMember = async (
    membership
  ) => {
    const confirmed = window.confirm(
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

      const token = localStorage.getItem(
        "amri_admin_token"
      );

      const response = await fetch(
        `/api/membership/${membership._id}/make-member`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to activate membership."
        );
      }

      const updated =
        result?.data || {};

      setMemberships((current) =>
        current.map((item) =>
          item._id === membership._id
            ? {
                ...item,
                ...updated,
                status: "member",
                isMember: true,
              }
            : item
        )
      );

      setSelectedMembership((current) =>
        current?._id === membership._id
          ? {
              ...current,
              ...updated,
              status: "member",
              isMember: true,
            }
          : current
      );

      setActionSuccess(
        `${membership.name} is now an AMRI member.`
      );
    } catch (err) {
      console.error(
        "Make member failed:",
        err
      );

      setActionError(
        err.message ||
          "Unable to activate membership."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS COUNTS
  |--------------------------------------------------------------------------
  */

  const counts = useMemo(() => {
    return {
      all: memberships.length,
      submitted: memberships.filter(
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
      member: memberships.filter(
        (item) =>
          item.status === "member"
      ).length,
    };
  }, [memberships]);

  /*
  |--------------------------------------------------------------------------
  | ACTION BUTTONS
  |--------------------------------------------------------------------------
  */

  const renderActions = (membership) => {
    const bankLoading =
      actionLoading ===
      `bank-${membership._id}`;

    const paymentLoading =
      actionLoading ===
      `payment-${membership._id}`;

    const memberLoading =
      actionLoading ===
      `member-${membership._id}`;

    if (
      membership.status ===
      "submitted"
    ) {
      return (
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
      );
    }

    if (
      membership.status ===
      "bank_details_sent"
    ) {
      return (
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
      );
    }

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
      );
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
        <CheckCircle2 size={14} />
        Active Member
      </span>
    );
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
        Loading membership applications...
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

      {/* HEADER */}

      <div className="mb-7">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <h1 className="font-serif text-2xl text-[#101c4d]">
              Membership
            </h1>

            <p className="mt-1 text-sm text-[#101c4d]/60">
              Manage membership applications,
              payments and active members.
            </p>
          </div>

          <button
            type="button"
            onClick={loadMemberships}
            className="self-start rounded-md border border-[#101c4d]/15 px-4 py-2.5 text-xs font-medium text-[#101c4d] hover:bg-white"
          >
            Refresh
          </button>

        </div>

      </div>


      {/* MESSAGES */}

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


      {/* STATUS SUMMARY */}

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


      {/* SEARCH */}

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


      {/* APPLICATION LIST */}

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
                          {membership.membershipType}
                        </span>

                        <span className="font-medium text-[#101c4d]/70">
                          ₹
                          {membership.amount}
                        </span>

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

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#101c4d]/10 bg-white px-6 py-5">

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


            {/* DETAILS */}

            <div className="space-y-7 p-6">

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

                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2a223]">
                  Application Status
                </p>

                <div className="rounded-lg border border-[#101c4d]/10 bg-[#f8f9fc] p-4">

                  <div className="flex flex-wrap items-center gap-3">

                    <span
                      className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide ${
                        STATUS_STYLES[
                          selectedMembership.status
                        ]
                      }`}
                    >
                      {
                        STATUS_LABELS[
                          selectedMembership.status
                        ]
                      }
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


            {/* MODAL ACTIONS */}

            <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-[#101c4d]/10 bg-white px-6 py-4">

              {renderActions(
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

export default MembershipManager;