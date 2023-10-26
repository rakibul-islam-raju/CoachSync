import { Box, Grid, Skeleton } from "@mui/material";
import { FC } from "react";

type Props = {
  rows: number;
  cols: number;
};

const LoadingSkeleton: FC<Props> = ({ rows = 1, cols = 4 }) => {
  return (
    <Box sx={{ opacity: 0.5 }}>
      <Grid container spacing={1}>
        {[...Array(rows).keys()].map(row => (
          <Grid key={row} container item spacing={1}>
            {[...Array(cols).keys()].map(col => (
              <Grid key={col} item xs={12 / cols}>
                <Skeleton variant="rectangular" height={100} animation="wave" />
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LoadingSkeleton;
