
import { Week, Session } from '../types';

// Helper to format date for ICS (YYYYMMDDTHHMMSSZ)
const formatDateICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const generateICS = (week: Week, weekIndex: number): string => {
    let icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MY RUN//NONSGML v1.0//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    const now = new Date();
    // Logic: Assuming the current view represents the current week starting from today (or mostly, relative to how the user perceives the plan).
    // To make it practical, we map Monday of the week to the nearest Monday or today if today is Monday.
    // However, keeping consistency with Garmin export logic in WeekDetail:
    // "today + (weekIndex * 7 + dayIndex)" implies the plan starts *today* at index 0.
    
    // To enable "Real Calendar" export, we ideally should know the plan Start Date. 
    // Since we don't track start date explicitly in the simplified model, we assume Week 0 starts TODAY.
    
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    week.sessions.forEach(session => {
        if (session.type === 'Repos') return;

        let sessionDate: Date;

        if (session.date) {
            sessionDate = new Date(session.date);
        } else {
            // Fallback logic for old programs without specific dates
            const dayIndex = daysOfWeek.indexOf(session.day); // 0=Sun, 1=Mon...
            
            // French day mapping
            const frDayToJs: {[key: string]: number} = {
                'Dimanche': 0, 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
            };
            
            const targetDayIndex = frDayToJs[session.day] ?? 0;
            const currentDayIndex = now.getDay(); // 0-6
            
            const dayOffset = (targetDayIndex - currentDayIndex + 7) % 7; 
            
            sessionDate = new Date();
            sessionDate.setDate(now.getDate() + (weekIndex * 7) + dayOffset);
        }

        sessionDate.setHours(18, 0, 0, 0); // Default to 6 PM run

        const endDate = new Date(sessionDate);
        endDate.setMinutes(endDate.getMinutes() + (session.duration || 60));

        const description = session.structure.map(b => `[${b.type}] ${b.details}`).join('\\n');

        icsContent += 
`BEGIN:VEVENT
UID:${session.id}-${formatDateICS(new Date())}@myrun.app
DTSTAMP:${formatDateICS(new Date())}
DTSTART:${formatDateICS(sessionDate)}
DTEND:${formatDateICS(endDate)}
SUMMARY:MY RUN - ${session.title}
DESCRIPTION:${description}
LOCATION:Extérieur
END:VEVENT
`;
    });

    icsContent += `END:VCALENDAR`;
    return icsContent;
};

export const downloadICS = (week: Week, weekIndex: number) => {
    const icsContent = generateICS(week, weekIndex);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `myrun_semaine_${week.weekNumber}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
