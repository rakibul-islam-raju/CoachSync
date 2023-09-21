import { Grid } from "@mui/material";
import ErrorDisplay from "../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../components/Loader";
import { useGetOrgShortStatsQuery } from "../../../redux/organization/organizationApi";
import CountCard from "./CountCard";

const Counters = () => {
  const { data, isLoading, isError, error } =
    useGetOrgShortStatsQuery(undefined);

  return isLoading ? (
    <Loader />
  ) : isError ? (
    <ErrorDisplay error={error} />
  ) : (
    data && (
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <CountCard
            count={data.active_batches}
            label="Active Batches"
            link="/batches"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CountCard
            count={data.active_classes}
            label="Active Classes"
            link="/batches"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CountCard
            count={data.active_teachers}
            label="Active Teachers"
            link="/batches"
          />
        </Grid>
      </Grid>
    )
  );
};

export default Counters;
