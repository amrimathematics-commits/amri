import { useState } from "react";
import { CheckCircle2, Upload, CreditCard, ArrowRight } from "lucide-react";
import PageHero from "../components/PageHero.jsx";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const plans = [
  {
    name: "Yearly",
    price: 750,
    duration: "1 Year",
    description: "For students, researchers and professionals.",
  },
  {
    name: "Bi-Yearly",
    price: 1200,
    duration: "2 Years",
    description: "Longer-term membership with added value.",
  },
  {
    name: "Lifetime",
    price: 5000,
    duration: "Lifetime",
    description: "One-time membership for lifelong association.",
  },
];

const applicantTypes = [
  "Student",
  "Research Scholar",
  "Faculty Member",
  "Professional",
];

export default function Membership() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    applicantType: "",
  });

  const [applicationId, setApplicationId] = useState("");

  const [receiptFile, setReceiptFile] = useState(null);

  const [step, setStep] = useState("application");

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT MEMBERSHIP APPLICATION
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/membership`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            applicantType:
              form.applicantType,
            membershipType:
              selectedPlan.name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to submit membership application."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE APPLICATION ID
      |--------------------------------------------------------------------------
      */

      const createdMembership =
        data.data;

      const id =
        createdMembership?._id ||
        createdMembership?.id ||
        "";

      setApplicationId(id);

      /*
      |--------------------------------------------------------------------------
      | MOVE TO SUCCESS SCREEN
      |--------------------------------------------------------------------------
      */

      setStep("submitted");

      setMessage(
        "Your membership application has been submitted successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(
        "Membership submission error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RECEIPT FILE CHANGE
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
        "Please upload a JPG, PNG, WEBP or PDF file."
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
  | UPLOAD PAYMENT RECEIPT
  |--------------------------------------------------------------------------
  */

  const handleReceiptUpload = async (
    event
  ) => {
    event.preventDefault();

    if (!applicationId) {
      setError(
        "Application ID is missing."
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
        applicationId
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
            "Unable to upload payment receipt."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | RECEIPT SUBMITTED
      |--------------------------------------------------------------------------
      */

      setStep(
        "payment_submitted"
      );

      setMessage(
        "Your payment receipt has been submitted successfully."
      );

      setReceiptFile(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(
        "Receipt upload error:",
        err
      );

      setError(
        err.message ||
          "Unable to upload receipt."
      );
    } finally {
      setUploading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HERO
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      <PageHero
        eyebrow="Membership"
        title="Join the AMRI Community"
        description="Become part of a growing community advancing mathematics, research, innovation and technology."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">

          {/* ----------------------------------------------------------------
              APPLICATION SUBMITTED
          ---------------------------------------------------------------- */}

          {step === "submitted" && (
            <div className="max-w-3xl mx-auto">

              <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm">

                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2
                      size={34}
                      className="text-green-600"
                    />
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-serif text-[#101c4d] text-center">
                  Application Submitted
                </h2>

                <p className="text-slate-600 text-center mt-3 leading-relaxed">
                  Thank you for applying for AMRI membership.
                  Your application has been received successfully.
                </p>

                {applicationId && (
                  <div className="mt-7 bg-slate-50 rounded-xl p-5 text-center">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-mono">
                      Application ID
                    </p>

                    <p className="mt-2 font-mono text-sm md:text-base text-[#101c4d] break-all">
                      {applicationId}
                    </p>
                  </div>
                )}

                <div className="mt-7 border border-amber-200 bg-amber-50 rounded-xl p-5">
                  <p className="font-semibold text-[#101c4d]">
                    What happens next?
                  </p>

                  <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                    AMRI will review your application.
                    Once the application is approved for payment,
                    you will receive the bank/UPI payment details
                    by email.
                  </p>
                </div>

                <div className="mt-7 text-center text-sm text-slate-500">
                  Please check the email address you provided
                  for further instructions.
                </div>

              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              PAYMENT SUBMITTED
          ---------------------------------------------------------------- */}

          {step === "payment_submitted" && (
            <div className="max-w-3xl mx-auto">

              <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm">

                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <CheckCircle2
                      size={34}
                      className="text-blue-600"
                    />
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-serif text-[#101c4d] text-center">
                  Payment Proof Submitted
                </h2>

                <p className="text-slate-600 text-center mt-3 leading-relaxed">
                  We have received your payment receipt.
                  The AMRI team will verify the payment
                  before activating your membership.
                </p>

                <div className="mt-7 bg-blue-50 border border-blue-100 rounded-xl p-5">
                  <p className="font-semibold text-[#101c4d]">
                    Payment Status
                  </p>

                  <p className="mt-1 text-blue-700 font-medium">
                    Under Review
                  </p>
                </div>

                <p className="mt-7 text-sm text-slate-500 text-center">
                  You will receive an email after your payment
                  has been verified by AMRI.
                </p>

              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              APPLICATION FORM
          ---------------------------------------------------------------- */}

          {step === "application" && (
            <div className="grid lg:grid-cols-[1fr_380px] gap-10">

              {/* ------------------------------------------------------------
                  FORM
              ------------------------------------------------------------ */}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">

                <div className="mb-8">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#f2a223]">
                    Membership Application
                  </p>

                  <h2 className="mt-2 text-2xl md:text-3xl font-serif text-[#101c4d]">
                    Tell us about yourself
                  </h2>

                  <p className="mt-2 text-slate-600">
                    Complete the application below to begin
                    your AMRI membership process.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-5"
                >

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#101c4d] focus:ring-2 focus:ring-[#101c4d]/10"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={
                          form.email
                        }
                        onChange={
                          handleChange
                        }
                        required
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#101c4d] focus:ring-2 focus:ring-[#101c4d]/10"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={
                          form.phone
                        }
                        onChange={
                          handleChange
                        }
                        required
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#101c4d] focus:ring-2 focus:ring-[#101c4d]/10"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Applicant Type
                    </label>

                    <select
                      name="applicantType"
                      value={
                        form.applicantType
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white outline-none focus:border-[#101c4d] focus:ring-2 focus:ring-[#101c4d]/10"
                    >
                      <option value="">
                        Select applicant type
                      </option>

                      {applicantTypes.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={
                        form.address
                      }
                      onChange={
                        handleChange
                      }
                      required
                      rows={4}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none resize-none focus:border-[#101c4d] focus:ring-2 focus:ring-[#101c4d]/10"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="pt-3">

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#101c4d] text-white px-6 py-3.5 font-semibold hover:bg-[#172765] disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {loading
                        ? "Submitting..."
                        : "Submit Membership Application"}

                      {!loading && (
                        <ArrowRight
                          size={18}
                        />
                      )}
                    </button>

                  </div>

                </form>
              </div>

              {/* ------------------------------------------------------------
                  PLANS
              ------------------------------------------------------------ */}

              <div>

                <div className="sticky top-24">

                  <p className="font-mono text-xs uppercase tracking-widest text-[#f2a223]">
                    Choose your plan
                  </p>

                  <h2 className="mt-2 text-2xl font-serif text-[#101c4d]">
                    Membership Plans
                  </h2>

                  <div className="mt-5 space-y-4">

                    {plans.map(
                      (plan) => {
                        const active =
                          selectedPlan.name ===
                          plan.name;

                        return (
                          <button
                            type="button"
                            key={
                              plan.name
                            }
                            onClick={() =>
                              setSelectedPlan(
                                plan
                              )
                            }
                            className={`w-full text-left rounded-2xl border p-5 transition ${
                              active
                                ? "border-[#101c4d] bg-[#101c4d] text-white shadow-lg"
                                : "border-slate-200 bg-white hover:border-[#101c4d]/40"
                            }`}
                          >

                            <div className="flex items-start justify-between gap-4">

                              <div>
                                <h3
                                  className={`font-serif text-xl ${
                                    active
                                      ? "text-white"
                                      : "text-[#101c4d]"
                                  }`}
                                >
                                  {
                                    plan.name
                                  }
                                </h3>

                                <p
                                  className={`mt-1 text-sm ${
                                    active
                                      ? "text-white/70"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {
                                    plan.description
                                  }
                                </p>
                              </div>

                              {active && (
                                <CheckCircle2
                                  size={22}
                                />
                              )}

                            </div>

                            <div className="mt-5 flex items-end justify-between">

                              <div>
                                <span className="text-3xl font-semibold">
                                  ₹
                                  {
                                    plan.price
                                  }
                                </span>

                                <span
                                  className={`ml-2 text-sm ${
                                    active
                                      ? "text-white/60"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {
                                    plan.duration
                                  }
                                </span>
                              </div>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">

                    <div className="flex gap-3">

                      <CreditCard
                        size={20}
                        className="text-[#101c4d] mt-0.5"
                      />

                      <div>
                        <p className="font-semibold text-[#101c4d]">
                          Payment comes later
                        </p>

                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                          Submit your application first.
                          AMRI will send the payment details
                          after reviewing your application.
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------
              PAYMENT RECEIPT UPLOAD
          ---------------------------------------------------------------- */}

          {step === "upload_receipt" && (
            <div className="max-w-3xl mx-auto">

              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">

                <div className="flex items-center gap-3 mb-7">
                  <div className="w-11 h-11 rounded-xl bg-[#101c4d] text-white flex items-center justify-center">
                    <Upload
                      size={20}
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-serif text-[#101c4d]">
                      Upload Payment Receipt
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Submit your payment proof for verification.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={
                    handleReceiptUpload
                  }
                >

                  <label className="block">

                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-[#101c4d]/50 transition cursor-pointer">

                      <Upload
                        size={30}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-3 font-medium text-[#101c4d]">
                        {receiptFile
                          ? receiptFile.name
                          : "Choose your payment receipt"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        JPG, PNG, WEBP or PDF · Max 5MB
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
                    className="mt-6 w-full rounded-xl bg-[#101c4d] text-white px-6 py-3.5 font-semibold hover:bg-[#172765] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {uploading
                      ? "Uploading..."
                      : "Submit Payment Receipt"}
                  </button>

                </form>

              </div>

            </div>
          )}

        </div>
      </section>
    </div>
  );
}