import { Box, Divider, Grid } from "@mui/material";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import PageContainer from "../../components/PageContainer/PageContainer";
import CountCard from "./components/CountCard";
import EnrollPiechart from "./components/EnrollPiechart";
import MonthlyTransactionBarChart from "./components/MonthlyTransactionBarChart";
import StudentPiechart from "./components/StudentPiechart";

const breadCrumbList = [
  {
    label: "Dashboard",
    path: "/",
  },
];

export default function Dashboard() {
  return (
    <>
      <CustomBreadcrumb list={breadCrumbList} />

      <Box mt={4}>
        <Box p={2} mb={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3}>
              <CountCard count={12} label="Active Batches" link="/batches" />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <CountCard count={12} label="Active Classes" link="/batches" />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <CountCard count={12} label="Active Students" link="/batches" />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <CountCard count={12} label="Active Teachers" link="/batches" />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <PageContainer>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <EnrollPiechart />
            </Grid>
            <Grid item xs={12} md={6}>
              <StudentPiechart />
            </Grid>
          </Grid>
          <Box my={3}>
            <MonthlyTransactionBarChart />
          </Box>
        </PageContainer>
      </Box>
    </>
  );
}
