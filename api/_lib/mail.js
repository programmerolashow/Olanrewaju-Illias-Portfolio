// Outgoing email for subscriber confirmations and update notifications. Same Gmail account and settings as the
// contact form (backend/contact.mjs): EMAIL_USER and an App Password in EMAIL_PASS. Gmail allows roughly 500
// recipients a day from a personal account, which is the practical ceiling for one "Email subscribers" send.
import nodemailer from "nodemailer";

let transporter;

export const mailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getTransporter = () => {
  if (!transporter) {
    // Port 587 + STARTTLS: many networks block port 465 (the "gmail" service default), but allow 587.
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      connectionTimeout: 15000,
    });
  }
  return transporter;
};

/** @param {{ to: string, subject: string, text: string, html: string, headers?: Record<string, string> }} message */
export const sendMail = (message) =>
  getTransporter().sendMail({
    from: { name: "Olanrewaju Illias", address: process.env.EMAIL_USER },
    ...message,
  });

export const escapeHtml = (value) =>
  String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain, readable email body: one column, no images, a footer with the unsubscribe link when given. */
export const emailHtml = ({ heading, paragraphs, button, footer }) => `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#111827">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">
<h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(heading)}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.55">${escapeHtml(p)}</p>`).join("\n")}
${button ? `<p style="margin:22px 0"><a href="${escapeHtml(button.href)}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">${escapeHtml(button.label)}</a></p>` : ""}
${footer ? `<p style="margin:24px 0 0;font-size:12px;color:#6b7280;line-height:1.5">${footer}</p>` : ""}
</div></body></html>`;
