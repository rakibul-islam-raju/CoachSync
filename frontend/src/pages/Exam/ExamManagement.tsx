import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventIcon from "@mui/icons-material/Event";
import GradingIcon from "@mui/icons-material/Grading";
import AssessmentIcon from "@mui/icons-material/Assessment";
import {
  Box,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal/Modal";
import PageContainer from "../../components/PageContainer/PageContainer";
import { useGetBatchesQuery } from "../../redux/batch/batchApi";
import {
  useCreateExamMutation,
  useCreateExamTypeMutation,
  useDeleteExamMutation,
  useDeleteExamTypeMutation,
  useGetExamsQuery,
  useGetExamTypesQuery,
  useUpdateExamMutation,
  useUpdateExamTypeMutation,
} from "../../redux/exam/examApi";
import {
  IExam,
  IExamType,
  IExamTypeWrite,
  IExamWrite,
} from "../../redux/exam/exam.type";
import { useGetSubjectsQuery } from "../../redux/subject/subjectApi";

const emptyExamType: IExamTypeWrite = {
  name: "",
  start_date: "",
  end_date: "",
  batch: 0,
  is_active: true,
};

const emptyExam: IExamWrite = {
  name: "",
  exam_type: 0,
  subject: 0,
  date: "",
  pass_mark: 1,
  total_mark: 100,
  is_required: true,
  is_active: true,
};

export default function ExamManagement() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [examTypeForm, setExamTypeForm] = useState<IExamTypeWrite | null>(null);
  const [examTypeId, setExamTypeId] = useState<number | null>(null);
  const [examForm, setExamForm] = useState<IExamWrite | null>(null);
  const [examId, setExamId] = useState<number | null>(null);
  const examTypes = useGetExamTypesQuery({ limit: 100, offset: 0 });
  const exams = useGetExamsQuery({ limit: 100, offset: 0 });
  const batches = useGetBatchesQuery({ limit: 100, offset: 0 });
  const subjects = useGetSubjectsQuery({ limit: 100, offset: 0 });
  const [createExamType, createExamTypeResult] = useCreateExamTypeMutation();
  const [updateExamType, updateExamTypeResult] = useUpdateExamTypeMutation();
  const [deleteExamType] = useDeleteExamTypeMutation();
  const [createExam, createExamResult] = useCreateExamMutation();
  const [updateExam, updateExamResult] = useUpdateExamMutation();
  const [deleteExam] = useDeleteExamMutation();

  useEffect(() => {
    if (createExamTypeResult.isSuccess || updateExamTypeResult.isSuccess) {
      toast.success("Exam type saved.");
      setExamTypeForm(null);
      setExamTypeId(null);
    }
  }, [createExamTypeResult.isSuccess, updateExamTypeResult.isSuccess]);

  useEffect(() => {
    if (createExamResult.isSuccess || updateExamResult.isSuccess) {
      toast.success("Exam saved.");
      setExamForm(null);
      setExamId(null);
    }
  }, [createExamResult.isSuccess, updateExamResult.isSuccess]);

  const editExamType = (item: IExamType) => {
    setExamTypeId(item.id);
    setExamTypeForm({
      name: item.name,
      start_date: item.start_date,
      end_date: item.end_date,
      batch: item.batch.id,
      is_active: item.is_active,
    });
  };

  const editExam = (item: IExam) => {
    setExamId(item.id);
    setExamForm({
      name: item.name,
      exam_type: item.exam_type.id,
      subject: item.subject.id,
      date: item.date,
      pass_mark: item.pass_mark,
      total_mark: item.total_mark,
      is_required: item.is_required,
      is_active: item.is_active,
    });
  };

  const submitExamType = (event: FormEvent) => {
    event.preventDefault();
    if (!examTypeForm) return;
    if (examTypeId) updateExamType({ id: examTypeId, data: examTypeForm });
    else createExamType(examTypeForm);
  };

  const submitExam = (event: FormEvent) => {
    event.preventDefault();
    if (!examForm) return;
    if (examId) updateExam({ id: examId, data: examForm });
    else createExam(examForm);
  };

  const loading = examTypes.isLoading || exams.isLoading;
  const queryError = examTypes.error || exams.error;

  return (
    <>
      <CustomBreadcrumb
        list={[
          { label: "Dashboard", path: "/" },
          { label: "Exams", path: "/exams" },
        ]}
      />
      <PageContainer>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          <Typography variant="h4">Exam management</Typography>
          <CustomButton
            onClick={() => {
              if (tab === 0) setExamTypeForm({ ...emptyExamType });
              else setExamForm({ ...emptyExam });
            }}
          >
            <AddIcon /> Add {tab === 0 ? "exam type" : "exam"}
          </CustomButton>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Tabs value={tab} onChange={(_event, value) => setTab(value)}>
          <Tab label="Exam types" />
          <Tab label="Exams" />
        </Tabs>
        {loading ? (
          <Loader />
        ) : queryError ? (
          <ErrorDisplay error={queryError} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                {tab === 0 ? (
                  <>
                    <TableCell>Name</TableCell>
                    <TableCell>Batch</TableCell>
                    <TableCell>Date range</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Marks</TableCell>
                  </>
                )}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tab === 0
                ? examTypes.data?.results.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.batch.name}</TableCell>
                      <TableCell>
                        {item.start_date} – {item.end_date}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Enter marks">
                          <IconButton
                            onClick={() => navigate(`/exams/${item.id}/marks`)}
                          >
                            <GradingIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Review and publish results">
                          <IconButton
                            onClick={() =>
                              navigate(`/exams/${item.id}/results`)
                            }
                          >
                            <AssessmentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => editExamType(item)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => deleteExamType(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                : exams.data?.results.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.exam_type.name}</TableCell>
                      <TableCell>{item.subject.name}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>
                        {item.pass_mark}/{item.total_mark}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Schedule exam">
                          <IconButton
                            onClick={() =>
                              navigate(`/add-schedules?exam=${item.id}`)
                            }
                          >
                            <EventIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => editExam(item)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => deleteExam(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        )}
      </PageContainer>

      {examTypeForm && (
        <Modal
          open
          title={examTypeId ? "Edit exam type" : "Create exam type"}
          onClose={() => setExamTypeForm(null)}
          content={
            <Box component="form" onSubmit={submitExamType}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={examTypeForm.name}
                  onChange={event =>
                    setExamTypeForm({
                      ...examTypeForm,
                      name: event.target.value,
                    })
                  }
                  required
                />
                <TextField
                  select
                  label="Batch"
                  value={examTypeForm.batch || ""}
                  onChange={event =>
                    setExamTypeForm({
                      ...examTypeForm,
                      batch: Number(event.target.value),
                    })
                  }
                  required
                >
                  {batches.data?.results.map(item => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Start date"
                  type="date"
                  value={examTypeForm.start_date}
                  onChange={event =>
                    setExamTypeForm({
                      ...examTypeForm,
                      start_date: event.target.value,
                    })
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
                <TextField
                  label="End date"
                  type="date"
                  value={examTypeForm.end_date}
                  onChange={event =>
                    setExamTypeForm({
                      ...examTypeForm,
                      end_date: event.target.value,
                    })
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={examTypeForm.is_active}
                      onChange={event =>
                        setExamTypeForm({
                          ...examTypeForm,
                          is_active: event.target.checked,
                        })
                      }
                    />
                  }
                  label="Active"
                />
                <CustomButton type="submit">Save</CustomButton>
                {(createExamTypeResult.isError ||
                  updateExamTypeResult.isError) && (
                  <ErrorDisplay
                    error={
                      createExamTypeResult.error || updateExamTypeResult.error
                    }
                  />
                )}
              </Stack>
            </Box>
          }
        />
      )}

      {examForm && (
        <Modal
          open
          title={examId ? "Edit exam" : "Create exam"}
          onClose={() => setExamForm(null)}
          content={
            <Box component="form" onSubmit={submitExam}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={examForm.name}
                  onChange={event =>
                    setExamForm({ ...examForm, name: event.target.value })
                  }
                  required
                />
                <TextField
                  select
                  label="Exam type"
                  value={examForm.exam_type || ""}
                  onChange={event => {
                    const selected = examTypes.data?.results.find(
                      item => item.id === Number(event.target.value),
                    );
                    setExamForm({
                      ...examForm,
                      exam_type: Number(event.target.value),
                      date: selected?.start_date ?? examForm.date,
                    });
                  }}
                  required
                >
                  {examTypes.data?.results.map(item => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Subject"
                  value={examForm.subject || ""}
                  onChange={event =>
                    setExamForm({
                      ...examForm,
                      subject: Number(event.target.value),
                    })
                  }
                  required
                >
                  {subjects.data?.results.map(item => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Date"
                  type="date"
                  value={examForm.date}
                  onChange={event =>
                    setExamForm({ ...examForm, date: event.target.value })
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Pass mark"
                    type="number"
                    value={examForm.pass_mark}
                    onChange={event =>
                      setExamForm({
                        ...examForm,
                        pass_mark: Number(event.target.value),
                      })
                    }
                    required
                  />
                  <TextField
                    label="Total mark"
                    type="number"
                    value={examForm.total_mark}
                    onChange={event =>
                      setExamForm({
                        ...examForm,
                        total_mark: Number(event.target.value),
                      })
                    }
                    required
                  />
                </Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={examForm.is_required ?? true}
                      onChange={event =>
                        setExamForm({
                          ...examForm,
                          is_required: event.target.checked,
                        })
                      }
                    />
                  }
                  label="Required to pass overall"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={examForm.is_active}
                      onChange={event =>
                        setExamForm({
                          ...examForm,
                          is_active: event.target.checked,
                        })
                      }
                    />
                  }
                  label="Active"
                />
                <CustomButton type="submit">Save</CustomButton>
                {(createExamResult.isError || updateExamResult.isError) && (
                  <ErrorDisplay
                    error={createExamResult.error || updateExamResult.error}
                  />
                )}
              </Stack>
            </Box>
          }
        />
      )}
    </>
  );
}
