import { useState } from "react";
import PageHero from "../components/PageHero.jsx";

export default function MembershipRenewal() {
  const [renewalId, setRenewalId] = useState("");
  const [membership, setMembership] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | API URL
  |--------------------------------------------------------------------------
  */

  const getApiUrl = () => {
    const apiUrl = (
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000"
    )
      .trim()
      .replace(/\/+$/, "");

    return apiUrl.endsWith("/api")
      ? apiUrl
      : `${apiUrl}/api`;
  };

  /*
  |--------------------------------------------------------------------------
  | LOOKUP MEMBERSHIP
  |--------------------------------------------------------------------------
  */

  async function handleLookup(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setMembership(null);

    const cleanRenewalId =
      renewalId.trim().toUpperCase();

    if (!cleanRenewalId) {
      setError("Please enter your Renewal ID.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${getApiUrl()}/renewal/${encodeURIComponent(
          cleanRenewalId
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to find your membership."
        );
      }

      setMembership(data.data);
    } catch (err) {
      console.error(
        "Renewal lookup error:",
        err
      );

      setError(
        err.message ||
          "Unable to find your membership."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RECEIPT CHANGE
  |--------------------------------------------------------------------------
  */

  function handleReceiptChange(e) {
    const file = e.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setReceipt(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, WEBP and PDF files are allowed."
      );

      e.target.value = "";
      setReceipt(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Receipt must be smaller than 5 MB."
      );

      e.target.value = "";
      setReceipt(null);
      return;
    }

    setReceipt(file);
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT RENEWAL
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!membership?.renewalId) {
      setError(
        "Please verify your Renewal ID first."
      );
      return;
    }

    if (!receipt) {
      setError(
        "Please upload your renewal payment receipt."
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append(
        "receipt",
        receipt
      );

      const response = await fetch(
        `${getApiUrl()}/renewal/${encodeURIComponent(
          membership.renewalId
        )}/submit`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit renewal payment."
        );
      }

      setSuccess(
        data.message ||
          "Renewal payment submitted successfully."
      );

      setReceipt(null);

      setMembership({
        ...membership,
        renewalPaymentSubmittedAt:
          data.data
            ?.renewalPaymentSubmittedAt ||
          new Date().toISOString(),
      });

      const fileInput =
        document.getElementById(
          "renewal-receipt"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(
        "Renewal submission error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit renewal payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  function formatDate(date) {
    if (!date) return "N/A";

    return new Date(
      date
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <PageHero
        eyebrow="Membership Renewal"
        title="Renew your AMRI membership"
        symbol="↻"
      />

      <section className="bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-20">

          {/* =====================================================
              INTRO
          ===================================================== */}

          <div className="mb-10">
            <p className="text-ink-soft leading-7">
              Renew your AMRI membership for another
              year by completing the ₹500 renewal
              payment and uploading your payment receipt.
            </p>
          </div>

          {/* =====================================================
              RENEWAL ID LOOKUP
          ===================================================== */}

          <div className="border border-ink/10 p-6 md:p-8 mb-8">

            <h2 className="font-display text-xl font-semibold mb-2">
              Find your membership
            </h2>

            <p className="text-sm text-ink-soft mb-6">
              Enter the Renewal ID received in your
              AMRI renewal reminder email.
            </p>

            <form
              onSubmit={handleLookup}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="renewal-id"
                  className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-1"
                >
                  Renewal ID
                </label>

                <input
                  id="renewal-id"
                  type="text"
                  value={renewalId}
                  onChange={(e) =>
                    setRenewalId(
                      e.target.value
                    )
                  }
                  placeholder="AMRI-REN-2026-123456"
                  className="w-full border border-ink/20 px-4 py-3 bg-paper focus:outline-none focus:border-pen uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-ink px-6 py-3 text-sm disabled:opacity-50"
              >
                {loading
                  ? "Checking..."
                  : "Check membership"}
              </button>
            </form>
          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="border border-red-300 bg-red-50 text-red-700 px-5 py-4 mb-8 text-sm">
              {error}
            </div>
          )}

          {/* =====================================================
              SUCCESS
          ===================================================== */}

          {success && (
            <div className="border border-green-300 bg-green-50 text-green-700 px-5 py-4 mb-8 text-sm">
              {success}
            </div>
          )}

          {/* =====================================================
              MEMBERSHIP DETAILS
          ===================================================== */}

          {membership && (
            <div className="border border-ink/10 p-6 md:p-8">

              <h2 className="font-display text-xl font-semibold mb-6">
                Membership details
              </h2>

              <div className="grid sm:grid-cols-2 gap-5 mb-8">

                <div>
                  <p className="text-xs font-mono uppercase text-ink-soft mb-1">
                    Member
                  </p>

                  <p className="font-medium">
                    {membership.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-mono uppercase text-ink-soft mb-1">
                    Member ID
                  </p>

                  <p className="font-medium">
                    {membership.memberId}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-mono uppercase text-ink-soft mb-1">
                    Renewal ID
                  </p>

                  <p className="font-medium">
                    {membership.renewalId}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-mono uppercase text-ink-soft mb-1">
                    Membership type
                  </p>

                  <p className="font-medium">
                    {membership.membershipType}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-mono uppercase text-ink-soft mb-1">
                    Current expiry
                  </p>

                  <p className="font-medium">
                    {formatDate(
                      membership.membershipExpiryDate
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-mono uppercase text-ink-soft mb-1">
                    Renewal fee
                  </p>

                  <p className="font-medium">
                    ₹500
                  </p>
                </div>

              </div>

              {/* =================================================
                  ALREADY SUBMITTED
              ================================================= */}

              {membership.renewalPaymentSubmittedAt ? (
                <div className="border border-green-300 bg-green-50 p-5">
                  <p className="font-semibold text-green-800 mb-1">
                    Renewal payment submitted
                  </p>

                  <p className="text-sm text-green-700">
                    Your payment receipt has been
                    received by AMRI and is awaiting
                    verification.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >

                  {/* =============================================
                      PAYMENT INFORMATION
                  ============================================= */}

                  <div className="border border-ink/10 p-5">
                    <p className="text-xs font-mono uppercase text-ink-soft mb-2">
                      Renewal payment
                    </p>

                    <p className="text-2xl font-semibold mb-2">
                      ₹500
                    </p>

                    <p className="text-sm text-ink-soft">
                      Complete the ₹500 renewal payment
                      using the payment instructions
                      provided by AMRI.
                    </p>
                  </div>

                  {/* =============================================
                      RECEIPT
                  ============================================= */}

                  <div>
                    <label
                      htmlFor="renewal-receipt"
                      className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-2"
                    >
                      Payment receipt
                    </label>

                    <input
                      id="renewal-receipt"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={
                        handleReceiptChange
                      }
                      className="w-full border border-ink/20 px-4 py-3 bg-paper"
                    />

                    <p className="text-xs text-ink-soft mt-2">
                      JPG, PNG, WEBP or PDF · Maximum
                      5 MB
                    </p>

                    {receipt && (
                      <p className="text-sm text-pen mt-3">
                        Selected:{" "}
                        <strong>
                          {receipt.name}
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* =============================================
                      SUBMIT
                  ============================================= */}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-ink w-full py-3 text-sm disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit renewal payment"}
                  </button>

                </form>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}