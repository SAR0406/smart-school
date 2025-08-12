import type { Class, Period, WeekSchedule, SearchResult } from './types';

const mockDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockClasses: Class[] = [
  { id: '10a', name: 'Class 10-A' },
  { id: '10b', name: 'Class 10-B' },
  { id: '11a', name: 'Class 11-A' },
  { id: '11b', name: 'Class 11-B' },
];

const mockPeriods: Period[] = [
  { subject: 'Mathematics', teacher: 'Mr. John Doe', time: '08:00 - 09:00', room: '101' },
  { subject: 'Physics', teacher: 'Ms. Ada Lovelace', time: '09:00 - 10:00', room: '203' },
  { subject: 'History', teacher: 'Mr. Indiana Jones', time: '10:00 - 11:00', room: '105' },
  { subject: 'Lunch Break', teacher: '', time: '11:00 - 12:00', room: 'Cafeteria' },
  { subject: 'Chemistry', teacher: 'Ms. Marie Curie', time: '12:00 - 13:00', room: 'Lab A' },
  { subject: 'English Literature', teacher: 'Mr. William Shakespeare', time: '13:00 - 14:00', room: '202' },
  { subject: 'Physical Education', teacher: 'Mr. Rocky Balboa', time: '14:00 - 15:00', room: 'Gym' },
];

const mockFullWeek: WeekSchedule = {
  monday: mockPeriods.slice(0, 5),
  tuesday: mockPeriods.slice(1, 6),
  wednesday: [...mockPeriods.slice(0,2), { subject: 'Computer Science', teacher: 'Mr. Alan Turing', time: '10:00 - 11:00', room: '301'}, ...mockPeriods.slice(4,6)],
  thursday: mockPeriods.slice(2, 7),
  friday: [mockPeriods[0], mockPeriods[2], mockPeriods[4], mockPeriods[6]],
  saturday: [],
  sunday: [],
};

// /get_all_classes
export const getAllClasses = async (): Promise<Class[]> => {
  await mockDelay(500);
  return mockClasses;
};

// /get_current_period
export const getCurrentPeriod = async (): Promise<Period> => {
  await mockDelay(300);
  // This is a simplified logic. A real app would check the current time.
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 8 && hour < 9) {
    return { ...mockPeriods[0], status: 'ongoing' };
  }
  if (hour >= 9 && hour < 10) {
    return { ...mockPeriods[1], status: 'ongoing' };
  }
  if (hour >= 11 && hour < 12) {
    return { ...mockPeriods[3], status: 'break' };
  }
  if (hour >= 15) {
      return { ...mockPeriods[6], status: 'finished' }
  }

  return { ...mockPeriods[2], status: 'ongoing' }; // Default to an ongoing class
};

// /get_day_schedule
export const getDaySchedule = async (): Promise<Period[]> => {
  await mockDelay(700);
  const day = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
  return mockFullWeek[day as keyof WeekSchedule] || [];
};

// /get_full_week
export const getFullWeekSchedule = async (): Promise<WeekSchedule> => {
    await mockDelay(1200);
    return mockFullWeek;
}

// /search_periods_by_subject
export const searchPeriodsBySubject = async (query: string): Promise<SearchResult> => {
    await mockDelay(800);
    const results: SearchResult = {};
    const lowerCaseQuery = query.toLowerCase();

    for (const day in mockFullWeek) {
        const periods = (mockFullWeek as any)[day].filter((period: Period) => 
            period.subject.toLowerCase().includes(lowerCaseQuery)
        );
        if (periods.length > 0) {
            results[day] = periods;
        }
    }
    return results;
}
