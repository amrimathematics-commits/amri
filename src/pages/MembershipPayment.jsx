import { useState } from "react";
import {
  Search,
  Upload,
  CheckCircle2,
  Clock3,
  CreditCard,
  AlertCircle,
  FileText,
} from "lucide-react";
import PageHero from "../components/PageHero.jsx";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MembershipPayment() {
  const [applicationId, setApplicationId] = useState("");

  const [membership, setMembership] =
    useState(null);

  const [receiptFile, setReceiptFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | FIND APPLICATION
  |--------------------------------------------------------------------------
  */

  const findApplication = async (event) => {
    event.preventDefault();

    if (!applicationId.trim()) {
      setError(
        "Please enter your application ID."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setMembership(null);

    try {
      /*
       * IMPORTANT:
       * This endpoint will be connected to the backend
       * membership status endpoint.
       */

      const response = await fetch(
        `${API_URL}/api/membership/public/${applicationId.trim()}`
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Application not found."
        );
      }

      setMembership(
        data.data
      );
    } catch (err) {
      console.error(
        "Membership lookup error:",
        err
      );

      setError(
        err.message ||
          "Unable to find your application."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RECEIPT FILE
  |--------------------------------------------------------------------------
  */

  const handleReceiptChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please upload JPG, PNG, WEBP or PDF."
      );

      setReceiptFile(null);
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Receipt must be smaller than 5MB."
      );

      setReceiptFile(null);
      return;
    }

    setError("");
    setReceiptFile(file);
  };

  /*
  |--------------------------------------------------------------------------
  | UPLOAD RECEIPT
  |--------------------------------------------------------------------------
  */

  const uploadReceipt = async (
    event
  ) => {
    event.preventDefault();

    if (!membership?._id) {
      setError(
        "Application information is missing."
      );
      return;
    }

    if (!receiptFile) {
      setError(
        "Please select your payment receipt."
      );
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData =
        new FormData();

      formData.append(
        "membershipId",
        membership._id
      );

      formData.append(
        "receipt",
        receiptFile
      );

      const response =
        await fetch(
          `${API_URL}/api/membership-upload/receipt`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to upload receipt."
        );
      }

      setMessage(
        "Payment receipt submitted successfully. AMRI will verify your payment."
      );

      setReceiptFile(null);

      /*
       * Update local status immediately.
       */

      setMembership(
        (previous) => ({
          ...previous,
          status:
            "payment_submitted",
        })
      );
    } catch (err) {
      console.error(
        "Receipt upload error:",
        err
      );

      setError(
        err.message ||
          "Unable to upload payment receipt."
      );
    } finally {
      setUploading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS HELPERS
  |--------------------------------------------------------------------------
  */

  const getStatusLabel = () => {
    if (!membership) {
      return "";
    }

    switch (
      membership.status
    ) {
      case "submitted":
        return "Application Submitted";

      case "bank_details_sent":
        return "Payment Required";

      case "payment_submitted":
        return "Payment Under Review";

      case "payment_received":
        return "Payment Verified";

      case "member":
        return "Active Member";

      case "rejected":
        return "Application Rejected";

      default:
        return membership.status;
    }
  };

  const getStatusIcon = () => {
    if (
      membership?.status ===
      "payment_received" ||
      membership?.status ===
      "member"
    ) {
      return (
        <CheckCircle2
          size={28}
          className="text-green-600"
        />
      );
    }

    if (
      membership?.status ===
      "payment_submitted" ||
      membership?.status ===
      "submitted"
    ) {
      return (
        <Clock3
          size={28}
          className="text-amber-600"
        />
      );
    }

    return (
      <CreditCard
        size={28}
        className="text-[#101c4d]"
      />
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      <PageHero
        eyebrow="Membership"
        title="Membership Payment"
        description="Check your membership application and submit your payment receipt."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">

          {/* ==============================================================
              APPLICATION LOOKUP
          ============================================================== */}

          {!membership && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

              <div className="flex items-start gap-4 mb-8">

                <div className="w-12 h-12 rounded-xl bg-[#101c4d] text-white flex items-center justify-center shrink-0">
                  <Search
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-serif text-[#101c4d]">
                    Find Your Application
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the application ID you received
                    after submitting your membership application.
                  </p>
                </div>

              </div>

              {error && (
                <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle
                    size={18}
                    className="shrink-0 mt-0.5"
                  />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              <form
                onSubmit={
                  findApplication
                }
                className="space-y-5"
              >

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Application ID
                  </label>

                  <input
                    type="text"
                    value={
                      applicationId
                    }
                    onChange={(event) =>
                      setApplicationId(
                        event.target.value
                      )
                    }
                    placeholder="Enter your application ID"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#101c4d] focus:ring-2 focus:ring-[#101c4d]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#101c4d] text-white py-3.5 font-semibold hover:bg-[#172765] disabled:opacity-60 transition"
                >
                  {loading
                    ? "Checking..."
                    : "Check Application"}
                </button>

              </form>

              <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-600">
                  Your application ID can be found in the
                  confirmation message/email sent after
                  registration.
                </p>
              </div>

            </div>
          )}

          {/* ==============================================================
              APPLICATION DETAILS
          ============================================================== */}

          {membership && (
            <div className="space-y-6">

              {/* ------------------------------------------------------------
                  STATUS
              ------------------------------------------------------------ */}

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                      {getStatusIcon()}
                    </div>

                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
                        Current Status
                      </p>

                      <h2 className="mt-1 text-xl md:text-2xl font-serif text-[#101c4d]">
                        {getStatusLabel()}
                      </h2>
                    </div>

                  </div>

                </div>

              </div>

              {/* ------------------------------------------------------------
                  MEMBER DETAILS
              ------------------------------------------------------------ */}

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

                <div className="flex items-center gap-3 mb-6">

                  <FileText
                    size={21}
                    className="text-[#101c4d]"
                  />

                  <h3 className="text-xl font-serif text-[#101c4d]">
                    Application Details
                  </h3>

                </div>

                <div className="grid sm:grid-cols-2 gap-5">

                  <Detail
                    label="Name"
                    value={
                      membership.name
                    }
                  />

                  <Detail
                    label="Email"
                    value={
                      membership.email
                    }
                  />

                  <Detail
                    label="Phone"
                    value={
                      membership.phone
                    }
                  />

                  <Detail
                    label="Membership"
                    value={
                      membership.membershipType ||
                      "—"
                    }
                  />

                  <Detail
                    label="Applicant Type"
                    value={
                      membership.applicantType ||
                      "—"
                    }
                  />

                  <Detail
                    label="Application ID"
                    value={
                      membership._id
                    }
                  />

                </div>

              </div>

              {/* ==========================================================
                  WAITING FOR ADMIN
              ========================================================== */}

              {membership.status ===
                "submitted" && (
                <InfoBox
                  title="Application Under Review"
                  text="Your application has been received. AMRI will review it and send payment instructions to your registered email if approved."
                />
              )}

              {/* ==========================================================
                  BANK DETAILS
              ========================================================== */}

              {membership.status ===
                "bank_details_sent" && (
                <>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

                    <div className="flex items-center gap-3 mb-6">

                      <CreditCard
                        size={22}
                        className="text-[#101c4d]"
                      />

                      <div>
                        <h3 className="text-xl font-serif text-[#101c4d]">
                          Payment Instructions
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          Please use the payment details provided
                          by AMRI.
                        </p>
                      </div>

                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">

                      <p className="font-semibold text-[#101c4d]">
                        Payment details have been sent
                        to your registered email.
                      </p>

                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        Complete the payment and then upload
                        your transaction receipt below.
                      </p>

                    </div>

                  </div>

                  {/* --------------------------------------------------------
                      RECEIPT UPLOAD
                  -------------------------------------------------------- */}

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

                    <h3 className="text-xl font-serif text-[#101c4d]">
                      Upload Payment Receipt
                    </h3>

                    <p className="text-sm text-slate-500 mt-1 mb-6">
                      Accepted formats: JPG, PNG, WEBP or PDF.
                      Maximum size: 5MB.
                    </p>

                    {error && (
                      <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle
                          size={18}
                          className="shrink-0"
                        />
                        {error}
                      </div>
                    )}

                    {message && (
                      <div className="mb-5 flex gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <CheckCircle2
                          size={18}
                          className="shrink-0"
                        />
                        {message}
                      </div>
                    )}

                    <form
                      onSubmit={
                        uploadReceipt
                      }
                    >

                      <label className="block cursor-pointer">

                        <div className="border-2 border-dashed border-slate-300 hover:border-[#101c4d]/50 rounded-2xl p-8 text-center transition">

                          <Upload
                            size={30}
                            className="mx-auto text-slate-400"
                          />

                          <p className="mt-3 font-medium text-[#101c4d]">
                            {receiptFile
                              ? receiptFile.name
                              : "Click to select payment receipt"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Upload your bank transaction
                            receipt or payment screenshot
                          </p>

                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            onChange={
                              handleReceiptChange
                            }
                            className="hidden"
                          />

                        </div>

                      </label>

                      <button
                        type="submit"
                        disabled={
                          uploading ||
                          !receiptFile
                        }
                        className="mt-5 w-full rounded-xl bg-[#101c4d] text-white py-3.5 font-semibold hover:bg-[#172765] disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {uploading
                          ? "Uploading Receipt..."
                          : "Submit Payment Receipt"}
                      </button>

                    </form>

                  </div>
                </>
              )}

              {/* ==========================================================
                  PAYMENT UNDER REVIEW
              ========================================================== */}

              {membership.status ===
                "payment_submitted" && (
                <InfoBox
                  title="Payment Under Review"
                  text="Your payment receipt has been submitted successfully. AMRI will verify the payment and update your membership status."
                  type="blue"
                />
              )}

              {/* ==========================================================
                  PAYMENT VERIFIED
              ========================================================== */}

              {membership.status ===
                "payment_received" && (
                <InfoBox
                  title="Payment Verified"
                  text="Your payment has been verified by AMRI. Your membership is ready for activation."
                  type="green"
                />
              )}

              {/* ==========================================================
                  MEMBER
              ========================================================== */}

              {membership.status ===
                "member" && (
                <div className="bg-white border border-green-200 rounded-2xl shadow-sm p-6 md:p-8">

                  <div className="flex items-center gap-3">

                    <CheckCircle2
                      size={28}
                      className="text-green-600"
                    />

                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-green-600">
                        Membership Active
                      </p>

                      <h3 className="text-2xl font-serif text-[#101c4d] mt-1">
                        Welcome to AMRI
                      </h3>
                    </div>

                  </div>

                  {membership.memberId && (
                    <div className="mt-6 rounded-xl bg-green-50 border border-green-100 p-5">

                      <p className="text-xs uppercase tracking-widest font-mono text-green-700">
                        Member ID
                      </p>

                      <p className="mt-2 text-xl font-mono font-semibold text-[#101c4d]">
                        {membership.memberId}
                      </p>

                    </div>
                  )}

                </div>
              )}

              {/* ------------------------------------------------------------
                  SEARCH AGAIN
              ------------------------------------------------------------ */}

              <button
                type="button"
                onClick={() => {
                  setMembership(null);
                  setApplicationId("");
                  setError("");
                  setMessage("");
                  setReceiptFile(null);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white text-[#101c4d] py-3.5 font-semibold hover:bg-slate-50 transition"
              >
                Check Another Application
              </button>

            </div>
          )}

        </div>
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| DETAIL COMPONENT
|--------------------------------------------------------------------------
*/

function Detail({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-mono text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-700 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INFO BOX
|--------------------------------------------------------------------------
*/

function InfoBox({
  title,
  text,
  type = "amber",
}) {
  const styles = {
    amber:
      "border-amber-200 bg-amber-50 text-amber-900",
    blue:
      "border-blue-200 bg-blue-50 text-blue-900",
    green:
      "border-green-200 bg-green-50 text-green-900",
  };

  return (
    <div
      className={`rounded-2xl border p-6 ${styles[type]}`}
    >
      <div className="flex gap-3">

        {type === "green" ? (
          <CheckCircle2
            size={22}
            className="shrink-0 mt-0.5"
          />
        ) : (
          <Clock3
            size={22}
            className="shrink-0 mt-0.5"
          />
        )}

        <div>
          <h3 className="font-semibold">
            {title}
          </h3>

          <p className="text-sm mt-1 opacity-80 leading-relaxed">
            {text}
          </p>
        </div>

      </div>
    </div>
  );
}