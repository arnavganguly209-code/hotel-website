import { ArticlesIndexClient } from "@/components/admin-pms/articles/ArticlesIndexClient";

export default function AdminScheduledPage() {
  return (
    <ArticlesIndexClient
      forcedStatus="scheduled"
      title="Scheduled Articles"
      subtitle="Articles set to publish automatically at their schedule time."
    />
  );
}
