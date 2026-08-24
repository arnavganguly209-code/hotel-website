"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import type { PageSeo } from "@/lib/cms/types";
import { ROBOTS_OPTIONS } from "@/lib/seo/robots";

type Tab = "global" | "pages" | "rooms" | "articles" | "contact";

type PageRow = {
  id: string;
  name: string;
  path: string;
  seo: PageSeo;
};

type RoomRow = {
  id: string;
  name: string;
  slug: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonical: string;
    ogImage: string;
    ogTitle?: string;
    ogDescription?: string;
    robots?: string;
    altText?: string;
  };
};

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  seo?: { title?: string; description?: string; robots?: string };
};

type ContactState = {
  phone: string;
  mobile: string;
  email: string;
  reservationEmail: string;
  enquiryEmail: string;
  whatsapp: string;
  address: string;
  hours: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tripadvisor: string;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]";
const labelClass = "block text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]";

function CharHint({ value, rec }: { value: string; rec: [number, number] }) {
  const n = value.length;
  const ok = n >= rec[0] && n <= rec[1];
  return (
    <p className={`mt-1 text-[11px] ${ok || n === 0 ? "text-[#6b746e]" : "text-amber-700"}`}>
      {n} characters · recommended {rec[0]}–{rec[1]}
    </p>
  );
}

