import { ClientRecommendationsContent } from "./client-recommendations-content"

export default async function ClientRecommendationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ClientRecommendationsContent id={id} />
}
