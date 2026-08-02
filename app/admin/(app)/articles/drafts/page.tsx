import { ArticlesIndexClient } from "@/components/admin-pms/articles/ArticlesIndexClient";

export default function AdminDraftsPage() {
  return (
    <ArticlesIndexClient
      forcedStatus="draft"
      title="Drafts"
      subtitle="Unpublished articles ready for editing."
    />
  );
}
