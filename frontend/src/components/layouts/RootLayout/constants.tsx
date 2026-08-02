import DashboardIcon from "@mui/icons-material/Dashboard";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import PeopleIcon from "@mui/icons-material/People";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import QuizIcon from "@mui/icons-material/Quiz";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GradingIcon from "@mui/icons-material/Grading";
import { OPERATIONAL_ROLES, Role } from "../../../constants/roles.constants";

export type IMenu = {
  icon: React.ReactNode;
  label: string;
  path: string;
  allowedRoles: Role[];
};

export const MAIN_MENUS: IMenu[] = [
  {
    icon: <DashboardIcon />,
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: OPERATIONAL_ROLES,
  },
  {
    icon: <GradingIcon />,
    label: "Results",
    path: "/results",
    allowedRoles: ["student", "guardian"],
  },
  {
    icon: <ScheduleIcon />,
    label: "Schedule",
    path: "/schedules",
    allowedRoles: OPERATIONAL_ROLES,
  },
  {
    icon: <QuizIcon />,
    label: "Exams",
    path: "/exams",
    allowedRoles: OPERATIONAL_ROLES,
  },
  {
    icon: <PeopleIcon />,
    label: "Student",
    path: "/students",
    allowedRoles: OPERATIONAL_ROLES,
  },
  {
    icon: <AccountBalanceIcon />,
    label: "Finance",
    path: "/finance",
    allowedRoles: OPERATIONAL_ROLES,
  },
  {
    icon: <PeopleAltIcon />,
    label: "Teacher",
    path: "/teachers",
    allowedRoles: OPERATIONAL_ROLES,
  },
  {
    icon: <Diversity3Icon />,
    label: "Batch",
    path: "/batches",
    allowedRoles: OPERATIONAL_ROLES,
  },
  {
    icon: <ViewModuleIcon />,
    label: "Class",
    path: "/classes",
    allowedRoles: OPERATIONAL_ROLES,
  },
  {
    icon: <ViewModuleIcon />,
    label: "Subject",
    path: "/subjects",
    allowedRoles: OPERATIONAL_ROLES,
  },
  {
    icon: <SupervisedUserCircleIcon />,
    label: "Employee",
    path: "/employees",
    allowedRoles: OPERATIONAL_ROLES,
  },
];
