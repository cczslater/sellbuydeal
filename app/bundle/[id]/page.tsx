import BundleDetail from './BundleDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function Page({ params }: { params: any }) {

  return <BundleDetail bundleId={params.id} />;
}