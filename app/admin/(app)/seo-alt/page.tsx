import type { Metadata } from "next";
import Link from "next/link";
import { ALT_SEO_PAGES, altPagePath, scoreAltPage } from "@/lib/seo/alt-pages";

export const metadata: Metadata = {
  title: "Backlink Page",
  robots: { index: false, follow: false },
};

export default function SeoAltAdminPage() {
  const rows = ALT_SEO_PAGES.map((page) => ({ page, ...scoreAltPage(page) }));
  const ready = rows.filter((row) => row.score === 100).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Search</p>
      <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Backlink Page</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3d5a4c]">
        Every SEO guide built for search. These pages are indexable and listed in the sitemap.
        They are not linked from the public menu, homepage, or footer.
      </p>
      <p className="mt-4 text-sm text-[#0f2420]">
        {ready} of {rows.length} pages at 100%.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e4d7bc] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#0c1f1b] text-[#f7f1e6]">
            <tr>
              <th className="px-4 py-3 font-medium">Keyword</th>
              <th className="px-4 py-3 font-medium">Audience</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Path</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ page, score, checks }) => (
              <tr key={page.slug} className="border-t border-[#efe6d6]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0f2420]">{page.keyword}</p>
                  <p className="mt-1 text-xs text-[#5c6f64]">{page.title}</p>
                  {score < 100 ? (
                    <p className="mt-1 text-xs text-[#8a3b2a]">
                      {checks.filter((check) => !check.ok).map((check) => check.label).join(", ")}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 capitalize text-[#3d5a4c]">{page.audience}</td>
                <td className="px-4 py-3 font-semibold text-[#1d4d38]">{score}%</td>
                <td className="px-4 py-3">
                  <Link href={altPagePath(page.slug)} className="text-[#1d4d38] underline" target="_blank">
                    {altPagePath(page.slug)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
