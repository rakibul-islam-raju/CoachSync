import {
  Card,
  CardActions,
  CardActionsProps,
  CardContent,
  CardProps,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

const StyledCard = styled(Card)<CardProps>(({ theme }) => ({
  border: "1px solid",
  borderColor: theme.palette.primary.light,
  textAlign: "center",
}));

const StyledCardActions = styled(CardActions)<CardActionsProps>(
  ({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    color: "white",
    cursor: "pointer",
    textAlign: "center",
  }),
);

type DashboardCardProps = {
  count: number;
  label: string;
  link: string;
};

const CountCard: FC<DashboardCardProps> = ({ count, label, link }) => {
  const navigate = useNavigate();

  const handleClick = () => navigate(link);

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h4">{count}</Typography>
        <Typography variant="h6" color={"gray"}>
          {label}
        </Typography>
      </CardContent>
      <StyledCardActions
        sx={{ backgroundColor: "primary" }}
        onClick={handleClick}
      >
        View All
      </StyledCardActions>
    </StyledCard>
  );
};

export default CountCard;
