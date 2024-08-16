import { signal, useSignalEffect } from '@preact/signals';
import type { IEventCalendar } from '../interfaces/Calendar';
import Loading from '../templates/Loading';

const eventsData = signal<IEventCalendar[][] | null>(null);
const currentDayIndex = new Date().getDay() - 1;
const currentEvent = signal<IEventCalendar | null>(null);
const nextEvent = signal<IEventCalendar | null>(null);
const loading = signal(true);

function Calendar() {
  const getTimeFromString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  useSignalEffect(() => {
    fetch('https://api.loxewyx.com/drive/calendar')
      .then(async (res) => {
        eventsData.value = (await res.json()) as IEventCalendar[][];

        let matchingEvent: IEventCalendar | null = null;
        let nextEventIndex = -1;

        const currentDayEvents = eventsData.value
          ? eventsData.value[currentDayIndex] || []
          : [];

        currentDayEvents.forEach((event, index) => {
          const eventStartTime = getTimeFromString(event.from);
          const eventEndTime = getTimeFromString(event.to);
          const currentTime = new Date();

          if (currentTime >= eventStartTime && currentTime < eventEndTime) {
            matchingEvent = event;
            nextEventIndex = index + 1;
          }
        });

        if (matchingEvent !== null) {
          currentEvent.value = matchingEvent;

          nextEvent.value =
            nextEventIndex < currentDayEvents.length
              ? currentDayEvents[nextEventIndex]
              : null;
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        loading.value = false;
      });
  });

  return loading.value ? (
    <Loading className='hidden' />
  ) : (
    <div className='hidden event-calendar mb-4'>
      {currentEvent.value !== null ? (
        <div className='current-card'>
          <div className='card'>
            <div className='card-header'>Ara</div>
            <div className='card-body'>
              <div className='card-title'>
                {currentEvent.value.uf} ({currentEvent.value.from} -{' '}
                {currentEvent.value.to})
              </div>
              <div className='card-text'>{currentEvent.value.teacher}</div>
              <div className='card-text'>{currentEvent.value.room}</div>
            </div>
          </div>
        </div>
      ) : (
        <p className='hidden'>No hi ha classe per ara.</p>
      )}

      {nextEvent.value !== null && (
        <div className='hidden next-card mt-3'>
          <div className='card'>
            <div className='card-header'>Següent hora</div>
            <div className='card-body'>
              <div className='card-title'>
                {nextEvent.value.uf} ({nextEvent.value.from} -{' '}
                {nextEvent.value.to})
              </div>
              <div className='card-text'>{nextEvent.value.teacher}</div>
              <div className='card-text'>{nextEvent.value.room}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
