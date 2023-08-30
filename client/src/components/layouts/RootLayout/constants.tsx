import DashboardIcon from "@mui/icons-material/Dashboard";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import PeopleIcon from "@mui/icons-material/People";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

export type IMenu = {
  icon: React.ReactNode;
  label: string;
  path: string;
};

export const MAIN_MENUS: IMenu[] = [
  {
    icon: <DashboardIcon />,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: <ScheduleIcon />,
    label: "Schedule",
    path: "/schedules",
  },
  {
    icon: <PeopleIcon />,
    label: "Student",
    path: "/students",
  },
  {
    icon: <PeopleAltIcon />,
    label: "Teacher",
    path: "/teachers",
  },
  {
    icon: <Diversity3Icon />,
    label: "Batch",
    path: "/batches",
  },
  {
    icon: <ViewModuleIcon />,
    label: "Class",
    path: "/classes",
  },
  {
    icon: <ViewModuleIcon />,
    label: "Subject",
    path: "/subjects",
  },
  {
    icon: <SupervisedUserCircleIcon />,
    label: "Employe",
    path: "/employees",
  },
];
