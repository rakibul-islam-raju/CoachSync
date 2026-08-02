import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PrintIcon from "@mui/icons-material/Print";
import PublishIcon from "@mui/icons-material/Publish";
import {
  Alert,
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
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
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal/Modal";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  useCreateGradeScaleMutation,
  useGetAssessmentReviewQuery,
  useGetExamTypeOutcomesQuery,
  useGetGradeScalesQuery,
  usePublishResultsMutation,
  useReopenPublicationMutation,
} from "../../redux/assessment/assessmentApi";
import {
  IGradeBand,
  IGradeScaleWrite,
} from "../../redux/assessment/assessment.type";
import { useAppSelector } from "../../redux/hook";

const initialBands: IGradeBand[] = [
  {
    minimum_percentage: 0,
    maximum_percentage: 32.99,
    grade: "F",
    grade_point: 0,
  },
  {
    minimum_percentage: 33,
    maximum_percentage: 49.99,
    grade: "D",
    grade_point: 1,
  },
  {
    minimum_percentage: 50,
    maximum_percentage: 59.99,
    grade: "C",
    grade_point: 2,
  },
  {
    minimum_percentage: 60,
    maximum_percentage: 69.99,
    grade: "B",
    grade_point: 3,
  },
  {
    minimum_percentage: 70,
    maximum_percentage: 79.99,
    grade: "A",
    grade_point: 4,
  },
  {
    minimum_percentage: 80,
    maximum_percentage: 100,
    grade: "A+",
    grade_point: 5,
  },
];

const publishingRoles = ["admin", "admin_staff", "org_admin"];

