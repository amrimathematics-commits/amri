require("dotenv").config();

const nodemailer = require("nodemailer");

// ============================================================
// ENVIRONMENT
// ============================================================

const EMAIL_HOST =
  process.env.EMAIL_HOST || "smtp.gmail.com";

const EMAIL_PORT =
  Number(process.env.EMAIL_PORT) || 587;

const EMAIL_USER =
  process.env.EMAIL_USER;

const EMAIL_PASSWORD =
  process.env.EMAIL_PASSWORD;

const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  EMAIL_USER ||
  "amrimathematics@gmail.com";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  EMAIL_USER ||
  "amrimathematics@gmail.com";

const CLIENT_URL =
  (
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  )
    .trim()
    .replace(/\/+$/, "");

// ============================================================
// TRANSPORTER
// ============================================================

function createTransporter() {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error(
      "EMAIL_USER or EMAIL_PASSWORD is missing in .env"
    );
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,

    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
}

// ============================================================
// EMAIL FROM ADDRESS
// ============================================================

function getFromAddress() {
  return `"AMRI" <${EMAIL_FROM}>`;
}

// ============================================================
// VERIFY EMAIL CONNECTION
// ============================================================

async function verifyEmailConnection() {
  try {
    const transporter = createTransporter();

    await transporter.verify();

    console.log("Email transporter is ready.");

    return true;
  } catch (error) {
    console.error(
      "Email transporter verification failed:",
      error.message
    );

    return false;
  }
}

// ============================================================
// GENERIC EMAIL
// ============================================================

async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}) {
  if (!to) {
    throw new Error(
      "Recipient email address is required."
    );
  }

  const transporter =
    createTransporter();

  const mailOptions = {
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  };

  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  return await transporter.sendMail(
    mailOptions
  );
}

// ============================================================
// CONTACT EMAIL
// ============================================================

async function sendContactEmail({
  name,
  email,
  message,
}) {
  if (!name || !email || !message) {
    throw new Error(
      "Name, email and message are required."
    );
  }

  const cleanName =
    String(name).trim();

  const cleanEmail =
    String(email).trim().toLowerCase();

  const cleanMessage =
    String(message).trim();

  if (
    !cleanName ||
    !cleanEmail ||
    !cleanMessage
  ) {
    throw new Error(
      "Name, email and message are required."
    );
  }

  // ----------------------------------------------------------
  // ADMIN EMAIL
  // ----------------------------------------------------------

  const adminSubject =
    `AMRI Website Contact - ${cleanName}`;

  const adminText = `
New Contact Message - AMRI Website

Name:
${cleanName}

Email:
${cleanEmail}

Message:
${cleanMessage}

--------------------------------
Sent through the AMRI website.
`;

  const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AMRI Contact Message</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>

  <div
    style="
      max-width:650px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #dddddd;
    "
  >

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:30px;
      "
    >

      <h1 style="margin:0;">
        AMRI
      </h1>

      <p
        style="
          margin:8px 0 0;
          color:#f2a223;
        "
      >
        New Contact Message
      </p>

    </div>

    <div style="padding:30px;">

      <p>
        A new message has been submitted
        through the AMRI website.
      </p>

      <div
        style="
          margin-top:25px;
          background:#f7f7f7;
          border:1px solid #dddddd;
          padding:20px;
        "
      >

        <p>
          <strong>Name:</strong>
          ${cleanName}
        </p>

        <p>
          <strong>Email:</strong>
          ${cleanEmail}
        </p>

        <p>
          <strong>Message:</strong>
        </p>

        <div
          style="
            background:#ffffff;
            border:1px solid #dddddd;
            padding:15px;
            white-space:pre-wrap;
          "
        >
${cleanMessage}
        </div>

      </div>

    </div>

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:18px;
        text-align:center;
        font-size:12px;
      "
    >
      AMRI - Association for Mathematics,
      Research and Innovation
    </div>

  </div>

</body>
</html>
`;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: adminSubject,
    text: adminText,
    html: adminHtml,
    replyTo: cleanEmail,
  });

  // ----------------------------------------------------------
  // USER CONFIRMATION EMAIL
  // ----------------------------------------------------------

  const confirmationSubject =
    "We received your message - AMRI";

  const confirmationText = `
Hello ${cleanName},

Thank you for contacting AMRI.

We have received your message successfully.

Our team will get back to you within two business days.

Regards,
AMRI
Association for Mathematics, Research and Innovation
`;

  const confirmationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AMRI Message Received</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>

  <div
    style="
      max-width:650px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #dddddd;
    "
  >

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:30px;
      "
    >

      <h1 style="margin:0;">
        AMRI
      </h1>

      <p
        style="
          margin:8px 0 0;
          color:#f2a223;
        "
      >
        Message Received
      </p>

    </div>

    <div style="padding:30px;">

      <p>
        Hello <strong>${cleanName}</strong>,
      </p>

      <p>
        Thank you for contacting AMRI.
      </p>

      <p>
        We have received your message successfully.
      </p>

      <p>
        Our team will get back to you within
        two business days.
      </p>

      <p>
        Regards,<br>
        <strong>AMRI</strong><br>
        Association for Mathematics,
        Research and Innovation
      </p>

    </div>

  </div>

</body>
</html>
`;

  await sendEmail({
    to: cleanEmail,
    subject: confirmationSubject,
    text: confirmationText,
    html: confirmationHtml,
  });

  console.log(
    `Contact email sent successfully to ${cleanEmail}`
  );
}

