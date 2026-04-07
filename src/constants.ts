import { Course } from './types';

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    instructor: 'Dr. Alan Turing',
    credits: 4,
    department: 'Computer Science',
    description: 'Fundamental concepts of computer science and programming.',
    schedules: [
      { day: 'Mon', start: '09:00', end: '10:30' },
      { day: 'Wed', start: '09:00', end: '10:30' }
    ],
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: '2',
    code: 'MATH201',
    name: 'Calculus II',
    instructor: 'Dr. Isaac Newton',
    credits: 4,
    department: 'Mathematics',
    description: 'Advanced integration techniques and series.',
    schedules: [
      { day: 'Tue', start: '11:00', end: '12:30' },
      { day: 'Thu', start: '11:00', end: '12:30' }
    ],
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: '3',
    code: 'ENG102',
    name: 'Academic Writing',
    instructor: 'Prof. Virginia Woolf',
    credits: 3,
    department: 'English',
    description: 'Developing critical thinking and writing skills.',
    schedules: [
      { day: 'Mon', start: '13:00', end: '14:30' },
      { day: 'Fri', start: '13:00', end: '14:30' }
    ],
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    id: '4',
    code: 'PHYS101',
    name: 'General Physics I',
    instructor: 'Dr. Marie Curie',
    credits: 4,
    department: 'Physics',
    description: 'Mechanics, heat, and sound.',
    schedules: [
      { day: 'Wed', start: '14:00', end: '15:30' },
      { day: 'Fri', start: '14:00', end: '15:30' }
    ],
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    id: '5',
    code: 'CS202',
    name: 'Data Structures',
    instructor: 'Dr. Grace Hopper',
    credits: 4,
    department: 'Computer Science',
    description: 'Organization and manipulation of data.',
    schedules: [
      { day: 'Tue', start: '09:00', end: '10:30' },
      { day: 'Thu', start: '09:00', end: '10:30' }
    ],
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  {
    id: '6',
    code: 'PSYCH101',
    name: 'Intro to Psychology',
    instructor: 'Dr. Sigmund Freud',
    credits: 3,
    department: 'Psychology',
    description: 'Scientific study of the human mind and behavior.',
    schedules: [
      { day: 'Mon', start: '15:00', end: '16:30' },
      { day: 'Wed', start: '15:00', end: '16:30' }
    ],
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  }
];

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
export const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
