import { Resend } from "resend";
import { formatVnd } from "@/lib/format";

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

async function send(to: string | string[], subject: string, html: string): Promise<void> {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!resend || !from) {
    console.warn(`[email] RESEND_API_KEY/RESEND_FROM_EMAIL chưa cấu hình — bỏ qua gửi: "${subject}"`);
    return;
  }
  if (recipients.length === 0) {
    console.warn(`[email] không có người nhận — bỏ qua gửi: "${subject}"`);
    return;
  }
  try {
    await resend.emails.send({ from, to: recipients, subject, html });
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

export type QuoteEmailItem = { name: string; quantity: number; unitPrice: number };

// Notify admins when a salesperson creates a quote — includes the total and line items.
export async function sendQuoteCreatedToAdmins(
  adminEmails: string[],
  data: {
    leadId: string;
    leadName: string;
    leadPhone: string;
    salesName: string;
    total: number;
    note: string | null;
    items: QuoteEmailItem[];
  },
): Promise<void> {
  const rows = data.items
    .map(
      (it) =>
        `<tr>
           <td style="padding:4px 8px;border:1px solid #e5e7eb">${escapeHtml(it.name)}</td>
           <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:right">${it.quantity}</td>
           <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:right">${escapeHtml(formatVnd(it.unitPrice))}</td>
           <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:right">${escapeHtml(formatVnd(it.quantity * it.unitPrice))}</td>
         </tr>`,
    )
    .join("");

  await send(
    adminEmails,
    `Báo giá mới: ${data.leadName} — ${formatVnd(data.total)}`,
    `<p><b>${escapeHtml(data.salesName)}</b> vừa tạo báo giá cho khách <b>${escapeHtml(data.leadName)}</b> (${escapeHtml(data.leadPhone)}).</p>
     <p>Tổng báo giá: <b>${escapeHtml(formatVnd(data.total))}</b></p>
     <table style="border-collapse:collapse;font-size:14px">
       <thead>
         <tr>
           <th style="padding:4px 8px;border:1px solid #e5e7eb;text-align:left">Hạng mục</th>
           <th style="padding:4px 8px;border:1px solid #e5e7eb;text-align:right">SL</th>
           <th style="padding:4px 8px;border:1px solid #e5e7eb;text-align:right">Đơn giá</th>
           <th style="padding:4px 8px;border:1px solid #e5e7eb;text-align:right">Thành tiền</th>
         </tr>
       </thead>
       <tbody>${rows}</tbody>
     </table>
     ${data.note ? `<p>Ghi chú: ${escapeHtml(data.note)}</p>` : ""}
     <p><a href="${appUrl}/crm/leads/${data.leadId}">Xem chi tiết lead</a></p>`,
  );
}
