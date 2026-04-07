export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export interface CourseSchedule {
  day: Day;
  start: string; // "HH:mm" format, e.g., "09:00"
  end: string;   // "HH:mm" format, e.g., "10:30"
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  description: string;
  department: string;
  schedules: CourseSchedule[];
  color: string;
}

export interface PlannedCourse extends Course {
  instanceId: string;
}
