export default async function handler(req, res) {
  console.log('SEND-BOOKING VERSION: booking@shuilink.com live test');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, date, guests, address, service, message } = req.body;

    const payload = {
      from: 'Hibachi Booking <booking@shuilink.com>',
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
    };

    console.log('RESEND PAYLOAD:', payload);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await resendResponse.json();
    console.log('RESEND RESPONSE STATUS:', resendResponse.status);
    console.log('RESEND RESPONSE DATA:', data);

    if (!resendResponse.ok) {
      return res.status(500).json({
        error: data.message || 'Failed to send email',
        details: data,
        debug_from: payload.from,
        debug_to: payload.to,
      });
    }

    return res.status(200).json({
      success: true,
      data,
      debug_from: payload.from,
      debug_to: payload.to,
    });
  } catch (error) {
    console.error('SEND-BOOKING ERROR:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}