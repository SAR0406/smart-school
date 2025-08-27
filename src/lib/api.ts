
import type { Class, Period, WeekSchedule, SearchResult } from './types';
import { scheduleData, classNames } from './data';
import { format, getDay, parse, set, isBefore, isAfter, isEqual } from 'date-fns';
import type { UnifiedChatInput } from '@/ai/flows/unified-chat-flow';
import type { AITool } from '@/components/chat-interface';

type ScheduleData = typeof scheduleData.classes;

const getClassId = (): keyof ScheduleData | null => {
    if (typeof window === 'undefined') return null;
    const savedClass = localStorage.getItem("selectedClass");
    return savedClass && savedClass in scheduleData.classes ? savedClass as keyof ScheduleData : null;
}

const getTodayDayName = () => {
  // Returns Sunday, Monday, etc.
  return format(new Date(), 'EEEE');
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
    const todaySchedule = scheduleData.classes[classId].daily_schedule[todayName as keyof typeof scheduleData.classes[keyof ScheduleData]['daily_schedule']];

    if (!todaySchedule || todaySchedule.length === 0) {
        const isWeekend = todayName === 'Sunday' || (todayName === 'Saturday' && scheduleData.classes[classId].daily_schedule.Saturday.length === 0)
        return {
            subject: 'School Day Finished',
            teacher: 'N/A', time: '-', room: 'N/A',
            status: 'finished', message: isWeekend ? 'Enjoy your weekend!' : 'Enjoy your day off!'
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
    const [firstPeriodStartHour, firstPeriodStartMinute] = todaySchedule[0].start_time.split(':').map(Number);
    const firstPeriodStart = set(now, { hours: firstPeriodStartHour, minutes: firstPeriodStartMinute, seconds: 0, milliseconds: 0 });

    if (isBefore(now, firstPeriodStart)) {
        return {
            subject: 'Before School',
            teacher: 'N/A', time: '-', room: 'N/A', status: 'break',
            message: `First class (${todaySchedule[0].subject}) starts at ${todaySchedule[0].start_time}.`
        };
    }

    for (let i = 0; i < todaySchedule.length - 1; i++) {
        const [currentPeriodEndHour, currentPeriodEndMinute] = todaySchedule[i].end_time.split(':').map(Number);
        const currentPeriodEnd = set(now, { hours: currentPeriodEndHour, minutes: currentPeriodEndMinute, seconds: 0, milliseconds: 0 });
        
        const [nextPeriodStartHour, nextPeriodStartMinute] = todaySchedule[i + 1].start_time.split(':').map(Number);
        const nextPeriodStart = set(now, { hours: nextPeriodStartHour, minutes: nextPeriodStartMinute, seconds: 0, milliseconds: 0 });

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
  const schedule = scheduleData.classes[classId].daily_schedule[todayName as keyof typeof scheduleData.classes[keyof ScheduleData]['daily_schedule']];
  return new Promise(resolve => resolve(mapPeriods(schedule || [])));
};

export const getDayScheduleByDay = async (day: string): Promise<Period[]> => {
  const classId = getClassId();
  if (!classId) throw new Error("No class selected");
  const schedule = scheduleData.classes[classId].daily_schedule[day as keyof typeof scheduleData.classes[keyof ScheduleData]['daily_schedule']];
  return new Promise(resolve => resolve(mapPeriods(schedule || [])));
}

export const getFullWeekSchedule = async (): Promise<WeekSchedule> => {
    const classId = getClassId();
    if (!classId) throw new Error("No class selected");

    const weekData = scheduleData.classes[classId].daily_schedule;
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

    const weekData = scheduleData.classes[classId].daily_schedule;
    const results: SearchResult = {};
    
    for (const day in weekData) {
        if (!Object.prototype.hasOwnProperty.call(weekData, day)) continue;
        const dayKey = day as keyof typeof weekData;
        const periods = weekData[dayKey];
        if (periods) {
            const matchingPeriods = periods.filter(p => p.subject.toLowerCase().includes(query.toLowerCase()));
            if (matchingPeriods.length > 0) {
                results[day.toLowerCase()] = mapPeriods(matchingPeriods);
            }
        }
    }
    return results;
}

interface NvidiaAIRequest {
    tool: AITool;
    prompt: string;
}

export const getNvidiaAIResponse = async (input: NvidiaAIRequest): Promise<string> => {
    try {
        const response = await fetch(`https://smart-school-ai-backend.onrender.com/ai/${input.tool}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: input.prompt,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorBody}`);
        }

        const textResponse = await response.text();
        // Since the backend returns a plain text stream, we directly return it.
        // If the backend sometimes returns JSON with a 'response' field,
        // we might need more complex logic here, but for now, this handles plain text.
        try {
            // Try to parse it as JSON first, in case the non-streaming endpoint is hit
            const data = JSON.parse(textResponse);
            if (data && data.response) {
                return data.response;
            }
        } catch (e) {
            // If it fails, it's likely plain text, so return it directly.
            return textResponse;
        }
        // Fallback for cases where it's JSON but not in the expected format.
        return textResponse;


    } catch (error) {
        console.error("Failed to get response from Nvidia AI:", error);
        if (error instanceof Error) {
            return `Error: Could not connect to the AI service. ${error.message}`;
        }
        return "An unknown error occurred while contacting the AI service.";
    }
};
