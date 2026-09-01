import TimelineView from '@/components/quran/TimelineView';
import { PARABLES_DATA } from '@/data/discover';

export default function ParablesPage() {
  return (
    <TimelineView 
      title="Parables & Lessons"
      subtitle="Wisdom & Guidance"
      description="Discover beautiful allegories, stories, and profound lessons from the Quran that teach us how to be better humans."
      badgeLabel="Quranic Wisdom"
      items={PARABLES_DATA}
    />
  );
}
