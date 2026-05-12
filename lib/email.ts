export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "MangBoh <onboarding@resend.dev>",
      to,
      subject: "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน",
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px;background:#0f0f12;color:#e2e8f0;border-radius:12px">
          <h2 style="margin:0 0 8px;font-size:20px">🔐 รีเซ็ตรหัสผ่าน MangBoh</h2>
          <p style="margin:0 0 24px;color:#94a3b8">ใช้รหัส OTP นี้เพื่อรีเซ็ตรหัสผ่านของคุณ</p>
          <div style="background:#1e1e2e;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;font-size:40px;font-weight:700;color:#818cf8">
            ${otp}
          </div>
          <p style="margin:24px 0 0;font-size:13px;color:#64748b">
            รหัสนี้จะหมดอายุใน <strong style="color:#e2e8f0">10 นาที</strong><br>
            ถ้าคุณไม่ได้ขอรีเซ็ตรหัสผ่าน ไม่ต้องทำอะไร
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Email send failed: ${body}`);
  }
}
