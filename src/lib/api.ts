import type { Class, Period, WeekSchedule, SearchResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEFAULT_CLASS = '10a'; // Default class to use if none is selected

async function fetchAPI(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  // Your backend expects 'class' as a query param, not 'class_name'
  if(params.class_name) {
    params.class = params.class_name;
    delete params.class_name;
  }
  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error(`API Error: ${res.status} ${res.statusText} for ${url}`);
    const errorBody = await res.text();
    console.error('Error Body:', errorBody);
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return res.json();
}

// /get_all_classes
export const getAllClasses = async (): Promise<Class[]> => {
  const data = await fetchAPI('/get_all_classes');
  // The backend returns a list of strings, we need to map it to the Class interface
  return data.classes.map((className: string) => ({
      id: className.toLowerCase().replace(' ', '-'),
      name: className
  }));
};

// /get_current_period
export const getCurrentPeriod = async (className: string = DEFAULT_CLASS): Promise<Period> => {
  const data = await fetchAPI('/get_current_period', { class: className });
  // Map backend response to frontend Period type
  const { current_subject, next_subject, message, day, time } = data;
  
  let subject = 'Break';
  let status: 'ongoing' | 'break' | 'finished' = 'break';

  if(current_subject){
    subject = current_subject;
    status = 'ongoing';
  } else if (message?.includes('over')) {
    status = 'finished';
    subject = 'School Day Finished';
  }
  
  return {
    subject: subject,
    teacher: 'N/A', // Not provided by this endpoint
    time: time,
    room: 'N/A', // Not provided by this endpoint
    status: status,
    message: message
  };
};

const mapPeriods = (periods: any[]): Period[] => {
    return periods.map(p => ({
        subject: p.subject,
        teacher: 'N/A', // Teacher info not in your backend response
        time: `${p.start_time} - ${p.end_time}`,
        room: 'N/A' // Room info not in your backend response
    }))
}

// /get_day_schedule
export const getDaySchedule = async (className: string = DEFAULT_CLASS): Promise<Period[]> => {
  const data = await fetchAPI('/get_day_schedule', { class: className });
  return mapPeriods(data.timetable);
};

// /get_full_week
export const getFullWeekSchedule = async (className: string = DEFAULT_CLASS): Promise<WeekSchedule> => {
    const data = await fetchAPI('/get_full_week', { class: className });
    const schedule: Partial<WeekSchedule> = {};
    for (const day in data.week_schedule) {
        schedule[day.toLowerCase() as keyof WeekSchedule] = mapPeriods(data.week_schedule[day]);
    }
    return schedule as WeekSchedule;
}

// /search_periods_by_subject
export const searchPeriodsBySubject = async (query: string): Promise<SearchResult> => {
    if (!query) return {};
    const data = await fetchAPI('/search_periods_by_subject', { subject: query });
    const results: SearchResult = {};
    
    // Group results by day
    data.results.forEach((item: any) => {
        if (!results[item.day]) {
            results[item.day] = [];
        }
        results[item.day].push({
            subject: item.subject,
            time: `${item.start_time} - ${item.end_time}`,
            teacher: 'N/A',
            room: 'N/A'
        });
    });

    return results;
}
