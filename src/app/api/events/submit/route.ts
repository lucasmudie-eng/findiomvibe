// src/app/api/events/submit/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// you already have ADMIN_EMAIL in .env.local from earlier work
const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY env vars for /api/events/submit."
  );
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let payload: any = {};

    if (contentType.includes("application/json")) {
      // JSON payload (if you ever call this route via fetch JSON)
      payload = await req.json();
    } else {
      // FormData payload (what your submit page is using)
      const form = await req.formData();
      payload = {
        title: form.get("title") ?? "",
        venue: form.get("venue") ?? "",
        category: form.get("category") ?? "other",
        summary: form.get("summary") ?? "",
        description: form.get("description") ?? "",
        ticket_url: form.get("ticket_url") ?? "",
        starts_at: form.get("starts_at") ?? "",
        ends_at: form.get("ends_at") ?? "",
        image_url: form.get("image_url") ?? "",
        recurring:
          form.get("recurring") === "on" ||
          form.get("recurring") === "true",
        recurring_frequency: form.get("recurring_frequency") ?? "",
        recurring_notes: form.get("recurring_notes") ?? "",
        organiser_name: form.get("organiser_name") ?? "",
        organiser_email: form.get("organiser_email") ?? "",
      };
    }

    const {
      title,
      venue,
      category,
      summary,
      description,
      ticket_url,
      starts_at,
      ends_at,
      image_url,
      recurring,
      recurring_frequency,
      recurring_notes,
      organiser_name,
      organiser_email,
    } = payload;

    if (!title || !starts_at || !venue) {
      return NextResponse.json(
        { error: "Missing required fields (title, starts_at, venue)." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { persistSession: false },
    });

    // Insert event as pending approval (matches your old direct-insert fields)
    const { data, error } = await supabase
      .from("events")
      .insert({
        title,
        venue,
        category: category || "other",
        summary: summary || null,
        description: description || null,
        ticket_url: ticket_url || null,
        starts_at,
        ends_at: ends_at || null,
        image_url: image_url || null,
        organiser_name: organiser_name || null,
        organiser_email: organiser_email || null,
        is_recurring: !!recurring,
        recurrence_frequency: recurring ? recurring_frequency || null : null,
        recurrence_notes: recurring ? recurring_notes || null : null,
        approved: false,
        featured: false,
      })
      .select("id, title, venue, starts_at, category")
      .single();

    if (error) {
      console.error("[api/events/submit] insert error", error);
      return NextResponse.json(
        { error: "Failed to submit event." },
        { status: 500 }
      );
    }

    // Optional admin email
    if (resendApiKey && adminEmail) {
      try {
        const resend = new Resend(resendApiKey);

        const startsLabel = starts_at
          ? new Date(starts_at).toLocaleString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A";

        await resend.emails.send({
          from: "ManxHive <no-reply@manxhive.com>",
          to: adminEmail,
          subject: `New event submitted: ${title}`,
          html: `
            <h2>New event submitted</h2>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Venue:</strong> ${venue}</p>
            <p><strong>When:</strong> ${startsLabel}</p>
            <p><strong>Category:</strong> ${category || "other"}</p>
            <p><strong>Summary:</strong> ${
              summary || "(none provided)"
            }</p>
            <p><strong>Ticket URL:</strong> ${
              ticket_url || "(none provided)"
            }</p>
            <p><strong>Recurring:</strong> ${
              recurring ? "Yes" : "No"
            } ${
            recurring && recurring_frequency
              ? `(${recurring_frequency})`
              : ""
          }</p>
            ${
              organiser_name || organiser_email
                ? `<p><strong>Organiser:</strong> ${organiser_name || "(no name)"} &lt;${
                    organiser_email || "no email"
                  }&gt;</p>`
                : ""
            }
            ${
              recurring && recurring_notes
                ? `<p><strong>Recurrence notes:</strong> ${recurring_notes}</p>`
                : ""
            }
            <p style="margin-top:16px;">
              <a href="${
                process.env.NEXT_PUBLIC_SITE_URL || "https://manxhive.com"
              }/control-room" target="_blank">
                Open Control Room to approve
              </a>
            </p>
          `,
        });
      } catch (err) {
        console.error("[api/events/submit] email error", err);
        // don't fail whole request if email dies
      }
    }

    // If it ever comes from a plain HTML form (not your React fetch)
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const url = new URL("/whats-on?submitted=1", req.url);
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ ok: true, event: data });
  } catch (err) {
    console.error("[api/events/submit] unexpected error", err);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}