import type { Class, Period, WeekSchedule, SearchResult } from './types';
import { scheduleData, classNames } from './data';
import { format, getDay, parse, set, isBefore, isAfter, isEqual } from 'date-fns';

type ScheduleData = typeof scheduleData;

const getClassId = (): keyof ScheduleData | null => {
    if (typeof window === 'undefined') return null;
    const savedClass = localStorage.getItem("selectedClass");
    return savedClass && savedClass in scheduleData ? savedClass as keyof ScheduleData : null;
}

const getTodayDayName = () => {
  return format(new Date(), 'EEEE'); // e.g., "Monday"
}

// --- API Functions ---

export const getAllClasses = async (): Promise<Class[]> => {
  return new Promise(resolve => resolve(classNames));
};

export const getCurrentPeriod = async (): Promise<Period> => {
    const classId = getClassId();
    if (!classId) throw new Error("No class selected");

    const now = new Date();
    const todayName = getTodayDayName();
    const todaySchedule = scheduleData[classId].daily_schedule[todayName as keyof typeof scheduleData[keyof ScheduleData]['daily_schedule']];

    if (!todaySchedule || todaySchedule.length === 0) {
        return {
            subject: 'School Day Finished',
            teacher: 'N/A', time: '-', room: 'N/A',
            status: 'finished', message: 'Enjoy your day off!'
        };
    }
    
    for (const period of todaySchedule) {
        const [startHour, startMinute] = period.start_time.split(':').map(Number);
        const [endHour, endMinute] = period.end_time.split(':').map(Number);

        const startTime = set(now, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });
        const endTime = set(now, { hours: endHour, minutes: endMinute, seconds: 0, milliseconds: 0 });

        if (isAfter(now, startTime) && isBefore(now, endTime)) {
            const isBreak = period.subject.toLowerCase().includes('break');
            return {
                subject: period.subject,
                teacher: 'N/A',
                time: `${period.start_time} - ${period.end_time}`,
                room: 'N/A',
                status: isBreak ? 'break' : 'ongoing',
                message: isBreak ? 'Time for a short break!' : 'Class is in session.'
            };
        }
    }
    
    // Check for time before first period or between periods
    const firstPeriodStart = set(now, { hours: ...todaySchedule[0].start_time.split(':').map(Number) as [number, number], seconds: 0, milliseconds: 0 });
    if (isBefore(now, firstPeriodStart)) {
        return {
            subject: 'Before School',
            teacher: 'N/A', time: '-', room: 'N/A', status: 'break',
            message: `First class (${todaySchedule[0].subject}) starts at ${todaySchedule[0].start_time}.`
        };
    }

    for (let i = 0; i < todaySchedule.length - 1; i++) {
        const currentPeriodEnd = set(now, { hours: ...todaySchedule[i].end_time.split(':').map(Number) as [number, number], seconds: 0, milliseconds: 0 });
        const nextPeriodStart = set(now, { hours: ...todaySchedule[i + 1].start_time.split(':').map(Number) as [number, number], seconds: 0, milliseconds: 0 });

        if (isAfter(now, currentPeriodEnd) && isBefore(now, nextPeriodStart)) {
             return {
                subject: 'Break Time',
                teacher: 'N/A',
                time: `${todaySchedule[i].end_time} - ${todaySchedule[i+1].start_time}`,
                room: 'N/A',
                status: 'break',
                message: `Next up: ${todaySchedule[i+1].subject} at ${todaySchedule[i+1].start_time}`
            };
        }
    }


    return {
        subject: 'School Day Finished',
        teacher: 'N/A', time: '-', room: 'N/A', status: 'finished',
        message: 'All classes for today are over.'
    };
};

const mapPeriods = (periods: any[]): Period[] => {
    if (!periods || periods.length === 0) return [];
    return periods.map(p => ({
        subject: p.subject,
        teacher: 'N/A',
        time: `${p.start_time} - ${p.end_time}`,
        room: 'N/A'
    }));
}

export const getDaySchedule = async (): Promise<Period[]> => {
  const classId = getClassId();
  if (!classId) throw new Error("No class selected");
  const todayName = getTodayDayName();
  const schedule = scheduleData[classId].daily_schedule[todayName as keyof typeof scheduleData[keyof ScheduleData]['daily_schedule']];
  return new Promise(resolve => resolve(mapPeriods(schedule || [])));
};

export const getDayScheduleByDay = async (day: string): Promise<Period[]> => {
  const classId = getClassId();
  if (!classId) throw new Error("No class selected");
  const schedule = scheduleData[classId].daily_schedule[day as keyof typeof scheduleData[keyof ScheduleData]['daily_schedule']];
  return new Promise(resolve => resolve(mapPeriods(schedule || [])));
}

export const getFullWeekSchedule = async (): Promise<WeekSchedule> => {
    const classId = getClassId();
    if (!classId) throw new Error("No class selected");

    const weekData = scheduleData[classId].daily_schedule;
    const schedule: Partial<WeekSchedule> = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    for (const day of days) {
        const dayKey = day.toLowerCase() as keyof WeekSchedule;
        const apiDayKey = day as keyof typeof weekData;
        if (weekData[apiDayKey]) {
            schedule[dayKey] = mapPeriods(weekData[apiDayKey]);
        } else {
             schedule[dayKey] = [];
        }
    }
    return schedule as WeekSchedule;
}

export const searchPeriodsBySubject = async (query: string): Promise<SearchResult> => {
    const classId = getClassId();
    if (!classId || !query) return {};

    const weekData = scheduleData[classId].daily_schedule;
    const results: SearchResult = {};
    
    for (const day in weekData) {
        const dayKey = day as keyof typeof weekData;
        const periods = weekData[dayKey];
        const matchingPeriods = periods.filter(p => p.subject.toLowerCase().includes(query.toLowerCase()));

        if (matchingPeriods.length > 0) {
            results[day.toLowerCase()] = mapPeriods(matchingPeriods);
        }
    }
    return results;
}

export const getNvidiaAIResponse = async (tool: string, prompt: string, streamCallback: (chunk: string) => void) => {
  const modifiedPrompt = `You must start every response with a relevant emoji. User query: ${prompt}`;
  // This would be a fetch call in a real app
  const dummyResponse = `🤖 Mock response for ${tool}: ${modifiedPrompt}`;
  
  // Simulate streaming
  const chunks = dummyResponse.split(' ');
  for (let i = 0; i < chunks.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
    streamCallback(chunks[i] + ' ');
  }
}

    