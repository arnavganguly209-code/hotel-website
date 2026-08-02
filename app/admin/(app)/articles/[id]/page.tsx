import { ArticleEditorClient } from "@/components/admin-pms/articles/ArticleEditorClient";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditArticlePage({ params }: Props) {
  const { id } = await params;
  return <ArticleEditorClient articleId={id} />;
}
