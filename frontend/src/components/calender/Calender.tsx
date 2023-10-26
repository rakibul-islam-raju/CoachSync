import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { addMinutes, isBefore, isSameDay } from "date-fns";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { CSSProperties, useMemo, useState } from "react";
import {
  Calendar as BigCalendar,
  EventPropGetter,
  dateFnsLocalizer,
} from "react-big-calendar";
import { ISchedule, IScheduleParams } from "../../redux/schedule/schedule.type";
import { useGetSchedulesQuery } from "../../redux/schedule/scheduleApi";
import Modal from "../Modal/Modal";
import EventDetails from "./EventDetails";
import LoadingSkeleton from "./LoadingSkeleton";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface IEvent extends ISchedule {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

const initialParams: IScheduleParams = {
  limit: 30,
  offset: 0,
  month: format(new Date(), "yyyy-MM"),
};

const Calender = () => {
  const theme = useTheme();
  const [params, setParams] = useState<IScheduleParams>(initialParams);

  const { data, isLoading } = useGetSchedulesQuery({ ...params });

  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const handleEventClick = (event: IEvent) => {
    setSelectedEvent(event);
  };

  const handleNavigate = (newDate: Date) => {
    const newMonth = format(newDate, "yyyy-MM");
    if (params?.month === newMonth) return;
    setParams({ ...params, month: newMonth });
  };

  const mappedEvents: IEvent[] = useMemo(() => {
    if (data?.results) {
      return data.results.map(event => {
        const combinedDateTime = `${event.date}T${event.time}`;
        const startTime = new Date(combinedDateTime);
        const endTime = addMinutes(startTime, event.duration);

        return {
          ...event,
          id: event.id,
          title: event.title,
          start: startTime,
          end: endTime,
        };
      });
    }
    return [];
  }, [data]);

  // Event color styles
  const eventStyleGetter: EventPropGetter<IEvent> = (event, start) => {
    const currentDate = new Date(); // Get the current date
    const isEventInPast = isBefore(start, currentDate);
    // const isEventInFuture = isAfter(start, currentDate);
    const isEventToday = isSameDay(start, currentDate);

    const style: CSSProperties = {
      backgroundColor: isEventInPast ? "#8e9396" : theme.palette.success.main,
      borderColor: "gray",
      textDecoration: isEventInPast ? "line-through" : "none",
    };

    if (isEventToday) {
      style.backgroundColor = theme.palette.primary.main;
    }

    return {
      style,
    };
  };

  return (
    <Box>
      {isLoading ? (
        <LoadingSkeleton rows={7} cols={7} />
      ) : (
        !!mappedEvents?.length && (
          <BigCalendar
            localizer={localizer}
            events={mappedEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 750 }}
            onSelectEvent={handleEventClick}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day"]}
          />
        )
      )}

      {selectedEvent && (
        <Modal
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          content={<EventDetails event={selectedEvent} />}
          maxWidth="sm"
        />
      )}
    </Box>
  );
};

export default Calender;
