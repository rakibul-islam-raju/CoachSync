import { Divider, Grid, Typography } from "@mui/material";
import { useState } from "react";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import PageContainer from "../../../components/PageContainer/PageContainer";
import { useAppDispatch } from "../../../redux/hook";
import { IScheduleDemoData } from "../../../redux/schedule/schedule.type";
import { removeDraftSchedule } from "../../../redux/schedule/scheduleSlice";
import NewScheduleList from "../components/NewScheduleList/NewScheduleList";
import ScheduleAddForm from "../components/scheduleForm/scheduleAddForm";

const breadCrumbList = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Schedule",
    path: "/schedules",
  },
  {
    label: "Add Schedule",
    path: "/add-schedules",
  },
];

const AddSchedule = () => {
  const dispatch = useAppDispatch();
  const [scheduleToEdit, setScheduleToEdit] =
    useState<IScheduleDemoData | null>(null);

  const handleAddToEdit = (data: IScheduleDemoData) => {
    dispatch(removeDraftSchedule(data.uuid));
    setScheduleToEdit(data);
  };

  const handleRemoveFromEdit = () => setScheduleToEdit(null);

  return (
    <>
      <CustomBreadcrumb list={breadCrumbList} />
      <PageContainer>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Add Schedules
            </Typography>
            <Divider sx={{ my: 2 }} />
            <ScheduleAddForm
              editData={scheduleToEdit}
              handleRemoveFromEdit={handleRemoveFromEdit}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <NewScheduleList handleAddToEdit={handleAddToEdit} />
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
};

export default AddSchedule;