// ============================================================
// MEMBERSHIP APPLICATION EMAIL
// ============================================================

async function sendMembershipApplicationEmail({
  membership,
  name,
  email,
  applicationId,
  membershipType,
  amount,
  duration,
  paymentUrl,
}) {
  // ----------------------------------------------------------
  // SUPPORT BOTH CALLING STYLES
  // ----------------------------------------------------------

  const application =
    membership || {};

  const applicantName =
    name ||
    application.name ||
    "Applicant";

  const applicantEmail =
    email ||
    application.email;

  const finalApplicationId =
    applicationId ||
    application._id?.toString() ||
    application.id;

  const finalMembershipType =
    membershipType ||
    application.membershipType ||
    application.membership ||
    "Membership";

  const finalAmount =
    amount ??
    application.amount ??
    0;

  const finalDuration =
    duration ||
    application.duration ||
    "";

  const finalPaymentUrl =
    paymentUrl ||
    `${CLIENT_URL}/membership/payment/${finalApplicationId}`;

  if (!applicantEmail) {
    throw new Error(
      "Applicant email is required."
    );
  }

  if (!finalApplicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  const subject =
    "AMRI Membership Application Received";

  const text = `
Hello ${applicantName},

Thank you for applying for AMRI membership.

Your membership application has been successfully received.

Application ID:
${finalApplicationId}

Membership:
${finalMembershipType}

Duration:
${finalDuration}

Amount:
₹${finalAmount}

Payment Page:
${finalPaymentUrl}

Please keep your Application ID safe.

You will need it to access your payment page and complete the membership process.

Regards,
AMRI
Association for Mathematics, Research and Innovation
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AMRI Membership Application</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>

  <div
    style="
      max-width:680px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #dddddd;
    "
  >

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:32px;
      "
    >

      <h1 style="margin:0;">
        AMRI
      </h1>

      <p
        style="
          color:#f2a223;
          margin:8px 0 0;
        "
      >
        Membership Application Received
      </p>

    </div>

    <div style="padding:32px;">

      <p>
        Hello <strong>${applicantName}</strong>,
      </p>

      <p>
        Thank you for applying for AMRI membership.
        Your application has been successfully received.
      </p>

      <div
        style="
          background:#f7f7f7;
          border:1px solid #dddddd;
          padding:22px;
          margin:25px 0;
        "
      >

        <h3
          style="
            margin-top:0;
            color:#101c4d;
          "
        >
          Application Details
        </h3>

        <p>
          <strong>Application ID:</strong><br>
          <span
            style="
              font-size:18px;
              color:#101c4d;
            "
          >
            ${finalApplicationId}
          </span>
        </p>

        <p>
          <strong>Membership:</strong>
          ${finalMembershipType}
        </p>

        <p>
          <strong>Duration:</strong>
          ${finalDuration}
        </p>

        <p>
          <strong>Amount:</strong>
          ₹${finalAmount}
        </p>

      </div>

      <div
        style="
          text-align:center;
          margin:30px 0;
        "
      >

        <a
          href="${finalPaymentUrl}"
          style="
            display:inline-block;
            background:#101c4d;
            color:#ffffff;
            text-decoration:none;
            padding:14px 26px;
            border-radius:4px;
            font-weight:bold;
          "
        >
          Open Payment Page
        </a>

      </div>

      <div
        style="
          background:#fff8e5;
          border:1px solid #f2a223;
          padding:18px;
        "
      >

        <strong>Important</strong>

        <p style="margin-bottom:0;">
          Please keep your Application ID safe.
          You will need it to access your payment page.
        </p>

      </div>

      <p style="margin-top:30px;">
        Regards,<br>
        <strong>AMRI Team</strong>
      </p>

    </div>

  </div>

</body>
</html>
`;

  const result =
    await sendEmail({
      to: applicantEmail,
      subject,
      text,
      html,
    });

  console.log(
    `Membership application email sent to ${applicantEmail}`
  );

  console.log(
    `Application ID: ${finalApplicationId}`
  );

  return result;
}

// ============================================================
// BANK DETAILS EMAIL
// ============================================================

async function sendBankDetailsEmail({
  membership,
  bankDetails,
}) {
  if (!membership) {
    throw new Error(
      "Membership application data is required."
    );
  }

  if (!bankDetails) {
    throw new Error(
      "Bank details are required."
    );
  }

  // ----------------------------------------------------------
  // APPLICANT
  // ----------------------------------------------------------

  const name =
    membership.name?.trim() ||
    "Applicant";

  const email =
    membership.email?.trim();

  const applicationId =
    membership._id?.toString() ||
    membership.id;

  const membershipType =
    membership.membershipType ||
    membership.membership ||
    "Membership";

  const amount =
    membership.amount ?? 0;

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!email) {
    throw new Error(
      "Applicant email is required."
    );
  }

  if (!applicationId) {
    throw new Error(
      "Application ID is required."
    );
  }

  // ----------------------------------------------------------
  // BANK DETAILS
  // ----------------------------------------------------------

  const bankName =
    bankDetails.bankName ||
    "";

  const accountName =
    bankDetails.accountName ||
    "";

  const accountNumber =
    bankDetails.accountNumber ||
    "";

  const ifsc =
    bankDetails.ifsc ||
    bankDetails.ifscCode ||
    "";

  const branch =
    bankDetails.branch ||
    "";

  const upiId =
    bankDetails.upiId ||
    bankDetails.upi ||
    "";

  const paymentInstructions =
    bankDetails.paymentInstructions ||
    "";

  // ----------------------------------------------------------
  // PAYMENT PAGE
  // ----------------------------------------------------------

  const paymentPageUrl =
    `${CLIENT_URL}/membership/payment/${applicationId}`;

  // ----------------------------------------------------------
  // SUBJECT
  // ----------------------------------------------------------

  const subject =
    "AMRI Membership - Payment Details";

  // ----------------------------------------------------------
  // TEXT
  // ----------------------------------------------------------

  const text = `
Hello ${name},

Thank you for applying for AMRI membership.

Your application is now ready for the payment step.

APPLICATION DETAILS
-------------------

Application ID:
${applicationId}

Membership:
${membershipType}

Amount:
₹${amount}


BANK DETAILS
------------

Bank Name:
${bankName}

Account Name:
${accountName}

Account Number:
${accountNumber}

IFSC Code:
${ifsc}

Branch:
${branch}

UPI ID:
${upiId || "N/A"}


PAYMENT INSTRUCTIONS
--------------------

${paymentInstructions}


PAYMENT PAGE
------------

${paymentPageUrl}


After making the payment, please upload your payment receipt using the payment page above.

IMPORTANT

Application ID:
${applicationId}

Please keep your Application ID safe.

Once AMRI verifies your payment, your membership will be processed for activation.

Regards,
AMRI
Association for Mathematics, Research and Innovation
`;

  // ----------------------------------------------------------
  // HTML
  // ----------------------------------------------------------

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AMRI Membership Payment Details</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>

  <div
    style="
      max-width:700px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #dddddd;
    "
  >

    <!-- HEADER -->

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:32px;
      "
    >

      <h1 style="margin:0;">
        AMRI Membership
      </h1>

      <p
        style="
          color:#f2a223;
          margin:8px 0 0;
        "
      >
        Payment Details
      </p>

    </div>

    <!-- CONTENT -->

    <div style="padding:32px;">

      <p>
        Hello <strong>${name}</strong>,
      </p>

      <p>
        Thank you for applying for AMRI membership.
      </p>

      <p>
        Your application is now ready for the payment step.
      </p>

      <!-- APPLICATION -->

      <div
        style="
          background:#f7f7f7;
          border:1px solid #dddddd;
          padding:22px;
          margin:25px 0;
        "
      >

        <h3
          style="
            margin-top:0;
            color:#101c4d;
          "
        >
          Application Details
        </h3>

        <p>
          <strong>Application ID:</strong>
          ${applicationId}
        </p>

        <p>
          <strong>Membership:</strong>
          ${membershipType}
        </p>

        <p>
          <strong>Amount:</strong>
          ₹${amount}
        </p>

      </div>

      <!-- BANK -->

      <h3
        style="
          color:#101c4d;
          margin-top:30px;
        "
      >
        Bank Details
      </h3>

      <table
        style="
          width:100%;
          border-collapse:collapse;
          border:1px solid #dddddd;
        "
      >

        <tr>
          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
              font-weight:bold;
            "
          >
            Bank Name
          </td>

          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
            "
          >
            ${bankName}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
              font-weight:bold;
            "
          >
            Account Name
          </td>

          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
            "
          >
            ${accountName}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
              font-weight:bold;
            "
          >
            Account Number
          </td>

          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
            "
          >
            ${accountNumber}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
              font-weight:bold;
            "
          >
            IFSC Code
          </td>

          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
            "
          >
            ${ifsc}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
              font-weight:bold;
            "
          >
            Branch
          </td>

          <td
            style="
              padding:12px;
              border:1px solid #dddddd;
            "
          >
            ${branch}
          </td>
        </tr>

        ${
          upiId
            ? `
              <tr>

                <td
                  style="
                    padding:12px;
                    border:1px solid #dddddd;
                    font-weight:bold;
                  "
                >
                  UPI ID
                </td>

                <td
                  style="
                    padding:12px;
                    border:1px solid #dddddd;
                  "
                >
                  ${upiId}
                </td>

              </tr>
            `
            : ""
        }

      </table>

      <!-- INSTRUCTIONS -->

      ${
        paymentInstructions
          ? `
            <div
              style="
                margin-top:25px;
                padding:20px;
                background:#fff8e5;
                border-left:4px solid #f2a223;
              "
            >

              <h3
                style="
                  margin-top:0;
                  color:#101c4d;
                "
              >
                Payment Instructions
              </h3>

              <div
                style="
                  white-space:pre-line;
                "
              >
${paymentInstructions}
              </div>

            </div>
          `
          : ""
      }

      <!-- PAYMENT PAGE -->

      <div
        style="
          margin-top:30px;
          padding:25px;
          background:#f4f6fb;
          border:1px solid #dce1ee;
          text-align:center;
        "
      >

        <h3
          style="
            margin-top:0;
            color:#101c4d;
          "
        >
          Complete Your Payment
        </h3>

        <p>
          After making the payment, use the button
          below to upload your payment receipt.
        </p>

        <a
          href="${paymentPageUrl}"
          style="
            display:inline-block;
            background:#101c4d;
            color:#ffffff;
            text-decoration:none;
            padding:14px 26px;
            border-radius:4px;
            font-weight:bold;
            margin-top:10px;
          "
        >
          Open Payment Page
        </a>

      </div>

      <!-- APPLICATION ID -->

      <div
        style="
          margin-top:25px;
          padding:20px;
          background:#fff8e5;
          border:1px solid #f2a223;
        "
      >

        <p
          style="
            margin:0;
            font-weight:bold;
          "
        >
          Your Application ID
        </p>

        <p
          style="
            margin:8px 0;
            font-size:18px;
            color:#101c4d;
            word-break:break-all;
          "
        >
          ${applicationId}
        </p>

        <p
          style="
            margin:0;
            color:#666666;
            font-size:13px;
          "
        >
          Please keep this Application ID safe.
        </p>

      </div>

      <p style="margin-top:30px;">
        Once AMRI verifies your payment,
        your membership will be processed for activation.
      </p>

      <p>
        Regards,<br>
        <strong>AMRI Team</strong>
      </p>

    </div>

    <!-- FOOTER -->

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:18px;
        text-align:center;
        font-size:12px;
      "
    >
      AMRI - Association for Mathematics,
      Research and Innovation
    </div>

  </div>

</body>
</html>
`;

  const result =
    await sendEmail({
      to: email,
      subject,
      text,
      html,
    });

  console.log(
    `Bank details email sent to ${email}`
  );

  console.log(
    `Application ID: ${applicationId}`
  );

  console.log(
    `Payment page: ${paymentPageUrl}`
  );

  return result;
}

// ============================================================
// PAYMENT RECEIVED EMAIL
// ============================================================

async function sendPaymentReceivedEmail({
  membership,
  payment,
}) {
  if (!membership) {
    throw new Error(
      "Membership application data is required."
    );
  }

  const name =
    membership.name ||
    "Member";

  const email =
    membership.email;

  const applicationId =
    membership._id?.toString() ||
    membership.id;

  const amount =
    payment?.amount ??
    membership.amount ??
    0;

  const transactionId =
    payment?.transactionId ||
    payment?.transactionID ||
    payment?.reference ||
    "";

  if (!email) {
    throw new Error(
      "Applicant email is required."
    );
  }

  const subject =
    "AMRI Membership - Payment Received";

  const text = `
Hello ${name},

We have received your membership payment details.

Application ID:
${applicationId || "N/A"}

Amount:
₹${amount}

${
  transactionId
    ? `Transaction ID:
${transactionId}`
    : ""
}

Your payment is now pending verification by the AMRI administration team.

You will receive another email once your membership is officially activated.

Regards,
AMRI
Association for Mathematics, Research and Innovation
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AMRI Payment Received</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>

  <div
    style="
      max-width:680px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #dddddd;
    "
  >

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:32px;
      "
    >

      <h1 style="margin:0;">
        AMRI
      </h1>

      <p
        style="
          color:#f2a223;
          margin:8px 0 0;
        "
      >
        Payment Received
      </p>

    </div>

    <div style="padding:32px;">

      <p>
        Hello <strong>${name}</strong>,
      </p>

      <p>
        We have received your membership payment details.
      </p>

      <div
        style="
          background:#f7f7f7;
          border:1px solid #dddddd;
          padding:22px;
          margin:25px 0;
        "
      >

        <p>
          <strong>Application ID:</strong>
          ${applicationId || "N/A"}
        </p>

        <p>
          <strong>Amount:</strong>
          ₹${amount}
        </p>

        ${
          transactionId
            ? `
              <p>
                <strong>Transaction ID:</strong>
                ${transactionId}
              </p>
            `
            : ""
        }

      </div>

      <p>
        Your payment is now pending verification
        by the AMRI administration team.
      </p>

      <p>
        You will receive another email once your
        membership is officially activated.
      </p>

      <p>
        Regards,<br>
        <strong>AMRI Team</strong>
      </p>

    </div>

  </div>

</body>
</html>
`;

  return await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}

// ============================================================
// MEMBERSHIP CONFIRMATION / ACTIVATION EMAIL
// ============================================================

async function sendMembershipConfirmationEmail({
  membership,
  memberId,
}) {
  if (!membership) {
    throw new Error(
      "Membership application data is required."
    );
  }

  const name =
    membership.name ||
    "Member";

  const email =
    membership.email;

  const applicationId =
    membership._id?.toString() ||
    membership.id;

  const membershipType =
    membership.membershipType ||
    membership.membership ||
    "Membership";

  const duration =
    membership.duration ||
    "";

  const amount =
    membership.amount ??
    0;

  if (!email) {
    throw new Error(
      "Applicant email is required."
    );
  }

  const subject =
    "Welcome to AMRI - Membership Activated";

  const text = `
Hello ${name},

Congratulations!

Your AMRI membership has been officially activated.

Application ID:
${applicationId || "N/A"}

Member ID:
${memberId || "N/A"}

Membership:
${membershipType}

Duration:
${duration}

Amount Paid:
₹${amount}

Welcome to the AMRI community.

Regards,
AMRI
Association for Mathematics, Research and Innovation
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AMRI Membership Activated</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>

  <div
    style="
      max-width:680px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #dddddd;
    "
  >

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:35px;
        text-align:center;
      "
    >

      <h1 style="margin:0;">
        Welcome to AMRI
      </h1>

      <p
        style="
          color:#f2a223;
          margin:8px 0 0;
        "
      >
        Membership Activated
      </p>

    </div>

    <div style="padding:35px;">

      <p>
        Hello <strong>${name}</strong>,
      </p>

      <p>
        Congratulations!
      </p>

      <p>
        Your AMRI membership has been
        officially activated.
      </p>

      <div
        style="
          background:#f7f7f7;
          border:1px solid #dddddd;
          padding:24px;
          margin:25px 0;
        "
      >

        <p>
          <strong>Application ID:</strong>
          ${applicationId || "N/A"}
        </p>

        <p>
          <strong>Member ID:</strong>
          ${memberId || "N/A"}
        </p>

        <p>
          <strong>Membership:</strong>
          ${membershipType}
        </p>

        <p>
          <strong>Duration:</strong>
          ${duration}
        </p>

        <p>
          <strong>Amount Paid:</strong>
          ₹${amount}
        </p>

      </div>

      <p>
        Welcome to the AMRI community.
      </p>

      <p>
        Regards,<br>
        <strong>AMRI Team</strong>
      </p>

    </div>

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:18px;
        text-align:center;
        font-size:12px;
      "
    >
      AMRI - Association for Mathematics,
      Research and Innovation
    </div>

  </div>

</body>
</html>
`;

  return await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}

// ============================================================
// REGISTRATION EMAIL
// ============================================================

async function sendRegistrationEmail({
  name,
  email,
  registrationType,
  title,
  description,
  registrationId,
  registrationUrl,
}) {
  if (!email) {
    throw new Error("Applicant email is required.");
  }

  const recipient = email.trim().toLowerCase();

  const typeLabel =
    registrationType === "event"
      ? "Event"
      : registrationType === "program"
        ? "Program"
        : "Registration";

  const subject = `AMRI ${typeLabel} Registration – ${title || "Registration Link"}`;

  const safeTitle = title || "AMRI Registration";
  const safeDescription = description || "";
  const safeRegistrationId = registrationId || "N/A";
  const safeRegistrationUrl = registrationUrl || "";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${subject}</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background: #f5f5f5;
        font-family: Arial, Helvetica, sans-serif;
        color: #172554;
      ">

        <div style="
          max-width: 650px;
          margin: 30px auto;
          background: #ffffff;
          border: 1px solid #e5e7eb;
        ">

          <!-- HEADER -->
          <div style="
            background: #172554;
            padding: 28px 30px;
            text-align: center;
          ">
            <h1 style="
              margin: 0;
              color: #ffffff;
              font-size: 28px;
            ">
              AMRI
            </h1>

            <p style="
              margin: 8px 0 0;
              color: #fbbf24;
              font-size: 13px;
              letter-spacing: 2px;
            ">
              ASSOCIATION FOR MATHEMATICS,
              RESEARCH AND INNOVATION
            </p>
          </div>

          <!-- CONTENT -->
          <div style="padding: 35px 30px;">

            <p style="
              font-size: 16px;
              margin-top: 0;
            ">
              Dear <strong>${name || "Participant"}</strong>,
            </p>

            <p style="
              font-size: 15px;
              line-height: 1.7;
              color: #475569;
            ">
              Thank you for your interest in AMRI.
              Your request to register for the following
              ${typeLabel.toLowerCase()} has been received.
            </p>

            <!-- REGISTRATION DETAILS -->
            <div style="
              margin: 25px 0;
              padding: 20px;
              background: #f8fafc;
              border-left: 4px solid #f59e0b;
            ">

              <p style="
                margin: 0 0 8px;
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">
                ${typeLabel}
              </p>

              <h2 style="
                margin: 0 0 12px;
                color: #172554;
                font-size: 21px;
              ">
                ${safeTitle}
              </h2>

              ${
                safeDescription
                  ? `
                    <p style="
                      margin: 0;
                      color: #475569;
                      line-height: 1.6;
                    ">
                      ${safeDescription}
                    </p>
                  `
                  : ""
              }

            </div>

            <!-- REGISTRATION ID -->
            <div style="
              margin: 25px 0;
              padding: 18px;
              background: #fff7ed;
              border: 1px solid #fed7aa;
              text-align: center;
            ">

              <p style="
                margin: 0 0 7px;
                font-size: 12px;
                color: #9a3412;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">
                Registration ID
              </p>

              <p style="
                margin: 0;
                font-size: 20px;
                font-weight: bold;
                color: #172554;
                letter-spacing: 1px;
              ">
                ${safeRegistrationId}
              </p>

            </div>

            ${
              safeRegistrationUrl
                ? `
                  <!-- REGISTRATION BUTTON -->
                  <div style="
                    text-align: center;
                    margin: 30px 0;
                  ">

                    <a
                      href="${safeRegistrationUrl}"
                      style="
                        display: inline-block;
                        background: #f59e0b;
                        color: #172554;
                        text-decoration: none;
                        padding: 14px 28px;
                        font-weight: bold;
                        font-size: 15px;
                      "
                    >
                      Complete Registration
                    </a>

                  </div>

                  <p style="
                    font-size: 13px;
                    line-height: 1.6;
                    color: #64748b;
                    word-break: break-all;
                  ">
                    If the button does not work, use this link:
                    <br />
                    <a
                      href="${safeRegistrationUrl}"
                      style="color: #172554;"
                    >
                      ${safeRegistrationUrl}
                    </a>
                  </p>
                `
                : ""
            }

            <p style="
              font-size: 14px;
              line-height: 1.7;
              color: #475569;
              margin-top: 30px;
            ">
              Please keep your Registration ID for future
              communication with AMRI.
            </p>

            <p style="
              font-size: 14px;
              line-height: 1.7;
              color: #475569;
            ">
              Regards,<br />
              <strong>AMRI</strong><br />
              Association for Mathematics, Research and Innovation
            </p>

          </div>

          <!-- FOOTER -->
          <div style="
            background: #172554;
            padding: 20px 30px;
            text-align: center;
          ">

            <p style="
              margin: 0;
              color: #ffffff;
              font-size: 13px;
            ">
              AMRI — Association for Mathematics,
              Research and Innovation
            </p>

            <p style="
              margin: 8px 0 0;
              color: #cbd5e1;
              font-size: 12px;
            ">
              Coimbatore, Tamil Nadu, India
            </p>

          </div>

        </div>

      </body>
    </html>
  `;

  const text = `
Dear ${name || "Participant"},

Thank you for your interest in AMRI.

Your ${typeLabel.toLowerCase()} registration request has been received.

${typeLabel}: ${safeTitle}

Registration ID: ${safeRegistrationId}

${safeDescription ? `Description: ${safeDescription}` : ""}

${safeRegistrationUrl ? `Complete your registration here:
${safeRegistrationUrl}` : ""}

Please keep your Registration ID for future communication with AMRI.

Regards,
AMRI
Association for Mathematics, Research and Innovation
  `.trim();

  return sendEmail({
    to: recipient,
    subject,
    text,
    html,
  });
}

