export default async function handler(req, res) {
  console.log('SEND-BOOKING VERSION: dual email + google sheet redirect fix');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, date, guests, address, service, message } = req.body;

    // 1. 发给老板
    const ownerPayload = {
      from: 'Kobe Hibachi <booking@shuilink.com>',
      to: ['jasonzheng2016@gmail.com', 'zjxinnn@gmail.com'],
      reply_to: email,
      subject: '🔥 New Hibachi Booking Request',
      html: `
        <h2>🔥 New Booking Request</h2>
        <p><strong>Name:</strong> ${name || ''}</p>
        <p><strong>Phone:</strong> ${phone || ''}</p>
        <p><strong>Click to Call:</strong> <a href="tel:${phone || ''}">${phone || ''}</a></p>
        <p><strong>Email:</strong> ${email || ''}</p>
        <p><strong>Date:</strong> ${date || ''}</p>
        <p><strong>Guests:</strong> ${guests || ''}</p>
        <p><strong>Address:</strong> ${address || ''}</p>
        <p><strong>Occasion:</strong> ${service || ''}</p>
        <p><strong>Details:</strong> ${message || ''}</p>
      `,
    };

    const ownerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ownerPayload),
    });

    const ownerData = await ownerResponse.json();

    console.log('OWNER EMAIL STATUS:', ownerResponse.status);
    console.log('OWNER EMAIL DATA:', ownerData);

    if (!ownerResponse.ok) {
      return res.status(500).json({
        error: ownerData.message || 'Failed to send owner email',
        details: ownerData,
      });
    }

    // 2. 发给客户确认邮件
    if (email && email.includes('@')) {
      const customerPayload = {
        from: 'Kobe Hibachi <booking@shuilink.com>',
        to: [email],
        subject: '🔥 Your Hibachi Booking Request Received',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Hi ${name || 'there'} 👋</h2>
            <p>We’ve received your hibachi booking request 🔥</p>
            <p><strong>Date:</strong> ${date || ''}</p>
            <p><strong>Guests:</strong> ${guests || ''}</p>
            <p><strong>Location:</strong> ${address || ''}</p>
            <p><strong>Occasion:</strong> ${service || ''}</p>
            <br/>
            <p>Our team will contact you shortly to confirm your booking.</p>
            <br/>
            <p>Thank you for choosing <strong>Kobe Hibachi</strong> 🍱🔥</p>
            <p style="margin-top:20px;">– Kobe Hibachi Team</p>
          </div>
        `,
      };

      const customerResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerPayload),
      });

      const customerData = await customerResponse.json();

      console.log('CUSTOMER EMAIL STATUS:', customerResponse.status);
      console.log('CUSTOMER EMAIL DATA:', customerData);
    }

    // 3. 写入 Google Sheet（手动处理 redirect）
    try {
      const params = new URLSearchParams({
        name: name || '',
        phone: phone || '',
        email: email || '',
        date: date || '',
        guests: guests || '',
        address: address || '',
        service: service || '',
        message: message || '',
      });

      const scriptUrl =
        'https://script.google.com/macros/s/AKfycbxuED6DIZxmwuXsYvyzFavXjXKmBd93UQ2EgEfIUsaq_TxnZeJG4vOimyyQU2YcSBmt/exec';

      const firstResponse = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        redirect: 'manual',
      });

      const redirectUrl = firstResponse.headers.get('location');

      console.log('GOOGLE SHEET FIRST STATUS:', firstResponse.status);
      console.log('GOOGLE SHEET REDIRECT URL:', redirectUrl);

      let finalResponse;

      if (redirectUrl) {
        finalResponse = await fetch(redirectUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });
      } else {
        finalResponse = firstResponse;
      }

      const finalText = await finalResponse.text();

      console.log('GOOGLE SHEET FINAL STATUS:', finalResponse.status);
      console.log('GOOGLE SHEET FINAL URL:', finalResponse.url);
      console.log('GOOGLE SHEET RAW RESPONSE:', finalText);
    } catch (sheetError) {
      console.error('GOOGLE SHEET ERROR:', sheetError);
    }

    return res.status(200).json({
      success: true,
      message: 'Emails sent successfully and booking processed',
    });
  } catch (error) {
    console.error('SEND-BOOKING ERROR:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}