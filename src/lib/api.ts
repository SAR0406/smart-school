import type { Class, Period, WeekSchedule, SearchResult } from './types';

const API_BASE = '/api'; 
const DEFAULT_CLASS = '10a';

async function fetchAPI(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
  
  const savedClass = localStorage.getItem("selectedClass");
  const classParam = savedClass || params.class;

  if (!classParam && endpoint !== '/get_all_classes') {
    throw new Error("No class selected");
  }

  if (classParam && !params.class && endpoint !== '/get_all_classes') {
    params.class = classParam;
  }
  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
  const res = await fetch(url.toString());
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`API Error: ${res.status} ${res.statusText} for ${url.toString()}`, errorBody);
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }
  return res.json();
}

export const getAllClasses = async (): Promise<Class[]> => {
  const data = await fetchAPI('/get_all_classes');
  return data.classes.map((className: string) => ({
      id: className.toLowerCase().replace(/\s+/g, '-'),
      name: className
  }));
};

export const getCurrentPeriod = async (): Promise<Period> => {
  const data = await fetchAPI('/get_current_period');
  const { current_subject, message, time, next_subject } = data;
  
  let subject = 'Break';
  let status: 'ongoing' | 'break' | 'finished' = 'break';

  if (current_subject) {
    subject = current_subject;
    status = 'ongoing';
  } else if (message?.toLowerCase().includes('over') || message?.toLowerCase().includes('enjoy your holiday')) {
    status = 'finished';
    subject = 'School Day Finished';
  } else if (next_subject || message?.toLowerCase().includes('next')) {
     status = 'break';
     subject = 'Break Time';
  }
  
  return {
    subject: subject,
    teacher: 'N/A',
    time: time,
    room: 'N/A',
    status: status,
    message: message
  };
};

const mapPeriods = (periods: any[]): Period[] => {
    if (!periods || periods.length === 0) return [];
    if (periods[0]?.subject === "Holiday") {
      return [{ subject: "Holiday", time: "All Day", teacher: "-", room: "-" }];
    }
    return periods.map(p => ({
        subject: p.subject,
        teacher: 'N/A',
        time: `${p.start_time} - ${p.end_time}`,
        room: 'N/A'
    }))
}

export const getDaySchedule = async (): Promise<Period[]> => {
  const data = await fetchAPI('/get_day_schedule');
  return mapPeriods(data.timetable);
};

export const getFullWeekSchedule = async (): Promise<WeekSchedule> => {
    const data = await fetchAPI('/get_full_week');
    const schedule: Partial<WeekSchedule> = {};
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    
    for (const day of days) {
        const backendDay = day.charAt(0).toUpperCase() + day.slice(1);
        if (data.week_schedule[backendDay]) {
            schedule[day as keyof WeekSchedule] = mapPeriods(data.week_schedule[backendDay]);
        } else {
             schedule[day as keyof WeekSchedule] = [];
        }
    }
    return schedule as WeekSchedule;
}

export const searchPeriodsBySubject = async (query: string): Promise<SearchResult> => {
    if (!query) return {};
    try {
        const data = await fetchAPI('/search_periods_by_subject', { subject: query });
        const results: SearchResult = {};
        
        data.results.forEach((item: any) => {
            const dayKey = item.day.toLowerCase();
            if (!results[dayKey]) {
                results[dayKey] = [];
            }
            results[dayKey].push({
                subject: item.subject,
                time: `${item.start_time} - ${item.end_time}`,
                teacher: 'N/A',
                room: 'N/A'
            });
        });

        return results;
    } catch(error: any) {
        if (error.message.includes('404')) {
            return {};
        }
        throw error;
    }
}