/*
|--------------------------------------------------------------------------
| MEMBERSHIP RENEWAL REMINDER EMAIL
|--------------------------------------------------------------------------
*/

async function sendMembershipRenewalReminderEmail({
  membership,
  renewalFee = 500,
  renewalUrl,
}) {
  if (!membership) {
    throw new Error(
      "Membership information is required."
    );
  }

  if (!membership.email) {
    throw new Error(
      "Applicant email is required."
    );
  }

  const applicantName =
    membership.name || "Member";

  const renewalId =
    membership.renewalId || "N/A";

  const expiryDate =
    membership.membershipExpiryDate
      ? new Date(
          membership.membershipExpiryDate
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "N/A";

  const subject =
    "AMRI Membership Renewal Reminder";

  const html = `
    <div style="
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #222;
      max-width: 650px;
      margin: 0 auto;
    ">

      <h2 style="margin-bottom: 10px;">
        AMRI Membership Renewal
      </h2>

      <p>
        Dear ${applicantName},
      </p>

      <p>
        Your AMRI membership is approaching its
        expiry date.
      </p>

      <div style="
        background: #f7f7f7;
        padding: 18px;
        margin: 20px 0;
        border-left: 4px solid #222;
      ">

        <p style="margin: 5px 0;">
          <strong>Member ID:</strong>
          ${membership.memberId || "N/A"}
        </p>

        <p style="margin: 5px 0;">
          <strong>Renewal ID:</strong>
          ${renewalId}
        </p>

        <p style="margin: 5px 0;">
          <strong>Membership Expiry:</strong>
          ${expiryDate}
        </p>

        <p style="margin: 5px 0;">
          <strong>Renewal Fee:</strong>
          ₹${renewalFee}
        </p>

      </div>

      <p>
        To continue your AMRI membership,
        please complete the renewal process
        before your membership expires.
      </p>

      <p>
        <a
          href="${renewalUrl}"
          style="
            display: inline-block;
            background: #111;
            color: #fff;
            padding: 12px 22px;
            text-decoration: none;
            border-radius: 4px;
          "
        >
          Renew Membership
        </a>
      </p>

      <p>
        Please keep your Renewal ID
        <strong>${renewalId}</strong>
        for the renewal process.
      </p>

      <p>
        If you have already renewed your
        membership, you may ignore this email.
      </p>

      <p>
        Regards,<br />
        <strong>AMRI</strong><br />
        Association of Mathematics Research & Innovation
      </p>

    </div>
  `;

  const text = `
Dear ${applicantName},

Your AMRI membership is approaching its expiry date.

Member ID: ${membership.memberId || "N/A"}
Renewal ID: ${renewalId}
Membership Expiry: ${expiryDate}
Renewal Fee: ₹${renewalFee}

Please renew your membership before it expires.

Renewal page:
${renewalUrl}

If you have already renewed your membership,
you may ignore this email.

Regards,
AMRI
Association of Mathematics Research & Innovation
`;

  return sendEmail({
    to: membership.email,
    subject,
    text,
    html,
  });
}

/*
|--------------------------------------------------------------------------
| MEMBERSHIP STOPPED EMAIL
|--------------------------------------------------------------------------
*/

const sendMembershipStoppedEmail = async ({
  membership,
  reason,
}) => {
  if (!membership) {
    throw new Error("Membership data is required.");
  }

  const name = membership.name || "Member";
  const email = membership.email;

  if (!email) {
    throw new Error("Member email is required.");
  }

  const memberId =
    membership.memberId || "N/A";

  const stoppedAt =
    membership.membershipStoppedAt
      ? new Date(
          membership.membershipStoppedAt
        ).toLocaleDateString("en-IN")
      : new Date().toLocaleDateString("en-IN");

  const subject =
    "AMRI Membership – Membership Stopped";

  const text = `
Hello ${name},

This is to inform you that your AMRI membership has been stopped.

Member ID:
${memberId}

Membership Type:
${membership.membershipType || "N/A"}

Stopped On:
${stoppedAt}

Reason:
${reason || "Membership stopped by administrator."}

Your AMRI membership is currently inactive.

If you wish to become an AMRI member again, please contact AMRI regarding membership renewal/reactivation.

Regards,
AMRI Team
Association for Mathematics, Research and Innovation
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AMRI Membership Stopped</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>

  <div
    style="
      max-width:680px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #dddddd;
    "
  >

    <div
      style="
        background:#101c4d;
        color:#ffffff;
        padding:32px;
        text-align:center;
      "
    >

      <h1 style="margin:0;">
        AMRI
      </h1>

      <p
        style="
          color:#f2a223;
          margin:8px 0 0;
        "
      >
        Membership Status Update
      </p>

    </div>

    <div style="padding:32px;">

      <p>
        Hello <strong>${name}</strong>,
      </p>

      <p>
        This is to inform you that your AMRI membership
        has been stopped.
      </p>

      <div
        style="
          background:#fff5f5;
          border:1px solid #f1caca;
          padding:22px;
          margin:25px 0;
        "
      >

        <p>
          <strong>Member ID:</strong>
          ${memberId}
        </p>

        <p>
          <strong>Membership Type:</strong>
          ${membership.membershipType || "N/A"}
        </p>

        <p>
          <strong>Stopped On:</strong>
          ${stoppedAt}
        </p>

        <p>
          <strong>Reason:</strong>
          ${reason || "Membership stopped by administrator."}
        </p>

      </div>

      <p>
        Your AMRI membership is currently inactive.
      </p>

      <p>
        If you wish to become an AMRI member again,
        please contact AMRI regarding membership
        renewal/reactivation.
      </p>

      <p style="margin-top:30px;">
        Regards,<br />
        <strong>AMRI Team</strong>
      </p>

    </div>

  </div>

</body>
</html>
`;

  const transporter = createTransporter();

  const result = await transporter.sendMail({
    from: getFromAddress(),
    to: email,
    subject,
    text,
    html,
  });

  console.log(
    `Membership stopped email sent to ${email}`
  );

  return result;
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createTransporter,
  getFromAddress,
  sendEmail,
  verifyEmailConnection,

  // Contact
  sendContactEmail,

  // Membership
  sendMembershipApplicationEmail,
  sendBankDetailsEmail,
  sendPaymentReceivedEmail,
  sendMembershipConfirmationEmail,

  // Event / Program registration
  sendRegistrationEmail,

  sendMembershipRenewalReminderEmail,
  sendMembershipStoppedEmail,
};