export default function ResultReview() {
  const navigate = useNavigate();
  const { examTypeId } = useParams();
  const typeId = Number(examTypeId);
  const role = useAppSelector(state => state.auth.user?.role);
  const canPublish = Boolean(role && publishingRoles.includes(role));
  const review = useGetAssessmentReviewQuery(typeId);
  const gradeScales = useGetGradeScalesQuery();
  const outcomes = useGetExamTypeOutcomesQuery(typeId);
  const [createScale, creatingScale] = useCreateGradeScaleMutation();
  const [publish, publishing] = usePublishResultsMutation();
  const [reopen, reopening] = useReopenPublicationMutation();
  const [scaleId, setScaleId] = useState(0);
  const [message, setMessage] = useState("");
  const [showRank, setShowRank] = useState(false);
  const [scaleForm, setScaleForm] = useState<IGradeScaleWrite | null>(null);

  const selectedScale =
    scaleId ||
    gradeScales.data?.results.find(scale => scale.is_default)?.id ||
    gradeScales.data?.results[0]?.id ||
    0;

  const saveScale = async () => {
    if (!scaleForm) return;
    try {
      const result = await createScale(scaleForm).unwrap();
      setScaleId(result.id);
      setScaleForm(null);
      toast.success("Grade scale created.");
    } catch {
      toast.error("Could not create the scale. Check for overlaps or gaps.");
    }
  };

  const publishResult = async () => {
    try {
      await publish({
        examTypeId: typeId,
        grade_scale: selectedScale,
        message,
        show_rank: showRank,
      }).unwrap();
      toast.success("Results published and notifications queued.");
    } catch {
      toast.error("Results are not ready to publish.");
    }
  };

  const reopenResult = async () => {
    const publicationId = outcomes.data?.[0]?.publication.id;
    if (!publicationId) return;
    try {
      await reopen(publicationId).unwrap();
      toast.success("Results reopened. Marks are drafts again.");
      navigate(`/exams/${typeId}/marks`);
    } catch {
      toast.error("Could not reopen this publication.");
    }
  };

  if (review.isLoading || gradeScales.isLoading || outcomes.isLoading) {
    return <Loader />;
  }
  const error = review.error || gradeScales.error || outcomes.error;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <>
      <CustomBreadcrumb
        list={[
          { label: "Dashboard", path: "/" },
          { label: "Exams", path: "/exams" },
          { label: "Result review", path: `/exams/${typeId}/results` },
        ]}
      />
      <PageContainer>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="h4">
              {review.data?.exam_type_name || "Result review"}
            </Typography>
            <Typography color="text.secondary">
              Verify completion, select a grade scale, and publish an immutable
              result snapshot.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <CustomButton onClick={() => navigate(`/exams/${typeId}/marks`)}>
              <ArrowBackIcon /> Mark entry
            </CustomButton>
            {!!outcomes.data?.length && (
              <CustomButton onClick={() => window.print()}>
                <PrintIcon /> Print
              </CustomButton>
            )}
          </Stack>
        </Stack>
        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {[
            ["Candidates", review.data?.candidate_count],
            ["Subject exams", review.data?.exam_count],
            ["Missing marks", review.data?.missing_marks],
            [
              "Verified",
              `${review.data?.verified_marks}/${review.data?.expected_marks}`,
            ],
          ].map(([label, value]) => (
            <Box
              key={String(label)}
              sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                minWidth: 160,
              }}
            >
              <Typography color="text.secondary">{label}</Typography>
              <Typography variant="h5">{value}</Typography>
            </Box>
          ))}
        </Stack>

        <Table size="small" sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Exam</TableCell>
              <TableCell>Entered</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {review.data?.exams.map(exam => (
              <TableRow key={exam.exam}>
                <TableCell>{exam.subject}</TableCell>
                <TableCell>{exam.name}</TableCell>
                <TableCell>
                  {exam.entered}/{exam.expected}
                </TableCell>
                <TableCell>
                  {exam.verified}/{exam.expected}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={
                      exam.verified === exam.expected && exam.expected
                        ? "Ready"
                        : "Incomplete"
                    }
                    color={
                      exam.verified === exam.expected && exam.expected
                        ? "success"
                        : "warning"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!outcomes.data?.length ? (
          <Box sx={{ mt: 3 }}>
            {!review.data?.ready_to_publish && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Every candidate must have verified marks for every active exam.
              </Alert>
            )}
            {!gradeScales.data?.results.length ? (
              <Alert
                severity="info"
                action={
                  canPublish ? (
                    <CustomButton
                      size="small"
                      onClick={() =>
                        setScaleForm({
                          name: "Default grade scale",
                          is_default: true,
                          bands: initialBands.map(band => ({ ...band })),
                        })
                      }
                    >
                      Create scale
                    </CustomButton>
                  ) : undefined
                }
              >
                The organization needs a grade scale before publishing.
              </Alert>
            ) : (
              <Stack spacing={2} sx={{ mt: 2, maxWidth: 640 }}>
                <Stack direction="row" spacing={1}>
                  <FormControl fullWidth>
                    <InputLabel>Grade scale</InputLabel>
                    <Select
                      value={selectedScale}
                      label="Grade scale"
                      onChange={event => setScaleId(Number(event.target.value))}
                    >
                      {gradeScales.data.results.map(scale => (
                        <MenuItem key={scale.id} value={scale.id}>
                          {scale.name}
                          {scale.is_default ? " (default)" : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {canPublish && (
                    <CustomButton
                      variant="outlined"
                      onClick={() =>
                        setScaleForm({
                          name: "",
                          is_default: false,
                          bands: initialBands.map(band => ({ ...band })),
                        })
                      }
                    >
                      <AddIcon /> Scale
                    </CustomButton>
                  )}
                </Stack>
                <TextField
                  label="Publication message"
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showRank}
                      onChange={event => setShowRank(event.target.checked)}
                    />
                  }
                  label="Show ranking to students and guardians"
                />
                {canPublish && (
                  <CustomButton
                    onClick={publishResult}
                    disabled={
                      !review.data?.ready_to_publish ||
                      !selectedScale ||
                      publishing.isLoading
                    }
                  >
                    <PublishIcon /> Publish results
                  </CustomButton>
                )}
              </Stack>
            )}
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="h5">Published outcomes</Typography>
              {canPublish && (
                <CustomButton
                  color="warning"
                  onClick={reopenResult}
                  disabled={reopening.isLoading}
                >
                  <EditNoteIcon /> Reopen for correction
                </CustomButton>
              )}
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Percentage</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outcomes.data.map(outcome => (
                  <TableRow key={outcome.id}>
                    <TableCell>{outcome.rank ?? "Hidden"}</TableCell>
                    <TableCell>
                      {outcome.student.student_id} —{" "}
                      {outcome.student.first_name} {outcome.student.last_name}
                    </TableCell>
                    <TableCell>
                      {outcome.total_obtained}/{outcome.total_possible}
                    </TableCell>
                    <TableCell>{outcome.percentage}%</TableCell>
                    <TableCell>{outcome.grade}</TableCell>
                    <TableCell>
                      <Chip
                        label={outcome.has_passed ? "Passed" : "Failed"}
                        color={outcome.has_passed ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </PageContainer>

      {scaleForm && (
        <Modal
          open
          fullWidth
          maxWidth="md"
          title="Create grade scale"
          onClose={() => setScaleForm(null)}
          onCancel={() => setScaleForm(null)}
          cancelText="Cancel"
          onConfirm={saveScale}
          confirmText={creatingScale.isLoading ? "Saving…" : "Save scale"}
          content={
            <Stack spacing={2}>
              <TextField
                label="Scale name"
                value={scaleForm.name}
                onChange={event =>
                  setScaleForm({ ...scaleForm, name: event.target.value })
                }
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={scaleForm.is_default}
                    onChange={event =>
                      setScaleForm({
                        ...scaleForm,
                        is_default: event.target.checked,
                      })
                    }
                  />
                }
                label="Use as organization default"
              />
              {scaleForm.bands.map((band, index) => (
                <Stack direction="row" spacing={1} key={index}>
                  <TextField
                    label="Minimum %"
                    type="number"
                    value={band.minimum_percentage}
                    onChange={event => {
                      const bands = [...scaleForm.bands];
                      bands[index] = {
                        ...band,
                        minimum_percentage: event.target.value,
                      };
                      setScaleForm({ ...scaleForm, bands });
                    }}
                  />
                  <TextField
                    label="Maximum %"
                    type="number"
                    value={band.maximum_percentage}
                    onChange={event => {
                      const bands = [...scaleForm.bands];
                      bands[index] = {
                        ...band,
                        maximum_percentage: event.target.value,
                      };
                      setScaleForm({ ...scaleForm, bands });
                    }}
                  />
                  <TextField
                    label="Grade"
                    value={band.grade}
                    onChange={event => {
                      const bands = [...scaleForm.bands];
                      bands[index] = { ...band, grade: event.target.value };
                      setScaleForm({ ...scaleForm, bands });
                    }}
                  />
                  <TextField
                    label="Grade point"
                    type="number"
                    value={band.grade_point}
                    onChange={event => {
                      const bands = [...scaleForm.bands];
                      bands[index] = {
                        ...band,
                        grade_point: event.target.value,
                      };
                      setScaleForm({ ...scaleForm, bands });
                    }}
                  />
                </Stack>
              ))}
            </Stack>
          }
        />
      )}
    </>
  );
}
