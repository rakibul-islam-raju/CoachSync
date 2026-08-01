import { Box, Divider, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import PageContainer from "../../components/PageContainer/PageContainer";
import { useAppSelector } from "../../redux/hook";
import { useUpdateProfileMutation } from "../../redux/user/userApi";

export default function Profile() {
  const user = useAppSelector(state => state.auth.user);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [updateProfile, result] = useUpdateProfileMutation();

  useEffect(() => {
    if (result.isSuccess) toast.success("Profile updated successfully.");
  }, [result.isSuccess]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    updateProfile({ first_name: firstName, last_name: lastName, phone });
  };

  return (
    <>
      <CustomBreadcrumb
        list={[
          { label: "Dashboard", path: "/" },
          { label: "Profile", path: "/profile" },
        ]}
      />
      <PageContainer>
        <Typography variant="h4">My profile</Typography>
        <Divider sx={{ my: 3 }} />
        <Box component="form" onSubmit={submit} sx={{ maxWidth: 600 }}>
          <Stack spacing={2}>
            <TextField
              label="First name"
              value={firstName}
              onChange={event => setFirstName(event.target.value)}
              required
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={event => setLastName(event.target.value)}
              required
            />
            <TextField
              label="Phone"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              required
            />
            <TextField label="Email" value={user?.email ?? ""} disabled />
            <TextField label="Role" value={user?.role ?? ""} disabled />
            <CustomButton type="submit" disabled={result.isLoading}>
              Save profile
            </CustomButton>
            {result.isError && <ErrorDisplay error={result.error} />}
          </Stack>
        </Box>
      </PageContainer>
    </>
  );
}
