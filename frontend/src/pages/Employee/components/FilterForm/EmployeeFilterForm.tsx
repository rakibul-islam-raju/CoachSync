import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import { employeeOrderings } from "../../../../constants/employee.constants";
import { getVisibleRoles } from "../../../../helpers/mapRoles";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { IUserParams } from "../../../../redux/user/user.type";
import { resetParams, setParams } from "../../../../redux/user/userSlice";

const EmployeeFilterForm: FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { params } = useAppSelector(state => state.user);

  const [args, setArgs] = useState<Partial<IUserParams> | null>(params);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setArgs({ ...args, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(setParams({ ...args }));
  };

  const handleReset = () => {
    dispatch(resetParams());
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Filter Employees
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Stack gap={1} component={"form"} onSubmit={handleSubmit}>
        <FormControl fullWidth>
          <FormLabel id="ordering">Sort by</FormLabel>
          <Select
            labelId="demo-simple-select-label"
            id="ordering"
            name="ordering"
            onChange={e => setArgs({ ...args, ordering: e.target.value })}
            value={args?.ordering}
            size="small"
          >
            {employeeOrderings.map(item => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel id="is_active">Active</FormLabel>
          <RadioGroup
            row
            name="is_active"
            onChange={handleChange}
            value={args?.is_active}
          >
            <FormControlLabel value={true} control={<Radio />} label="True" />
            <FormControlLabel value={false} control={<Radio />} label="False" />
          </RadioGroup>
        </FormControl>
        {(user?.role === "admin" || user?.role === "admin_staff") && (
          <>
            <FormControl>
              <FormLabel id="is_staff">Staff</FormLabel>
              <RadioGroup
                row
                name="is_staff"
                onChange={handleChange}
                value={args?.is_staff}
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="True"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="False"
                />
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel id="is_superuser">Superuser</FormLabel>
              <RadioGroup
                row
                name="is_superuser"
                onChange={handleChange}
                value={args?.is_superuser}
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="True"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="False"
                />
              </RadioGroup>
            </FormControl>
          </>
        )}
        <FormControl fullWidth>
          <FormLabel id="role">Select Role</FormLabel>
          <Select
            labelId="demo-simple-select-label"
            id="role"
            name="is_superuser"
            onChange={e => setArgs({ ...args, role: e.target.value })}
            value={args?.role}
            size="small"
          >
            {getVisibleRoles(user?.role).map(role => (
              <MenuItem key={role.role} value={role.role}>
                {role.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction={"row"} mt={2} gap={1} justifyContent={"flex-end"}>
          <CustomButton
            type="button"
            variant="outlined"
            size="small"
            color="warning"
            onClick={handleReset}
          >
            Reset
          </CustomButton>
          <CustomButton type="submit" size="small">
            Filter
          </CustomButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EmployeeFilterForm;
