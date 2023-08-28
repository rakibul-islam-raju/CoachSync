import { Pagination, Stack, Typography } from "@mui/material";
import { FC } from "react";

type CustomPaginationProps = {
  page: number;
  count: number;
  handleChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

const CustomPagination: FC<CustomPaginationProps> = ({
  page,
  count,
  handleChange,
}) => {
  return (
    <Stack direction={"row"} justifyContent={"space-between"} marginY={3}>
      <Typography>Page: {page}</Typography>
      <Pagination count={count} page={page} onChange={handleChange} />
    </Stack>
  );
};

export default CustomPagination;
