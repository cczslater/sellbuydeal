
import ClassifiedAdDetail from './ClassifiedAdDetail';
export const dynamic = "force-dynamic";
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function ClassifiedAdDetailPage({ params }: { params: { id: string } }) {
  return <ClassifiedAdDetail adId={params.id} />;
}
