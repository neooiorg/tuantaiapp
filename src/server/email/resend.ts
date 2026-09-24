import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL;
const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const resend = apiKey ? new Resend(apiKey) : null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!resend || !from) {
    console.warn(`[email] RESEND_API_KEY/RESEND_FROM_EMAIL chưa cấu hình — bỏ qua gửi: "${subject}"`);
    return;
  }
  try {
    await resend.emails.send({ from, to, subject, html });
  } catch (err) {
    console.error("[email] gửi thất bại:", err);
  }
}

export async function sendMemberInvite(to: string, name: string, roleLabel: string): Promise<void> {
  await send(
    to,
    "Bạn được thêm vào TuanTaiCRM",
    `<p>Xin chào ${escapeHtml(name)},</p>
     <p>Bạn đã được thêm vào <b>TuanTaiCRM</b> với vai trò <b>${escapeHtml(roleLabel)}</b>.</p>
     <p>Đăng nhập bằng Google tại <a href="${appUrl}/login">${appUrl}/login</a> (dùng đúng email này).</p>`,
  );
}

export async function sendRoleChanged(to: string, name: string, roleLabel: string): Promise<void> {
  await send(
    to,
    "Vai trò của bạn đã thay đổi",
    `<p>Xin chào ${escapeHtml(name)},</p>
     <p>Vai trò của bạn tại <b>TuanTaiCRM</b> đã được cập nhật thành <b>${escapeHtml(roleLabel)}</b>.</p>`,
  );
}

export async function sendMemberRemoved(to: string, name: string): Promise<void> {
  await send(
    to,
    "Tài khoản đã bị gỡ khỏi TuanTaiCRM",
    `<p>Xin chào ${escapeHtml(name)},</p>
     <p>Tài khoản của bạn đã bị gỡ khỏi <b>TuanTaiCRM</b>. Nếu có nhầm lẫn, vui lòng liên hệ quản trị viên.</p>`,
  );
}
