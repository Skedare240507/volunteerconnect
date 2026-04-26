import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const resend = new Resend(process.env.RESEND_API_KEY);

// The email address that receives all contact form submissions
const OWNER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || "your@email.com";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message, aiResponse } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Save to Firestore
    await addDoc(collection(db, "contactMessages"), {
      name,
      email,
      subject: subject || "General Inquiry",
      message,
      aiResponse: aiResponse || "",
      status: "new",
      createdAt: serverTimestamp(),
    });

    // 2. Send email notification to owner
    await resend.emails.send({
      from: "VolunteerConnect <onboarding@resend.dev>",
      to: OWNER_EMAIL,
      replyTo: email,
      subject: `📬 New Contact: ${subject || "General Inquiry"} — from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #e0e0e0; border-radius: 16px; overflow: hidden; border: 1px solid #1e3a5f;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1DB97520, #0A1628); padding: 32px 40px; border-bottom: 1px solid #1e3a5f;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff;">
              📬 New Contact Form Submission
            </h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #7a9ab8;">VolunteerConnect Platform</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 40px; space-y: 20px;">
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #1e3a5f; font-size: 12px; color: #7a9ab8; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; width: 30%;">From</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #1e3a5f; font-size: 14px; color: #ffffff; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #1e3a5f; font-size: 12px; color: #7a9ab8; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #1e3a5f; font-size: 14px; color: #1DB975;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #1e3a5f; font-size: 12px; color: #7a9ab8; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Subject</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #1e3a5f; font-size: 14px; color: #ffffff;">${subject || "General Inquiry"}</td>
              </tr>
            </table>

            <div style="background: #0F2137; border: 1px solid #1e3a5f; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #7a9ab8; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Message</p>
              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #c8d8e8; white-space: pre-wrap;">${message}</p>
            </div>

            ${aiResponse ? `
            <div style="background: #1DB97508; border: 1px solid #1DB97530; border-radius: 12px; padding: 20px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #1DB975; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">✨ AI Preview Response (shown to user)</p>
              <p style="margin: 0; font-size: 13px; line-height: 1.7; color: #9abccc; font-style: italic;">${aiResponse}</p>
            </div>
            ` : ""}
          </div>

          <!-- Footer -->
          <div style="padding: 20px 40px; border-top: 1px solid #1e3a5f; background: #07101f;">
            <p style="margin: 0; font-size: 12px; color: #4a6a8a;">
              This email was sent from the <strong>VolunteerConnect</strong> contact form.<br/>
              Reply directly to this email to respond to ${name}.
            </p>
          </div>
        </div>
      `,
    });

    // 3. Send confirmation email to the user
    await resend.emails.send({
      from: "VolunteerConnect <onboarding@resend.dev>",
      to: email,
      subject: "✅ We received your message — VolunteerConnect",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0A1628; color: #e0e0e0; border-radius: 16px; overflow: hidden; border: 1px solid #1e3a5f;">
          <div style="background: linear-gradient(135deg, #1DB97530, #0A1628); padding: 40px; text-align: center; border-bottom: 1px solid #1e3a5f;">
            <div style="width: 60px; height: 60px; background: #1DB97520; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px;">✅</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff;">Message Received!</h1>
            <p style="margin: 8px 0 0; color: #7a9ab8;">Hi ${name}, thanks for reaching out.</p>
          </div>
          <div style="padding: 32px 40px;">
            <p style="font-size: 15px; line-height: 1.7; color: #c8d8e8;">We've received your message regarding <strong style="color: #ffffff;">"${subject}"</strong> and our team will get back to you within <strong style="color: #1DB975;">24 hours</strong>.</p>
            <div style="background: #0F2137; border-radius: 12px; padding: 16px 20px; border-left: 3px solid #1DB975; margin: 24px 0;">
              <p style="margin: 0; font-size: 13px; color: #9abccc; line-height: 1.6;">"${message.substring(0, 150)}${message.length > 150 ? "..." : ""}"</p>
            </div>
            <p style="font-size: 13px; color: #7a9ab8; line-height: 1.7;">In the meantime, feel free to explore the <a href="https://volunteerconnect.in" style="color: #1DB975;">VolunteerConnect platform</a> or follow us for updates.</p>
          </div>
          <div style="padding: 20px 40px; border-top: 1px solid #1e3a5f; background: #07101f;">
            <p style="margin: 0; font-size: 12px; color: #4a6a8a; text-align: center;">© 2025 VolunteerConnect · Google Solution Challenge 2025</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
