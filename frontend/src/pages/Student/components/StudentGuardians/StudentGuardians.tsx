import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../../components/Loader";
import Modal from "../../../../components/Modal/Modal";
import {
  useCreateStudentGuardianMutation,
  useDeleteStudentGuardianMutation,
  useGetStudentGuardiansQuery,
} from "../../../../redux/student/studentApi";
import { IStudentGuardianWrite } from "../../../../redux/student/student.type";

const emptyGuardian: IStudentGuardianWrite = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  relationship: "guardian",
  is_primary: false,
  result_email_enabled: true,
};

export default function StudentGuardians({ studentId }: { studentId: string }) {
  const guardians = useGetStudentGuardiansQuery(studentId);
  const [createGuardian, creating] = useCreateStudentGuardianMutation();
  const [deleteGuardian] = useDeleteStudentGuardianMutation();
  const [form, setForm] = useState<IStudentGuardianWrite | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    try {
      await createGuardian({ studentId, data: form }).unwrap();
      setForm(null);
      toast.success("Guardian linked and invitation queued.");
    } catch {
      toast.error(
        "Could not link the guardian. Check email and phone details.",
      );
    }
  };

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
        <div>
          <Typography variant="h5">Parents and guardians</Typography>
          <Typography color="text.secondary">
            Linked guardians can view this student's published results.
          </Typography>
        </div>
        <CustomButton
          size="small"
          onClick={() => setForm({ ...emptyGuardian })}
        >
          <PersonAddIcon /> Link guardian
        </CustomButton>
      </Stack>
      {guardians.isLoading ? (
        <Loader />
      ) : guardians.error ? (
        <ErrorDisplay error={guardians.error} />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Relationship</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Result email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guardians.data?.results.map(link => (
              <TableRow key={link.id}>
                <TableCell>
                  {link.guardian.first_name} {link.guardian.last_name}
                  {link.is_primary ? " (primary)" : ""}
                </TableCell>
                <TableCell>{link.relationship}</TableCell>
                <TableCell>
                  {link.guardian.email}
                  <br />
                  {link.guardian.phone}
                </TableCell>
                <TableCell>
                  {link.result_email_enabled ? "Enabled" : "Disabled"}
                </TableCell>
                <TableCell>
                  <Tooltip title="Unlink guardian">
                    <IconButton
                      color="error"
                      onClick={() => deleteGuardian(link.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {form && (
        <Modal
          open
          title="Link parent or guardian"
          onClose={() => setForm(null)}
          content={
            <Stack component="form" spacing={2} onSubmit={submit}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="First name"
                  value={form.first_name}
                  onChange={event =>
                    setForm({ ...form, first_name: event.target.value })
                  }
                  required
                />
                <TextField
                  label="Last name"
                  value={form.last_name}
                  onChange={event =>
                    setForm({ ...form, last_name: event.target.value })
                  }
                  required
                />
              </Stack>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={event =>
                  setForm({ ...form, email: event.target.value })
                }
                required
              />
              <TextField
                label="Phone"
                value={form.phone}
                onChange={event =>
                  setForm({ ...form, phone: event.target.value })
                }
                required
              />
              <TextField
                select
                label="Relationship"
                value={form.relationship}
                onChange={event =>
                  setForm({
                    ...form,
                    relationship: event.target
                      .value as IStudentGuardianWrite["relationship"],
                  })
                }
              >
                <MenuItem value="father">Father</MenuItem>
                <MenuItem value="mother">Mother</MenuItem>
                <MenuItem value="guardian">Guardian</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_primary}
                    onChange={event =>
                      setForm({ ...form, is_primary: event.target.checked })
                    }
                  />
                }
                label="Primary guardian"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.result_email_enabled}
                    onChange={event =>
                      setForm({
                        ...form,
                        result_email_enabled: event.target.checked,
                      })
                    }
                  />
                }
                label="Email result publication notices"
              />
              <CustomButton type="submit" disabled={creating.isLoading}>
                Link and invite
              </CustomButton>
            </Stack>
          }
        />
      )}
    </>
  );
}
