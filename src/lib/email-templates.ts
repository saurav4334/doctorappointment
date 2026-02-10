const baseWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .body { padding: 32px; color: #334155; line-height: 1.6; }
    .body h2 { color: #0f172a; margin-top: 0; }
    .info-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .info-label { font-weight: 600; color: #475569; }
    .info-value { color: #0f172a; }
    .btn { display: inline-block; padding: 12px 32px; background: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .footer { padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-confirmed { background: #dcfce7; color: #166534; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-completed { background: #dbeafe; color: #1e40af; }
    .status-scheduled { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div style="padding: 24px;">
    <div class="container">
      <div class="header">
        <h1>MediCare</h1>
      </div>
      ${content}
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} MediCare. All rights reserved.</p>
        <p>This is an automated email. Please do not reply directly.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

export function welcomeEmail(name: string) {
  return {
    subject: "Welcome to MediCare!",
    html: baseWrapper(`
      <div class="body">
        <h2>Welcome, ${name}! 🎉</h2>
        <p>Thank you for creating your MediCare account. We're excited to help you manage your healthcare needs.</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Book appointments with top doctors</li>
          <li>View your appointment history</li>
          <li>Get reminders for upcoming visits</li>
        </ul>
        <p>Get started by booking your first appointment today!</p>
      </div>
    `),
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Reset Your Password - MediCare",
    html: baseWrapper(`
      <div class="body">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
      </div>
    `),
  };
}

export function bookingConfirmationEmail(details: {
  patientName: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  time: string;
  appointmentNumber: string;
  department?: string;
}) {
  return {
    subject: `Appointment Confirmed - ${details.appointmentNumber}`,
    html: baseWrapper(`
      <div class="body">
        <h2>Appointment Confirmed ✅</h2>
        <p>Dear ${details.patientName},</p>
        <p>Your appointment has been successfully booked!</p>
        <div class="info-box">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label" style="padding: 8px 0;">Appointment #</td><td class="info-value" style="padding: 8px 0;">${details.appointmentNumber}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Doctor</td><td class="info-value" style="padding: 8px 0;">${details.doctorName}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Hospital</td><td class="info-value" style="padding: 8px 0;">${details.hospitalName}</td></tr>
            ${details.department ? `<tr><td class="info-label" style="padding: 8px 0;">Department</td><td class="info-value" style="padding: 8px 0;">${details.department}</td></tr>` : ""}
            <tr><td class="info-label" style="padding: 8px 0;">Date</td><td class="info-value" style="padding: 8px 0;">${details.date}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Time</td><td class="info-value" style="padding: 8px 0;">${details.time}</td></tr>
          </table>
        </div>
        <p>Please arrive 15 minutes before your scheduled time.</p>
      </div>
    `),
  };
}

export function appointmentStatusEmail(details: {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  appointmentNumber: string;
  status: string;
  reason?: string;
}) {
  const statusClass =
    details.status === "confirmed" ? "status-confirmed" :
    details.status === "cancelled" ? "status-cancelled" :
    details.status === "completed" ? "status-completed" :
    "status-scheduled";

  const statusLabel = details.status.charAt(0).toUpperCase() + details.status.slice(1);

  return {
    subject: `Appointment ${statusLabel} - ${details.appointmentNumber}`,
    html: baseWrapper(`
      <div class="body">
        <h2>Appointment Status Update</h2>
        <p>Dear ${details.patientName},</p>
        <p>Your appointment status has been updated:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="info-box">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label" style="padding: 8px 0;">Appointment #</td><td class="info-value" style="padding: 8px 0;">${details.appointmentNumber}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Doctor</td><td class="info-value" style="padding: 8px 0;">${details.doctorName}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Date</td><td class="info-value" style="padding: 8px 0;">${details.date}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Time</td><td class="info-value" style="padding: 8px 0;">${details.time}</td></tr>
          </table>
        </div>
        ${details.reason ? `<p><strong>Reason:</strong> ${details.reason}</p>` : ""}
      </div>
    `),
  };
}

export function appointmentReminderEmail(details: {
  patientName: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  time: string;
  appointmentNumber: string;
}) {
  return {
    subject: `Reminder: Appointment Tomorrow - ${details.appointmentNumber}`,
    html: baseWrapper(`
      <div class="body">
        <h2>Appointment Reminder ⏰</h2>
        <p>Dear ${details.patientName},</p>
        <p>This is a friendly reminder about your upcoming appointment:</p>
        <div class="info-box">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label" style="padding: 8px 0;">Appointment #</td><td class="info-value" style="padding: 8px 0;">${details.appointmentNumber}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Doctor</td><td class="info-value" style="padding: 8px 0;">${details.doctorName}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Hospital</td><td class="info-value" style="padding: 8px 0;">${details.hospitalName}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Date</td><td class="info-value" style="padding: 8px 0;">${details.date}</td></tr>
            <tr><td class="info-label" style="padding: 8px 0;">Time</td><td class="info-value" style="padding: 8px 0;">${details.time}</td></tr>
          </table>
        </div>
        <p>Please arrive 15 minutes before your scheduled time. Don't forget to bring your ID and any relevant medical records.</p>
      </div>
    `),
  };
}

export function doctorAssignmentEmail(details: {
  doctorName: string;
  hospitalName: string;
  department?: string;
}) {
  return {
    subject: `New Hospital Assignment - ${details.hospitalName}`,
    html: baseWrapper(`
      <div class="body">
        <h2>New Hospital Assignment 🏥</h2>
        <p>Dear ${details.doctorName},</p>
        <p>You have been assigned to a new hospital:</p>
        <div class="info-box">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label" style="padding: 8px 0;">Hospital</td><td class="info-value" style="padding: 8px 0;">${details.hospitalName}</td></tr>
            ${details.department ? `<tr><td class="info-label" style="padding: 8px 0;">Department</td><td class="info-value" style="padding: 8px 0;">${details.department}</td></tr>` : ""}
          </table>
        </div>
        <p>Please log in to your dashboard for more details.</p>
      </div>
    `),
  };
}
