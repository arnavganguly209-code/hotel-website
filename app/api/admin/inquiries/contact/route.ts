import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const FOLDER_STATUSES = new Set(["inbox", "archived", "spam", "trash"]);
const PAGE_SIZE_DEFAULT = 20;

export async function GET(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder")?.trim() || "inbox";
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  const unreadOnly = searchParams.get("unread") === "1";
  const starredOnly = searchParams.get("starred") === "1";
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") || PAGE_SIZE_DEFAULT) || PAGE_SIZE_DEFAULT));
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

  const all = await db.contactEnquiry.findMany({
    orderBy: { createdAt: sort },
  });

  const filtered = all.filter((item) => {
    const itemFolder = FOLDER_STATUSES.has(item.status) ? item.status : "inbox";
    if (folder === "unread") {
      if (item.isRead || itemFolder === "trash" || itemFolder === "spam") return false;
    } else if (folder === "starred") {
      if (!item.starred || itemFolder === "trash") return false;
    } else if (folder === "all") {
      if (itemFolder === "trash") return false;
    } else if (folder !== "all" && itemFolder !== folder) {
      return false;
    }
    if (unreadOnly && item.isRead) return false;
    if (starredOnly && !item.starred) return false;
    if (from) {
      const fromDate = new Date(from);
      if (item.createdAt < fromDate) return false;
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      if (item.createdAt > toDate) return false;
    }
    if (q) {
      const hay =
        `${item.fullName} ${item.email} ${item.phone} ${item.subject} ${item.message} ${item.bookingType} ${item.sourcePage}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const inquiries = filtered.slice(start, start + pageSize);

  const counts = {
    inbox: all.filter((i) => (FOLDER_STATUSES.has(i.status) ? i.status : "inbox") === "inbox").length,
    unread: all.filter(
      (i) => !i.isRead && (FOLDER_STATUSES.has(i.status) ? i.status : "inbox") === "inbox"
    ).length,
    starred: all.filter((i) => i.starred && i.status !== "trash").length,
    archived: all.filter((i) => i.status === "archived").length,
    spam: all.filter((i) => i.status === "spam").length,
    trash: all.filter((i) => i.status === "trash").length,
  };

  return NextResponse.json({
    success: true,
    inquiries,
    total,
    page,
    pages,
    pageSize,
    counts,
  });
}

export async function PATCH(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
  }

  const body = (await req.json()) as {
    id?: number;
    ids?: number[];
    status?: string;
    isRead?: boolean;
    starred?: boolean;
    replied?: boolean;
    adminNotes?: string;
    action?: "mark_read" | "mark_unread" | "star" | "unstar" | "archive" | "spam" | "trash" | "restore";
  };

  const ids = [
    ...(Array.isArray(body.ids) ? body.ids.map(Number).filter((n) => Number.isFinite(n)) : []),
    ...(body.id && Number.isFinite(Number(body.id)) ? [Number(body.id)] : []),
  ];
  if (!ids.length) {
    return NextResponse.json({ success: false, error: "id or ids required" }, { status: 400 });
  }

  const data: {
    status?: string;
    isRead?: boolean;
    starred?: boolean;
    replied?: boolean;
    adminNotes?: string;
  } = {};

  if (body.action === "mark_read") data.isRead = true;
  if (body.action === "mark_unread") data.isRead = false;
  if (body.action === "star") data.starred = true;
  if (body.action === "unstar") data.starred = false;
  if (body.action === "archive") data.status = "archived";
  if (body.action === "spam") data.status = "spam";
  if (body.action === "trash") data.status = "trash";
  if (body.action === "restore") {
    data.status = "inbox";
  }

  if (body.status && FOLDER_STATUSES.has(body.status)) data.status = body.status;
  if (typeof body.isRead === "boolean") data.isRead = body.isRead;
  if (typeof body.starred === "boolean") data.starred = body.starred;
  if (typeof body.replied === "boolean") data.replied = body.replied;
  if (typeof body.adminNotes === "string") data.adminNotes = body.adminNotes;

  if (!Object.keys(data).length) {
    return NextResponse.json({ success: false, error: "No updates provided" }, { status: 400 });
  }

  await db.contactEnquiry.updateMany({
    where: { id: { in: ids } },
    data,
  });

  const inquiries = await db.contactEnquiry.findMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ success: true, inquiries, count: inquiries.length });
}

export async function DELETE(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");
  const idsParam = searchParams.get("ids");
  const ids = [
    ...(idParam ? [Number(idParam)] : []),
    ...(idsParam
      ? idsParam
          .split(",")
          .map((v) => Number(v.trim()))
          .filter((n) => Number.isFinite(n))
      : []),
  ];

  if (!ids.length) {
    try {
      const body = (await req.json()) as { ids?: number[]; id?: number };
      if (body.id) ids.push(Number(body.id));
      if (Array.isArray(body.ids)) ids.push(...body.ids.map(Number));
    } catch {
      /* no body */
    }
  }

  const unique = [...new Set(ids.filter((n) => Number.isFinite(n)))];
  if (!unique.length) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  await db.contactEnquiry.deleteMany({ where: { id: { in: unique } } });
  return NextResponse.json({ success: true, deleted: unique.length });
}
