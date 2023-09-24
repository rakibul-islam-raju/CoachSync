import AddIcon from "@mui/icons-material/Add";
import TuneIcon from "@mui/icons-material/Tune";
import { Divider, Stack, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import CustomDrawer from "../../components/CustomDrawer/CustomDrawer";
import PageContainer from "../../components/PageContainer/PageContainer";
import SearchInput from "../../components/forms/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { removeParam, setParams } from "../../redux/schedule/scheduleSlice";
import ScheduleFilterForm from "./components/FilterForm/ScheduleFilterForm";
import ScheduleTable from "./components/ScheduleTable/ScheduleTable";

const breadCrumbList = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Schedule",
    path: "/schedules",
  },
];

export default function Schedule() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { params } = useAppSelector(state => state.schedule);

  const [searchText, setSearchText] = useState<string>(params.search ?? "");
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  // get debounced search term
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const handleOpenDrawer = () => setOpenDrawer(true);

  const handleCloseDrawer = () => setOpenDrawer(false);

  const handleCancelSearch = () => {
    setSearchText("");
    dispatch(removeParam("search"));
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      dispatch(setParams({ search: debouncedSearchTerm }));
    } else {
      dispatch(removeParam("search"));
    }
  }, [debouncedSearchTerm, dispatch]);

  return (
    <>
      <CustomBreadcrumb list={breadCrumbList} />

      <PageContainer>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <Typography variant="h4">Schedules</Typography>
          <Stack
            direction={"row"}
            alignItems={"center"}
            gap={1}
            flexWrap={"wrap"}
          >
            <SearchInput
              label="Search Subject"
              value={searchText}
              handleChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchText(e.target.value)
              }
              handleCancelSearch={handleCancelSearch}
            />
            <CustomButton
              variant="contained"
              onClick={() => navigate("/add-schedules")}
            >
              <AddIcon />
            </CustomButton>
            <CustomButton variant="contained" onClick={handleOpenDrawer}>
              <TuneIcon />
            </CustomButton>
          </Stack>
        </Stack>
        <Divider sx={{ my: 3 }} />
        <ScheduleTable />
      </PageContainer>

      {/* Drawer */}
      {openDrawer && (
        <CustomDrawer
          open={openDrawer}
          content={<ScheduleFilterForm />}
          onClose={handleCloseDrawer}
          onOpen={handleOpenDrawer}
        />
      )}
    </>
  );
}
