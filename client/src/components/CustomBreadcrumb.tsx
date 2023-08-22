import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Box, Link, Typography, styled } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

const BreadcrumbWrapper = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  borderRadius: "50px",
  padding: "4px 8px",
  border: `1px solid #ddd`,
}));

type Menu = {
  label: string;
  path: string;
};

type Props = {
  list: Menu[];
};

export default function CustomBreadcrumb({ list }: Props) {
  return (
    <BreadcrumbWrapper>
      <AccountTreeIcon color="primary" />
      <Breadcrumbs aria-label="breadcrumb">
        {list?.length > 0 &&
          list.map((item, i) => (
            <Link
              key={item.label}
              component={RouterLink}
              to={item.path}
              color={i + 1 === list.length ? "text.primary" : "inherit"}
              underline="hover"
            >
              <Typography>{item.label}</Typography>
            </Link>
          ))}
      </Breadcrumbs>
    </BreadcrumbWrapper>
  );
}
