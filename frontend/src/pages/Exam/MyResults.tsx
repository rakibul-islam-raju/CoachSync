import PrintIcon from "@mui/icons-material/Print";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../components/Loader";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  useGetChildOutcomesQuery,
  useGetMyChildrenQuery,
  useGetMyOutcomesQuery,
} from "../../redux/assessment/assessmentApi";
import { useAppSelector } from "../../redux/hook";

export default function MyResults() {
  const role = useAppSelector(state => state.auth.user?.role);
  const isGuardian = role === "guardian";
  const children = useGetMyChildrenQuery(undefined, { skip: !isGuardian });
  const [selectedChild, setSelectedChild] = useState(0);
  const ownOutcomes = useGetMyOutcomesQuery(undefined, { skip: isGuardian });
  const childOutcomes = useGetChildOutcomesQuery(selectedChild, {
    skip: !isGuardian || !selectedChild,
  });

  useEffect(() => {
    if (isGuardian && !selectedChild && children.data?.length) {
      setSelectedChild(children.data[0].id);
    }
  }, [children.data, isGuardian, selectedChild]);

  const outcomeQuery = isGuardian ? childOutcomes : ownOutcomes;
  if (children.isLoading || outcomeQuery.isLoading) return <Loader />;
  const error = children.error || outcomeQuery.error;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <>
      <CustomBreadcrumb
        list={[
          { label: "Home", path: "/" },
          { label: "Results", path: "/results" },
        ]}
      />
      <PageContainer>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", mb: 2 }}
        >
          <Box>
            <Typography variant="h4">
              {isGuardian ? "Children's results" : "My results"}
            </Typography>
            <Typography color="text.secondary">
              Official published outcomes and subject mark sheets.
            </Typography>
          </Box>
          <CustomButton onClick={() => window.print()}>
            <PrintIcon /> Print results
          </CustomButton>
        </Stack>

        {isGuardian && (
          <FormControl sx={{ minWidth: 300, mb: 2 }}>
            <InputLabel>Child</InputLabel>
            <Select
              value={selectedChild || ""}
              label="Child"
              onChange={event => setSelectedChild(Number(event.target.value))}
            >
              {children.data?.map(child => (
                <MenuItem key={child.id} value={child.id}>
                  {child.first_name} {child.last_name} ({child.student_id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {isGuardian && !children.data?.length ? (
          <Alert severity="info">
            No active student is linked to this guardian account. Contact the
            organization to add the relationship.
          </Alert>
        ) : !outcomeQuery.data?.length ? (
          <Alert severity="info">No results have been published yet.</Alert>
        ) : (
          <Stack spacing={2}>
            {outcomeQuery.data.map(outcome => (
              <Accordion key={outcome.id} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    sx={{ width: "100%", alignItems: { md: "center" } }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {outcome.publication.exam_type_name}
                      </Typography>
                      <Typography color="text.secondary">
                        {outcome.publication.batch_name} · Published{" "}
                        {new Date(
                          outcome.publication.published_at,
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography>
                      {outcome.total_obtained}/{outcome.total_possible} ·{" "}
                      {outcome.percentage}% · {outcome.grade}
                    </Typography>
                    {outcome.rank && <Chip label={`Rank ${outcome.rank}`} />}
                    <Chip
                      label={outcome.has_passed ? "Passed" : "Failed"}
                      color={outcome.has_passed ? "success" : "error"}
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  {outcome.publication.message && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {outcome.publication.message}
                    </Alert>
                  )}
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Pass mark</TableCell>
                        <TableCell>Percentage</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Result</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {outcome.lines.map(line => (
                        <TableRow key={line.id}>
                          <TableCell>
                            {line.subject} ({line.subject_code})
                          </TableCell>
                          <TableCell>{line.attendance_status}</TableCell>
                          <TableCell>
                            {line.obtained_mark ?? "—"}/{line.total_mark}
                          </TableCell>
                          <TableCell>{line.pass_mark}</TableCell>
                          <TableCell>
                            {line.percentage ? `${line.percentage}%` : "—"}
                          </TableCell>
                          <TableCell>{line.grade || "—"}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={line.has_passed ? "Pass" : "Fail"}
                              color={line.has_passed ? "success" : "error"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </PageContainer>
    </>
  );
}
