const nodemailer = require("nodemailer");

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "EMAIL_USER or EMAIL_PASSWORD is missing from environment variables"
    );
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,

    auth: {
      user,
      pass,
    },
  });
};


// ======================================================
// REGISTRATION EMAIL
// ======================================================

const sendRegistrationEmail = async ({
  name,
  email,
  title,
  registrationLink,
  type,
}) => {
  const transporter = createTransporter();

  const subject = `AMRI Registration – ${title}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,

    text: `
Hello ${name},

Thank you for your interest in AMRI.

You have requested registration information for:

${title}

Please use the link below to complete your registration:

${registrationLink}

If you have any questions, please contact the AMRI team.

Regards,
AMRI Team
`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: auto;
        color: #222;
        line-height: 1.6;
      ">

        <h2 style="margin-bottom: 10px;">
          AMRI Registration
        </h2>

        <p>
          Hello <strong>${name}</strong>,
        </p>

        <p>
          Thank you for your interest in AMRI.
        </p>

        <p>
          You have requested registration information for:
        </p>

        <div style="
          padding: 18px;
          margin: 20px 0;
          border: 1px solid #ddd;
          background: #fafafa;
        ">
          <strong>${title}</strong>
        </div>

        <p>
          Please click the button below to complete your registration:
        </p>

        <p style="margin: 30px 0;">
          <a
            href="${registrationLink}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background: #111;
              color: #fff;
              text-decoration: none;
              border-radius: 4px;
            "
          >
            Complete Registration →
          </a>
        </p>

        <p style="font-size: 13px; color: #666;">
          If the button does not work, copy and paste this link into your browser:
        </p>

        <p style="
          font-size: 13px;
          word-break: break-all;
        ">
          ${registrationLink}
        </p>

        <hr style="
          margin: 30px 0;
          border: none;
          border-top: 1px solid #ddd;
        " />

        <p style="font-size: 13px; color: #666;">
          Regards,<br />
          <strong>AMRI Team</strong>
        </p>

      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);

  console.log(
    `Registration email sent successfully to ${email}`
  );

  console.log("Message ID:", result.messageId);

  return result;
};


// ======================================================
// CONTACT FORM EMAIL
// ======================================================

const sendContactEmail = async ({
  name,
  email,
  message,
}) => {
  const transporter = createTransporter();

  const subject = `AMRI Contact Message – ${name} <${email}>`;

  const mailOptions = {
    // Your AMRI Gmail account
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,

    // Receive the contact message in AMRI Gmail
    to: process.env.EMAIL_USER,

    // Clicking Reply will reply to the visitor
    replyTo: email,

    subject,

    text: `
New message received from the AMRI website.

Name: ${name}
Email: ${email}

Message:
${message}

--------------------------------
AMRI Website Contact Form
`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: auto;
        color: #222;
        line-height: 1.6;
      ">

        <h2 style="margin-bottom: 10px;">
          New AMRI Website Message
        </h2>

        <p>
          You received a new message through the AMRI contact form.
        </p>

        <hr style="
          border: none;
          border-top: 1px solid #ddd;
          margin: 20px 0;
        " />

        <p>
          <strong>Name:</strong><br />
          ${name}
        </p>

        <p>
          <strong>Email:</strong><br />
          <a href="mailto:${email}">
            ${email}
          </a>
        </p>

        <p>
          <strong>Message:</strong>
        </p>

        <div style="
          padding: 18px;
          background: #f7f7f7;
          border: 1px solid #ddd;
          border-radius: 4px;
          white-space: pre-wrap;
        ">
          ${message}
        </div>

        <hr style="
          margin: 30px 0;
          border: none;
          border-top: 1px solid #ddd;
        " />

        <p style="
          font-size: 13px;
          color: #666;
        ">
          This message was submitted through the
          AMRI website contact form.
        </p>

        <p style="
          font-size: 13px;
          color: #666;
        ">
          Regards,<br />
          <strong>AMRI Website</strong>
        </p>

      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);

  console.log(
    `Contact email received from ${email}`
  );

  console.log(
    "Message ID:",
    result.messageId
  );

  return result;
};

const sendMembershipEmail = async ({
  name,
  email,
  membershipType,
}) => {
  const transporter = createTransporter();

  const subject = `AMRI Membership Request  – ${name} <${email}>`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,

    // AMRI receives the application
    to: process.env.EMAIL_USER,

    // Reply directly to the applicant
    replyTo: email,

    subject,

    text: `
New AMRI Membership Application

Full Name: ${name}
Email: ${email}
Membership Type: ${membershipType}

--------------------------------
AMRI Website Membership Form
`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: auto;
        color: #222;
        line-height: 1.6;
      ">

        <h2>New AMRI Membership Application</h2>

        <p>
          A new membership application has been submitted
          through the AMRI website.
        </p>

        <hr />

        <p>
          <strong>Full Name:</strong><br />
          ${name}
        </p>

        <p>
          <strong>Email:</strong><br />
          <a href="mailto:${email}">
            ${email}
          </a>
        </p>

        <p>
          <strong>Membership Type:</strong><br />
          ${membershipType}
        </p>

        <hr />

        <p style="font-size: 13px; color: #666;">
          This application was submitted through the
          AMRI website membership form.
        </p>

        <p style="font-size: 13px; color: #666;">
          Regards,<br />
          <strong>AMRI Website</strong>
        </p>

      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);

  console.log(
    `Membership application received from ${email}`
  );

  console.log(
    "Message ID:",
    result.messageId
  );

  return result;
};

// ======================================================
// VERIFY EMAIL CONNECTION
// ======================================================

const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();

    await transporter.verify();

    console.log(
      "Email server connection successful"
    );

    return true;
  } catch (error) {
    console.error(
      "Email server connection failed:",
      error.message
    );

    return false;
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  sendRegistrationEmail,
  sendContactEmail,
  sendMembershipEmail,
  verifyEmailConnection,
};