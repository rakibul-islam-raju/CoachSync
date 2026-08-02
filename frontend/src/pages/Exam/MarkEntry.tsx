import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PublishIcon from "@mui/icons-material/Publish";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../components/Loader";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  useGenerateCandidatesMutation,
  useGetMarkSheetQuery,
  useSaveMarkSheetMutation,
  useSubmitMarkSheetMutation,
  useVerifyMarkSheetMutation,
} from "../../redux/assessment/assessmentApi";
import {
  AttendanceStatus,
  IMarkRow,
} from "../../redux/assessment/assessment.type";
import { useGetExamsQuery } from "../../redux/exam/examApi";
import { useAppSelector } from "../../redux/hook";

const reviewRoles = ["admin", "admin_staff", "org_admin"];

export default function MarkEntry() {
  const navigate = useNavigate();
  const { examTypeId } = useParams();
  const typeId = Number(examTypeId);
  const role = useAppSelector(state => state.auth.user?.role);
  const exams = useGetExamsQuery({ exam_type: typeId, limit: 100 });
  const [selectedExam, setSelectedExam] = useState(0);
  const markSheet = useGetMarkSheetQuery(selectedExam, {
    skip: !selectedExam,
  });
  const [rows, setRows] = useState<IMarkRow[]>([]);
  const [generateCandidates, generating] = useGenerateCandidatesMutation();
  const [saveMarks, saving] = useSaveMarkSheetMutation();
  const [submitMarks, submitting] = useSubmitMarkSheetMutation();
  const [verifyMarks, verifying] = useVerifyMarkSheetMutation();

  useEffect(() => {
    if (!selectedExam && exams.data?.results.length) {
      setSelectedExam(exams.data.results[0].id);
    }
  }, [exams.data, selectedExam]);

  useEffect(() => {
    if (markSheet.data) setRows(markSheet.data.rows);
  }, [markSheet.data]);

  const entered = useMemo(
    () =>
      rows.filter(
        row =>
          row.attendance_status !== "present" ||
          (row.obtained_mark !== null && row.obtained_mark !== ""),
      ).length,
    [rows],
  );

  const updateRow = (candidate: number, patch: Partial<IMarkRow>) => {
    setRows(current =>
      current.map(row =>
        row.candidate === candidate ? { ...row, ...patch } : row,
      ),
    );
  };

  const generate = async () => {
    try {
      const result = await generateCandidates(typeId).unwrap();
      toast.success(
        result.created
          ? `${result.created} candidates added.`
          : "Candidate roster is already up to date.",
      );
      markSheet.refetch();
    } catch {
      toast.error("Could not generate the candidate roster.");
    }
  };

  const save = async () => {
    try {
      await saveMarks({
        examId: selectedExam,
        marks: rows.map(row => ({
          candidate: row.candidate,
          attendance_status: row.attendance_status,
          obtained_mark:
            row.attendance_status === "present" ? row.obtained_mark : null,
          remark: row.remark,
        })),
      }).unwrap();
      toast.success("Draft marks saved.");
    } catch {
      toast.error("Could not save marks. Check every row and try again.");
    }
  };

  const submit = async () => {
    try {
      await submitMarks(selectedExam).unwrap();
      toast.success("Mark sheet submitted for review.");
    } catch {
      toast.error("Complete and save every candidate before submitting.");
    }
  };

  const verify = async () => {
    try {
      await verifyMarks(selectedExam).unwrap();
      toast.success("Mark sheet verified.");
    } catch {
      toast.error("Only a complete submitted sheet can be verified.");
    }
  };

  if (exams.isLoading) return <Loader />;
  if (exams.error) return <ErrorDisplay error={exams.error} />;

  return (
    <>
      <CustomBreadcrumb
        list={[
          { label: "Dashboard", path: "/" },
          { label: "Exams", path: "/exams" },
          { label: "Mark entry", path: `/exams/${typeId}/marks` },
        ]}
      />
      <PageContainer>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", mb: 2 }}
        >
          <Box>
            <Typography variant="h4">Mark entry</Typography>
            <Typography color="text.secondary">
              Save drafts, submit the complete sheet, then verify it before
              publishing.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <CustomButton onClick={() => navigate("/exams")}>
              <ArrowBackIcon /> Exams
            </CustomButton>
            <CustomButton onClick={generate} disabled={generating.isLoading}>
              <GroupAddIcon /> Generate roster
            </CustomButton>
            <CustomButton onClick={() => navigate(`/exams/${typeId}/results`)}>
              <PublishIcon /> Review result
            </CustomButton>
          </Stack>
        </Stack>

        {!exams.data?.results.length ? (
          <Alert severity="info">
            Add at least one subject exam to this exam period first.
          </Alert>
        ) : (
          <>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: { sm: "center" }, mb: 2 }}
            >
              <FormControl size="small" sx={{ minWidth: 280 }}>
                <InputLabel>Subject exam</InputLabel>
                <Select
                  label="Subject exam"
                  value={selectedExam || ""}
                  onChange={event =>
                    setSelectedExam(Number(event.target.value))
                  }
                >
                  {exams.data.results.map(exam => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.subject.name} — {exam.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {markSheet.data && (
                <Typography>
                  Entered {entered}/{rows.length} · Pass mark{" "}
                  {markSheet.data.exam.pass_mark} · Maximum{" "}
                  {markSheet.data.exam.total_mark}
                </Typography>
              )}
            </Stack>

            {markSheet.isFetching ? (
              <Loader />
            ) : markSheet.error ? (
              <ErrorDisplay error={markSheet.error} />
            ) : !rows.length ? (
              <Alert severity="warning">
                No candidates yet. Generate the roster from active batch
                enrollments.
              </Alert>
            ) : (
              <>
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student ID</TableCell>
                        <TableCell>Student</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Mark</TableCell>
                        <TableCell>Preview</TableCell>
                        <TableCell>Remark</TableCell>
                        <TableCell>Workflow</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map(row => {
                        const numericMark = Number(row.obtained_mark);
                        const validMark =
                          row.attendance_status === "present" &&
                          row.obtained_mark !== null &&
                          row.obtained_mark !== "";
                        return (
                          <TableRow key={row.candidate}>
                            <TableCell>{row.student.student_id}</TableCell>
                            <TableCell>
                              {row.student.first_name} {row.student.last_name}
                            </TableCell>
                            <TableCell>
                              <Select
                                size="small"
                                value={row.attendance_status}
                                onChange={event => {
                                  const attendance = event.target
                                    .value as AttendanceStatus;
                                  updateRow(row.candidate, {
                                    attendance_status: attendance,
                                    obtained_mark:
                                      attendance === "present"
                                        ? row.obtained_mark
                                        : null,
                                  });
                                }}
                              >
                                <MenuItem value="present">Present</MenuItem>
                                <MenuItem value="absent">Absent</MenuItem>
                                <MenuItem value="exempt">Exempt</MenuItem>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={row.obtained_mark ?? ""}
                                disabled={row.attendance_status !== "present"}
                                slotProps={{
                                  htmlInput: {
                                    min: 0,
                                    max: markSheet.data?.exam.total_mark,
                                    step: 0.01,
                                  },
                                }}
                                onChange={event =>
                                  updateRow(row.candidate, {
                                    obtained_mark: event.target.value,
                                  })
                                }
                                sx={{ width: 110 }}
                              />
                            </TableCell>
                            <TableCell>
                              {row.attendance_status === "absent" ? (
                                <Chip
                                  label="Absent"
                                  color="error"
                                  size="small"
                                />
                              ) : row.attendance_status === "exempt" ? (
                                <Chip label="Exempt" size="small" />
                              ) : validMark ? (
                                <Chip
                                  label={
                                    numericMark >=
                                    Number(markSheet.data?.exam.pass_mark)
                                      ? "Pass"
                                      : "Fail"
                                  }
                                  color={
                                    numericMark >=
                                    Number(markSheet.data?.exam.pass_mark)
                                      ? "success"
                                      : "error"
                                  }
                                  size="small"
                                />
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.remark}
                                onChange={event =>
                                  updateRow(row.candidate, {
                                    remark: event.target.value,
                                  })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip label={row.workflow_status} size="small" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <CustomButton onClick={save} disabled={saving.isLoading}>
                    <SaveIcon /> Save draft
                  </CustomButton>
                  <CustomButton
                    onClick={submit}
                    disabled={submitting.isLoading || entered !== rows.length}
                  >
                    <FactCheckIcon /> Submit
                  </CustomButton>
                  {role && reviewRoles.includes(role) && (
                    <CustomButton
                      onClick={verify}
                      disabled={verifying.isLoading}
                    >
                      <FactCheckIcon /> Verify
                    </CustomButton>
                  )}
                </Stack>
              </>
            )}
          </>
        )}
      </PageContainer>
    </>
  );
}