export default function AdminSeoDashboardPage() {
  const [tab, setTab] = useState<Tab>("pages");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pages, setPages] = useState<PageRow[]>([]);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [contact, setContact] = useState<ContactState | null>(null);
  const [globalSeo, setGlobalSeo] = useState({
    title: "",
    description: "",
    ogImage: "",
    robotsAllow: true,
  });
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/seo", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.success) setError(data.error || "Failed to load");
    else {
      setPages(data.pages);
      setRooms(data.rooms);
      setArticles(data.articles);
      setContact(data.contact);
      setGlobalSeo({
        title: data.globalSeo?.title || "",
        description: data.globalSeo?.description || "",
        ogImage: data.globalSeo?.ogImage || "",
        robotsAllow: data.globalSeo?.robotsAllow !== false,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.success) {
      setError(data.error || "Save failed");
      return;
    }
    setMessage("Saved. Public pages will use the new values.");
    if (data.pages) setPages(data.pages);
    if (data.contact) setContact(data.contact);
    if (data.globalSeo) {
      setGlobalSeo({
        title: data.globalSeo.title,
        description: data.globalSeo.description,
        ogImage: data.globalSeo.ogImage,
        robotsAllow: data.globalSeo.robotsAllow !== false,
      });
    }
    await load();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "global", label: "Global SEO" },
    { id: "pages", label: "Static Pages" },
    { id: "rooms", label: "Rooms SEO" },
    { id: "articles", label: "Articles SEO" },
    { id: "contact", label: "Contact & Social" },
  ];

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#5a635c]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading SEO dashboard…
      </div>
    );
  }

  const pageEdit = pages.find((p) => p.path === editingPath);
  const roomEdit = rooms.find((r) => r.id === editingRoom);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">SEO Dashboard</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Page metadata & contact</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#5a635c]">
          Edit titles, descriptions, robots, and hotel contact details. Saved values appear in public HTML immediately.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setEditingPath(null);
              setEditingRoom(null);
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              tab === t.id ? "bg-[#0f2420] text-[#f0dfb0]" : "border border-[#c5a059]/30 bg-white text-[#3d5a4c]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {tab === "global" ? (
        <div className="max-w-2xl space-y-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6">
          <label className={labelClass}>
            Default title
            <input
              className={inputClass}
              value={globalSeo.title}
              onChange={(e) => setGlobalSeo({ ...globalSeo, title: e.target.value })}
            />
            <CharHint value={globalSeo.title} rec={[50, 60]} />
          </label>
          <label className={labelClass}>
            Default description
            <textarea
              className={`${inputClass} min-h-[88px]`}
              value={globalSeo.description}
              onChange={(e) => setGlobalSeo({ ...globalSeo, description: e.target.value })}
            />
            <CharHint value={globalSeo.description} rec={[140, 160]} />
          </label>
          <label className={labelClass}>
            Default OG image URL
            <input
              className={inputClass}
              value={globalSeo.ogImage}
              onChange={(e) => setGlobalSeo({ ...globalSeo, ogImage: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-[#3d5a4c]">
            <input
              type="checkbox"
              checked={globalSeo.robotsAllow}
              onChange={(e) => setGlobalSeo({ ...globalSeo, robotsAllow: e.target.checked })}
            />
            Allow search engines to index the public site
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save({ section: "global", globalSeo })}
            className="inline-flex items-center gap-2 rounded-full bg-[#0f2420] px-5 py-2.5 text-sm text-[#f0dfb0]"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save global SEO
          </button>
        </div>
      ) : null}

      {tab === "pages" && !pageEdit ? (
        <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#c5a059]/20 text-[11px] uppercase tracking-[0.14em] text-[#6b746e]">
              <tr>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Meta title</th>
                <th className="px-4 py-3">Indexing</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.path} className="border-b border-[#c5a059]/10">
                  <td className="px-4 py-3 font-medium text-[#0f2420]">{p.name}</td>
                  <td className="px-4 py-3 text-[#5a635c]">{p.path}</td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-[#3d5a4c]">{p.seo.title}</td>
                  <td className="px-4 py-3 text-[#3d5a4c]">{p.seo.robots || "index,follow"}</td>
                  <td className="px-4 py-3 text-[#6b746e]">
                    {p.seo.updatedAt ? new Date(p.seo.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a6a28]"
                      onClick={() => setEditingPath(p.path)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "pages" && pageEdit ? (
        <SeoEditor
          title={pageEdit.name}
          path={pageEdit.path}
          seo={pageEdit.seo}
          saving={saving}
          onCancel={() => setEditingPath(null)}
          onSave={(seo) => void save({ section: "page", path: pageEdit.path, seo })}
        />
      ) : null}

      {tab === "rooms" && !roomEdit ? (
        <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#c5a059]/20 text-[11px] uppercase tracking-[0.14em] text-[#6b746e]">
              <tr>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Meta title</th>
                <th className="px-4 py-3">Indexing</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id} className="border-b border-[#c5a059]/10">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-[#5a635c]">/rooms/{r.slug}</td>
                  <td className="max-w-[280px] truncate px-4 py-3">
                    {r.seo.metaTitle || `${r.name} | Hotel Thamel Park`}
                  </td>
                  <td className="px-4 py-3">{r.seo.robots || "index,follow"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a6a28]"
                      onClick={() => setEditingRoom(r.id)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "rooms" && roomEdit ? (
        <SeoEditor
          title={roomEdit.name}
          path={`/rooms/${roomEdit.slug}`}
          seo={{
            title: roomEdit.seo.metaTitle,
            description: roomEdit.seo.metaDescription,
            canonical: roomEdit.seo.canonical,
            ogImage: roomEdit.seo.ogImage,
            ogTitle: roomEdit.seo.ogTitle,
            ogDescription: roomEdit.seo.ogDescription,
            robots: roomEdit.seo.robots,
          }}
          saving={saving}
          onCancel={() => setEditingRoom(null)}
          onSave={(seo) =>
            void save({
              section: "room",
              roomId: roomEdit.id,
              seo: {
                ...seo,
                metaTitle: seo.title,
                metaDescription: seo.description,
              },
            })
          }
        />
      ) : null}

      {tab === "articles" ? (
        <div className="overflow-x-auto rounded-2xl border border-[#c5a059]/20 bg-white/80">
          <p className="px-4 pt-4 text-sm text-[#5a635c]">
            Per-article SEO is edited in the article editor. Listing defaults:{" "}
            <Link className="text-[#8a6a28] underline" href="/admin/articles/seo">
              Articles → SEO Settings
            </Link>
          </p>
          <table className="mt-3 min-w-full text-left text-sm">
            <thead className="border-b border-[#c5a059]/20 text-[11px] uppercase tracking-[0.14em] text-[#6b746e]">
              <tr>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SEO title</th>
                <th className="px-4 py-3">Robots</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-[#c5a059]/10">
                  <td className="px-4 py-3">{a.title}</td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="max-w-[280px] truncate px-4 py-3">{a.seo?.title || a.title}</td>
                  <td className="px-4 py-3">{a.seo?.robots || "index,follow"}</td>
                  <td className="px-4 py-3">
                    <Link className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a6a28]" href={`/admin/articles/${a.id}`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "contact" && contact ? (
        <div className="max-w-2xl space-y-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6">
          {(
            [
              ["phone", "Phone (header, footer, contact)"],
              ["mobile", "Mobile"],
              ["email", "Email"],
              ["reservationEmail", "Reservation email"],
              ["enquiryEmail", "General enquiry email"],
              ["whatsapp", "WhatsApp"],
              ["address", "Address"],
              ["hours", "Hours / front desk"],
              ["facebook", "Facebook URL"],
              ["instagram", "Instagram URL"],
              ["twitter", "Twitter URL"],
              ["tripadvisor", "TripAdvisor URL"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={labelClass}>
              {label}
              <input
                className={inputClass}
                value={contact[key]}
                onChange={(e) => setContact({ ...contact, [key]: e.target.value })}
              />
            </label>
          ))}
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              void save({
                section: "contact",
                contact,
                social: {
                  facebook: contact.facebook,
                  instagram: contact.instagram,
                  twitter: contact.twitter,
                  tripadvisor: contact.tripadvisor,
                },
              })
            }
            className="inline-flex items-center gap-2 rounded-full bg-[#0f2420] px-5 py-2.5 text-sm text-[#f0dfb0]"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save contact information
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SeoEditor({
  title,
  path,
  seo,
  saving,
  onCancel,
  onSave,
}: {
  title: string;
  path: string;
  seo: PageSeo;
  saving: boolean;
  onCancel: () => void;
  onSave: (seo: PageSeo) => void;
}) {
  const [form, setForm] = useState<PageSeo>(seo);
  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6">
      <div>
        <h2 className="font-serif text-2xl font-light text-[#0f2420]">{title}</h2>
        <p className="text-sm text-[#5a635c]">{path}</p>
      </div>
      <label className={labelClass}>
        Meta title
        <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <CharHint value={form.title} rec={[50, 60]} />
      </label>
      <label className={labelClass}>
        Meta description
        <textarea
          className={`${inputClass} min-h-[88px]`}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <CharHint value={form.description} rec={[140, 160]} />
      </label>
      <label className={labelClass}>
        Canonical URL
        <input
          className={inputClass}
          value={form.canonical || ""}
          onChange={(e) => setForm({ ...form, canonical: e.target.value })}
        />
      </label>
      <label className={labelClass}>
        Robots
        <select
          className={inputClass}
          value={form.robots || "index,follow"}
          onChange={(e) => setForm({ ...form, robots: e.target.value })}
        >
          {ROBOTS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Open Graph title
        <input
          className={inputClass}
          value={form.ogTitle || ""}
          onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
        />
      </label>
      <label className={labelClass}>
        Open Graph description
        <textarea
          className={`${inputClass} min-h-[72px]`}
          value={form.ogDescription || ""}
          onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
        />
      </label>
      <label className={labelClass}>
        Open Graph image URL
        <input
          className={inputClass}
          value={form.ogImage || ""}
          onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
        />
      </label>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(form)}
          className="inline-flex items-center gap-2 rounded-full bg-[#0f2420] px-5 py-2.5 text-sm text-[#f0dfb0]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-[#c5a059]/40 px-5 py-2.5 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
