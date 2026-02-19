/**
 * email.service.js — Nodemailer transport
 *
 * Env vars required in server/.env:
 *   EMAIL_HOST     = smtp.gmail.com (or relay host)
 *   EMAIL_PORT     = 587
 *   EMAIL_USER     = your Gmail address
 *   EMAIL_PASS     = App Password (not your login password)
 *   EMAIL_FROM     = "Workify Pro <youremail@gmail.com>"
 */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,           // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send the OTP to the job-poster (user).
 *
 * @param {string} toEmail     – user's registered email
 * @param {string} userName    – user's first name for personalisation
 * @param {string} otp         – 4-digit code
 * @param {string} taskTitle   – task display name
 * @param {string} workerName  – worker's name
 */
export async function sendOTPEmail({ toEmail, userName, otp, taskTitle, workerName }) {
  const from = process.env.EMAIL_FROM || `"Workify Pro" <${process.env.EMAIL_USER}>`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Worker Arrival OTP</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08)">

          <!-- Header -->
          <tr>
            <td style="background:#000;padding:28px 40px;text-align:center">
              <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-1px;text-transform:uppercase">
                Workify Pro
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px">
              <p style="color:#374151;font-size:15px;margin:0 0 16px">Hi <strong>${userName || "there"}</strong>,</p>
              <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.6">
                Your worker <strong>${workerName}</strong> has arrived at the task location for:
              </p>

              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:32px">
                <p style="margin:0;color:#111827;font-size:16px;font-weight:700">${taskTitle}</p>
              </div>

              <p style="color:#374151;font-size:14px;margin:0 0 16px">
                Share the following <strong>one-time code</strong> with the worker to verify arrival:
              </p>

              <!-- OTP Box -->
              <div style="background:#000;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px">
                <span style="color:#fff;font-size:48px;font-weight:900;letter-spacing:14px;font-family:monospace">
                  ${otp}
                </span>
              </div>

              <p style="color:#6b7280;font-size:13px;margin:0 0 8px">
                ⏱️ This code expires in <strong>10 minutes</strong>.
              </p>
              <p style="color:#6b7280;font-size:13px;margin:0">
                🔒 Do not share this code with anyone other than your assigned worker.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center">
              <p style="color:#9ca3af;font-size:11px;margin:0;letter-spacing:0.5px">
                © 2026 WORKIFY PRO · You received this because you created a task on our platform.
              </p>
            </td>
          </tr>

        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `🔑 Your Worker Arrival OTP: ${otp} — ${taskTitle}`,
    html,
    text: `Your worker arrival OTP for task "${taskTitle}" is: ${otp}. This code expires in 10 minutes.`,
  });
}
