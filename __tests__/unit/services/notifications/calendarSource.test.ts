import {
  __resetCalendarSourceForTests,
  __setCalendarModuleForTests,
  getBusyWindows,
} from '@/services/notifications/calendarSource';
import {
  __resetTierStateForTests,
  __setEffectiveTier,
} from '@/services/subscription/tierState';

function makeMockCalendar(events: unknown[] = []) {
  return {
    EntityTypes: { EVENT: 'event' },
    getCalendarPermissionsAsync: jest
      .fn()
      .mockResolvedValue({ status: 'granted' }),
    getCalendarsAsync: jest.fn().mockResolvedValue([{ id: 'cal-1' }]),
    getEventsAsync: jest.fn().mockResolvedValue(events),
  };
}

describe('calendarSource — tier gate', () => {
  beforeEach(() => {
    __resetCalendarSourceForTests();
    __resetTierStateForTests();
  });

  it('returns [] without touching the calendar module for free-tier users', async () => {
    const cal = makeMockCalendar([
      {
        allDay: false,
        availability: 'busy',
        startDate: new Date('2026-06-09T10:00:00').toISOString(),
        endDate: new Date('2026-06-09T11:00:00').toISOString(),
        title: 'Standup',
      },
    ]);
    __setCalendarModuleForTests(cal);
    __setEffectiveTier('free');

    const result = await getBusyWindows(
      new Date('2026-06-09T09:00:00'),
      new Date('2026-06-09T12:00:00')
    );
    expect(result).toEqual([]);
    expect(cal.getCalendarPermissionsAsync).not.toHaveBeenCalled();
  });

  it('returns [] for solo-tier users (calendar_aware requires Pro)', async () => {
    const cal = makeMockCalendar([
      {
        allDay: false,
        availability: 'busy',
        startDate: new Date('2026-06-09T10:00:00').toISOString(),
        endDate: new Date('2026-06-09T11:00:00').toISOString(),
        title: 'Standup',
      },
    ]);
    __setCalendarModuleForTests(cal);
    __setEffectiveTier('solo');

    const result = await getBusyWindows(
      new Date('2026-06-09T09:00:00'),
      new Date('2026-06-09T12:00:00')
    );
    expect(result).toEqual([]);
    expect(cal.getCalendarPermissionsAsync).not.toHaveBeenCalled();
  });

  it('reads busy windows for pro and family tiers', async () => {
    for (const tier of ['pro', 'family'] as const) {
      __resetCalendarSourceForTests();
      const cal = makeMockCalendar([
        {
          allDay: false,
          availability: 'busy',
          startDate: new Date('2026-06-09T10:00:00').toISOString(),
          endDate: new Date('2026-06-09T11:00:00').toISOString(),
          title: 'Standup',
        },
      ]);
      __setCalendarModuleForTests(cal);
      __setEffectiveTier(tier);

      const result = await getBusyWindows(
        new Date('2026-06-09T09:00:00'),
        new Date('2026-06-09T12:00:00')
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Standup');
    }
  });

  it('drops free / available events when reading at pro tier', async () => {
    const cal = makeMockCalendar([
      {
        allDay: false,
        availability: 'free',
        startDate: new Date('2026-06-09T10:00:00').toISOString(),
        endDate: new Date('2026-06-09T11:00:00').toISOString(),
        title: 'Optional sync',
      },
      {
        allDay: true,
        availability: 'busy',
        startDate: new Date('2026-06-09T00:00:00').toISOString(),
        endDate: new Date('2026-06-10T00:00:00').toISOString(),
        title: 'OOO',
      },
      {
        allDay: false,
        availability: 'busy',
        startDate: new Date('2026-06-09T14:00:00').toISOString(),
        endDate: new Date('2026-06-09T15:00:00').toISOString(),
        title: 'Standup',
      },
    ]);
    __setCalendarModuleForTests(cal);
    __setEffectiveTier('pro');

    const result = await getBusyWindows(
      new Date('2026-06-09T00:00:00'),
      new Date('2026-06-09T23:59:00')
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Standup');
  });
});
