import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const resendFrom =
  process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "hello@manxhive.com";
const supportEmail = process.env.SUPPORT_EMAIL || "hello@manxhive.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, category, message, extra } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Name, email and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const extraHtml = extra && Object.keys(extra).length
      ? `<table style="border-collapse:collapse;width:100%;margin-top:12px">
          ${Object.entries(extra)
            .filter(([, v]) => v)
            .map(
              ([k, v]) =>
                `<tr><td style="padding:4px 8px;background:#f8fafc;font-size:12px;color:#64748b;white-space:nowrap;border:1px solid #e2e8f0">${k}</td>
                 <td style="padding:4px 8px;font-size:13px;border:1px solid #e2e8f0">${v}</td></tr>`
            )
            .join("")}
        </table>`
      : "";

    if (resendKey) {
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: resendFrom,
        to: supportEmail,
        replyTo: email.trim(),
        subject: `[ManxHive] ${category ?? "General enquiry"} from ${name.trim()}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;line-height:1.6">
            <div style="background:#0f172a;padding:20px 24px;border-radius:8px 8px 0 0">
              <h2 style="color:#fff;margin:0;font-size:18px">New contact form submission</h2>
              <p style="color:#94a3b8;margin:4px 0 0;font-size:13px">ManxHive · ${new Date().toLocaleString("en-GB")}</p>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;background:#fff;border-radius:0 0 8px 8px">
              <table style="border-collapse:collapse;width:100%">
                <tr>
                  <td style="padding:4px 8px;background:#f8fafc;font-size:12px;color:#64748b;white-space:nowrap;border:1px solid #e2e8f0">Name</td>
                  <td style="padding:4px 8px;font-size:13px;border:1px solid #e2e8f0">${name.trim()}</td>
                </tr>
                <tr>
                  <td style="padding:4px 8px;background:#f8fafc;font-size:12px;color:#64748b;white-space:nowrap;border:1px solid #e2e8f0">Email</td>
                  <td style="padding:4px 8px;font-size:13px;border:1px solid #e2e8f0">${email.trim()}</td>
                </tr>
                <tr>
                  <td style="padding:4px 8px;background:#f8fafc;font-size:12px;color:#64748b;white-space:nowrap;border:1px solid #e2e8f0">Category</td>
                  <td style="padding:4px 8px;font-size:13px;border:1px solid #e2e8f0">${category ?? "—"}</td>
                </tr>
                ${extraHtml ? "" : ""}
              </table>
              ${extraHtml}
              <div style="margin-top:16px;padding:12px 16px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0">
                <p style="margin:0;font-size:13px;white-space:pre-wrap">${message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
              </div>
              <p style="margin-top:16px;font-size:12px;color:#94a3b8">Reply to this email to respond directly to ${name.trim()}.</p>
            </div>
          </div>
        `,
      });

      await resend.emails.send({
        from: resendFrom,
        to: email.trim(),
        subject: "We've received your message – ManxHive",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;line-height:1.6">
            <div style="background:#0f172a;padding:20px 24px;border-radius:8px 8px 0 0">
              <h2 style="color:#fff;margin:0;font-size:18px">Thanks for getting in touch, ${name.trim().split(" ")[0]}.</h2>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;background:#fff;border-radius:0 0 8px 8px">
              <p style="color:#475569;font-size:14px">We've received your message and will get back to you within 1–2 working days.</p>
              <p style="color:#475569;font-size:14px">In the meantime, feel free to browse <a href="https://manxhive.com" style="color:#E8002D">manxhive.com</a>.</p>
              <p style="margin-top:20px;font-size:12px;color:#94a3b8">— The ManxHive team</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json({ ok: false, error: "Server error. Please try again." }, { status: 500 });
  }
}
