import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import {
  copyDailyInventoryAndRates,
  getInventoryManageGrid,
  nightsInStay,
  upsertDailyInventoryAllotments,
  upsertDailyOccupancyRates,
} from "@/lib/admin/availability";
import { defaultOccupancyRateFromRoom } from "@/lib/booking/daily-rates";
import { getContent } from "@/lib/cms/store";
import { isLiveRoomCategory, roomPublicSlug } from "@/lib/booking/utils";

export const dynamic = "force-dynamic";

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function localToday(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const startDate = (url.searchParams.get("start") || localToday()).trim();
  const daysParam = Number(url.searchParams.get("days") || "18");
  const days = Math.min(62, Math.max(7, Number.isFinite(daysParam) ? Math.round(daysParam) : 18));
  const endDateInclusive = addDaysIso(startDate, days - 1);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return NextResponse.json({ success: false, error: "Invalid start date" }, { status: 400 });
  }

  const content = await getContent();
  const liveRooms = content.rooms.filter(isLiveRoomCategory);
  const roomSlugs = liveRooms.map((r) => ({
    slug: roomPublicSlug(r),
    name: r.name,
  }));

  const slugFilter = (url.searchParams.get("rooms") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const selected =
    slugFilter.length > 0
      ? roomSlugs.filter((r) => slugFilter.includes(r.slug))
      : roomSlugs;

  const grid = await getInventoryManageGrid({
    roomSlugs: selected,
    startDate,
    endDateInclusive,
  });

  const rooms = grid.rooms.map((row) => {
    const cms = liveRooms.find((r) => roomPublicSlug(r) === row.roomSlug);
    const fallback = cms
      ? defaultOccupancyRateFromRoom(cms)
      : {
          adult1: 0,
          adult2: 0,
          adult3: 0,
          includedChildren: 0,
          extraChildPrice: 0,
        };
    const rateDefaults = row.rateDefaults
      ? {
          adult1: row.rateDefaults.adult1 || fallback.adult1,
          adult2: row.rateDefaults.adult2 || fallback.adult2,
          adult3: row.rateDefaults.adult3 || fallback.adult3,
          includedChildren:
            row.rateDefaults.includedChildren >= 0
              ? row.rateDefaults.includedChildren
              : fallback.includedChildren,
          extraChildPrice:
            row.rateDefaults.extraChildPrice >= 0
              ? row.rateDefaults.extraChildPrice
              : fallback.extraChildPrice,
        }
      : fallback;
    return {
      ...row,
      rateDefaults,
      days: row.days.map((day) =>
        day.hasDailyRate
          ? day
          : {
              ...day,
              adult1: day.adult1 || rateDefaults.adult1,
              adult2: day.adult2 || rateDefaults.adult2,
              adult3: day.adult3 || rateDefaults.adult3,
              includedChildren:
                day.includedChildren >= 0 ? day.includedChildren : rateDefaults.includedChildren,
              extraChildPrice:
                day.extraChildPrice >= 0 ? day.extraChildPrice : rateDefaults.extraChildPrice,
            }
      ),
    };
  });

  return NextResponse.json(
    {
      success: true,
      startDate,
      endDateInclusive,
      days,
      categories: roomSlugs,
      dates: grid.dates,
      rooms,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

type ManageAction =
  | "set"
  | "close"
  | "open"
  | "copy"
  | "set-rates";

export async function PUT(req: Request) {
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

  try {
    const body = (await req.json()) as {
      action?: ManageAction;
      roomSlug?: string;
      startDate?: string;
      endDate?: string;
      date?: string;
      inventory?: number;
      sourceDate?: string;
      targetStart?: string;
      targetEnd?: string;
      asDefaults?: boolean;
      adult1?: number;
      adult2?: number;
      adult3?: number;
      includedChildren?: number;
      extraChildPrice?: number;
    };

    const roomSlug = body.roomSlug?.trim() || "";
    if (!roomSlug) {
      return NextResponse.json({ success: false, error: "roomSlug is required" }, { status: 400 });
    }

    const action = body.action || "set";

    if (action === "copy") {
      const sourceDate = body.sourceDate?.trim() || "";
      const targetStart = body.targetStart?.trim() || body.startDate?.trim() || "";
      const targetEnd = body.targetEnd?.trim() || body.endDate?.trim() || targetStart;
      if (!sourceDate || !targetStart) {
        return NextResponse.json(
          { success: false, error: "sourceDate and target range are required" },
          { status: 400 }
        );
      }
      const end = targetEnd >= targetStart ? targetEnd : targetStart;
      const targetDates = nightsInStay(targetStart, addDaysIso(end, 1));
      const overrides = await copyDailyInventoryAndRates({
        roomSlug,
        sourceDate,
        targetDates,
      });
      return NextResponse.json({
        success: true,
        action: "copy",
        overrides,
        datesUpdated: targetDates.length,
      });
    }

    // Single cell or range
    let dates: string[] = [];
    if (body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      dates = [body.date];
    } else {
      const start = body.startDate?.trim() || "";
      const endRaw = body.endDate?.trim() || start;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) {
        return NextResponse.json({ success: false, error: "Valid date or range required" }, { status: 400 });
      }
      const end = endRaw >= start ? endRaw : start;
      dates = nightsInStay(start, addDaysIso(end, 1));
    }

    if (dates.length === 0) {
      return NextResponse.json({ success: false, error: "No dates to update" }, { status: 400 });
    }
    if (dates.length > 400) {
      return NextResponse.json({ success: false, error: "Date range too large (max 400 nights)" }, { status: 400 });
    }

    if (action === "set-rates") {
      const patch = {
        adult1: body.adult1,
        adult2: body.adult2,
        adult3: body.adult3,
        includedChildren: body.includedChildren,
        extraChildPrice: body.extraChildPrice,
      };
      const hasField = Object.values(patch).some((v) => typeof v === "number" && Number.isFinite(v));
      if (!hasField) {
        return NextResponse.json({ success: false, error: "Provide at least one rate field" }, { status: 400 });
      }
      const overrides = await upsertDailyOccupancyRates({
        roomSlug,
        dates,
        patch,
        asDefaults: Boolean(body.asDefaults),
      });
      return NextResponse.json({
        success: true,
        action,
        roomSlug,
        datesUpdated: dates.length,
        overrides,
      });
    }

    let inventory: number | null = null;
    if (action === "close") {
      inventory = 0;
    } else if (action === "open") {
      inventory = null; // clear daily → fall back to base sellable
    } else {
      if (typeof body.inventory !== "number" || !Number.isFinite(body.inventory) || body.inventory < 0) {
        return NextResponse.json(
          { success: false, error: "inventory must be a number ≥ 0" },
          { status: 400 }
        );
      }
      inventory = Math.floor(body.inventory);
    }

    const overrides = await upsertDailyInventoryAllotments({
      roomSlug,
      dates,
      inventory,
    });

    return NextResponse.json({
      success: true,
      action,
      roomSlug,
      datesUpdated: dates.length,
      inventory,
      overrides,
    });
  } catch (error) {
    console.error("[InventoryManage]", error);
    return NextResponse.json({ success: false, error: "Unable to update inventory" }, { status: 500 });
  }
}
