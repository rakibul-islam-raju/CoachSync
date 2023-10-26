/* eslint-disable @typescript-eslint/no-explicit-any */

import { Box, Grid, Stack, Typography } from "@mui/material";
import { FC } from "react";
import { IEvent } from "./Calender";

type Props = {
  event: IEvent;
};

const EventDetails: FC<Props> = ({ event }) => {
  const eventInfo: { [key: string]: any } = {
    Date: event.date,
    Time: event.time,
    Duration: event.duration,
    Subject: event.subject.name,
    Teacher:
      event.teacher?.user.first_name + " " + event.teacher?.user.last_name,
  };

  return (
    <Box>
      <Grid container spacing={1}>
        {Object.keys(eventInfo).map(item => (
          <Grid item xs={12} key={item}>
            <Stack direction={"row"} gap={2}>
              <Typography variant="body1">{item}:</Typography>
              <Typography variant="body1" color={"gray"}>
                {eventInfo[item]}
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EventDetails;
