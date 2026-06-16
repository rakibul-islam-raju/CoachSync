import { Box, Divider, Grid } from "@mui/material";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import PageContainer from "../../components/PageContainer/PageContainer";
import Counters from "./components/Counters";
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
      <Box sx={{
        mt: 4
      }}>
        <Box
          sx={{
            p: 2,
            mb: 2
          }}>
          <Counters />
        </Box>

        <Divider />

        <PageContainer>
          <Box sx={{
            mb: 5
          }}>
            <Grid container spacing={1}>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <EnrollPiechart />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <StudentPiechart />
              </Grid>
            </Grid>
          </Box>
          <Divider />
          <Box sx={{
            my: 4
          }}>
            <MonthlyTransactionBarChart />
          </Box>
        </PageContainer>
      </Box>
    </>
  );
}
