import TimelineView from '@/components/quran/TimelineView';
import { PROPHETS_DATA } from '@/data/prophets';

export default function ProphetsPage() {
  return (
    <TimelineView 
      title="Stories of the Prophets"
      subtitle="Chronological Order"
      description="Journey through the stories of the messengers mentioned in the Quran, from Adam to Muhammad (peace be upon them all)."
      badgeLabel="The Messengers"
      items={PROPHETS_DATA}
    />
  );
}
