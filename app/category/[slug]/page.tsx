
import CategoryPageClient from './CategoryPageClient';
export const dynamic = "force-dynamic";
export async function generateStaticParams() {
  return [
    { slug: 'electronics' },
    { slug: 'fashion' },
    { slug: 'home-garden' },
    { slug: 'automotive' },
    { slug: 'sports-outdoors' },
    { slug: 'collectibles-art' }
  ];
}

export default function Page({ params }: { params: any }) {
  return <CategoryPageClient slug={params.slug} />;
}
