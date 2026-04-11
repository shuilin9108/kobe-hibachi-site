export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = req.body;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Hibachi Booking <onboarding@resend.dev>",
      to: [
        "jasonzheng2016@gmail.com",
        "shuilin9108@gmail.com"
      ],
      subject: "🔥 New Hibachi Booking",
      html: `
        <h2>New Booking</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Guests:</strong> ${data.guests}</p>
      `,
    }),
  });

  const result = await response.json();

  res.status(200).json(result);
}