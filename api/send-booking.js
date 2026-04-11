function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function handler(req, res) {
  console.log("SEND-BOOKING VERSION: debug resend + sheet + deposit info");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  console.log("RESEND KEY EXISTS:", !!RESEND_API_KEY);
  console.log("REQ METHOD:", req.method);

  try {
    const {
      name = "",
      phone = "",
      email = "",
      date = "",
      guests = "",
      address = "",
      service = "",
      message = "",
    } = req.body || {};

    const cleanName = escapeHtml(name.trim());
    const cleanPhone = escapeHtml(phone.trim());
    const cleanEmail = escapeHtml(email.trim());
    const cleanDate = escapeHtml(date);
    const cleanGuests = escapeHtml(guests);
    const cleanAddress = escapeHtml(address.trim());
    const cleanService = escapeHtml(service);
    const cleanMessage = escapeHtml(message.trim());

    if (!cleanName || !cleanPhone || !cleanEmail || !cleanDate || !cleanGuests || !cleanAddress) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY in runtime");
      return res.status(500).json({
        error: "Server email configuration is missing",
      });
    }

    // 1. 发给老板
    const ownerPayload = {
      from: "Kobe Hibachi <booking@shuilink.com>",
      to: ["jasonzheng2016@gmail.com", "zjxinnn@gmail.com"],
      reply_to: cleanEmail,
      subject: "🔥 New Hibachi Booking Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🔥 New Booking Request</h2>
          <p><strong>Name:</strong> ${cleanName}</p>
          <p><strong>Phone:</strong> ${cleanPhone}</p>
          <p><strong>Click to Call:</strong> <a href="tel:${cleanPhone}">${cleanPhone}</a></p>
          <p><strong>Email:</strong> ${cleanEmail}</p>
          <p><strong>Date:</strong> ${cleanDate}</p>
          <p><strong>Guests:</strong> ${cleanGuests}</p>
          <p><strong>Address:</strong> ${cleanAddress}</p>
          <p><strong>Occasion:</strong> ${cleanService}</p>
          <p><strong>Details:</strong> ${cleanMessage || "None"}</p>
          <hr style="margin: 20px 0;" />
          <p><strong>Deposit:</strong> Customer should send a $50 Zelle deposit to secure the date.</p>
          <p><strong>Zelle recipient:</strong> SHIPING ZHENG</p>
          <p><strong>Zelle number:</strong> (646) 388-2989</p>
          <p><strong>Venmo:</strong> Coming soon</p>
        </div>
      `,
    };

    const ownerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ownerPayload),
    });

    const ownerData = await ownerResponse.json();

    console.log("OWNER EMAIL STATUS:", ownerResponse.status);
    console.log("OWNER EMAIL DATA:", ownerData);

    if (!ownerResponse.ok) {
      return res.status(500).json({
        error: ownerData.message || "Failed to send owner email",
        details: ownerData,
      });
    }

    // 2. 发给客户确认邮件
    if (cleanEmail && cleanEmail.includes("@")) {
      const customerPayload = {
        from: "Kobe Hibachi <booking@shuilink.com>",
        to: [cleanEmail],
        subject: "🔥 Your Hibachi Booking Request Received",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Hi ${cleanName || "there"} 👋</h2>
            <p>We’ve received your hibachi booking request 🔥</p>
            <p><strong>Date:</strong> ${cleanDate}</p>
            <p><strong>Guests:</strong> ${cleanGuests}</p>
            <p><strong>Location:</strong> ${cleanAddress}</p>
            <p><strong>Occasion:</strong> ${cleanService}</p>
            <br/>
            <p>To secure your date, please send a <strong>$50 deposit</strong> via Zelle.</p>
            <p><strong>Zelle recipient:</strong> SHIPING ZHENG</p>
            <p><strong>Zelle number:</strong> (646) 388-2989</p>
            <p>This is the authorized deposit recipient for Kobe Hibachi bookings.</p>
            <br/>
            <p><strong>Venmo:</strong> Coming soon</p>
            <p>After payment, please reply with a screenshot or text confirmation.</p>
            <br/>
            <p>Our team will contact you shortly to confirm your booking.</p>
            <br/>
            <p>Thank you for choosing <strong>Kobe Hibachi</strong> 🍱🔥</p>
            <p style="margin-top:20px;">– Kobe Hibachi Team</p>
          </div>
        `,
      };

      const customerResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerPayload),
      });

      const customerData = await customerResponse.json();

      console.log("CUSTOMER EMAIL STATUS:", customerResponse.status);
      console.log("CUSTOMER EMAIL DATA:", customerData);
    }

    // 3. 写入 Google Sheet（GET）
    try {
      const sheetUrl = new URL(
        "https://script.google.com/macros/s/AKfycbxuED6DlZxmwuXsYvyzFavXjXKmBd93UQ2EgEflUsaq_TxnZeJG4vOimyvQU2YcSBmt/exec"
      );

      sheetUrl.searchParams.set("name", name || "");
      sheetUrl.searchParams.set("phone", phone || "");
      sheetUrl.searchParams.set("email", email || "");
      sheetUrl.searchParams.set("date", date || "");
      sheetUrl.searchParams.set("guests", guests || "");
      sheetUrl.searchParams.set("address", address || "");
      sheetUrl.searchParams.set("service", service || "");
      sheetUrl.searchParams.set("message", message || "");

      const sheetResponse = await fetch(sheetUrl.toString(), {
        method: "GET",
      });

      const sheetText = await sheetResponse.text();

      console.log("GOOGLE SHEET STATUS:", sheetResponse.status);
      console.log("GOOGLE SHEET FINAL URL:", sheetResponse.url);
      console.log("GOOGLE SHEET RAW RESPONSE:", sheetText);
    } catch (sheetError) {
      console.error("GOOGLE SHEET ERROR:", sheetError);
    }

    return res.status(200).json({
      success: true,
      message: "Emails sent successfully and booking processed",
    });
  } catch (error) {
    console.error("SEND-BOOKING ERROR:", error);
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}