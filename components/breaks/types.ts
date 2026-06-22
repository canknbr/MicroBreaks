import type { ExerciseCategory } from '@/data/exercises';
import type { IoniconsName } from '@/types/icons';

export interface BreakListItem {
  id: string;
  title: string;
  duration: string;
  durationMinutes: number;
  icon: string;
  description: string;
  category: ExerciseCategory;
  color: string;
  isLocked: boolean;
}

export interface BreakCategorySectionData {
  id: string;
  title: string;
  subtitle: string;
  icon: IoniconsName;
  color: string;
  breaks: BreakListItem[];
}
