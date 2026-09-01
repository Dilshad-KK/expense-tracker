import TimelineView from '@/components/quran/TimelineView';
import { MIRACLES_DATA } from '@/data/discover';

export default function MiraclesPage() {
  return (
    <TimelineView 
      title="Miracles of the Quran"
      subtitle="Scientific & Historical"
      description="Explore the profound scientific truths and historical miracles mentioned in the Quran long before modern science discovered them."
      badgeLabel="Divine Proofs"
      items={MIRACLES_DATA}
    />
  );
}
