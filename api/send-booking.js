export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, date, guests, address, service, message } = req.body;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hibachi Booking <onboarding@resend.dev>',
        to: ['shuilin9108@gmail.com'],
        reply_to: email,
        subject: '🔥 New Hibachi Booking Request',
        html: `
          <h2>New Booking Request</h2>
          <p><strong>Name:</strong> ${name || ''}</p>
          <p><strong>Phone:</strong> ${phone || ''}</p>
          <p><strong>Email:</strong> ${email || ''}</p>
          <p><strong>Date:</strong> ${date || ''}</p>
          <p><strong>Guests:</strong> ${guests || ''}</p>
          <p><strong>Address:</strong> ${address || ''}</p>
          <p><strong>Occasion:</strong> ${service || ''}</p>
          <p><strong>Details:</strong> ${message || ''}</p>
        `,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      return res.status(500).json({ error: data.message || 'Failed to send email', details: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}