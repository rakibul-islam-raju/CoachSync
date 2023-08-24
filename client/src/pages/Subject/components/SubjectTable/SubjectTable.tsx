/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, FC, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridToolbar,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
} from "@mui/x-data-grid";
import {
  useDeleteSubjectMutation,
  useGetSubjectsQuery,
  useUpdateSubjectMutation,
} from "../../../../redux/subject/subjectApi";
import { ISubject } from "../../../../redux/subject/subject.type";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { toast } from "react-toastify";
import ConfirmDialogue from "../../../../components/ConfirmDialogue/ConfirmDialogue";
import { PAGE_SIZE_OPTIONS, RESULTS_PER_PAGE } from "../../../../config";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { removeParam, setParams } from "../../../../redux/subject/subjectSlice";

const SubjectTable: FC = () => {
  const dispatch = useAppDispatch();
  const { params } = useAppSelector(state => state.subject);

  const [rows, setRows] = useState<ISubject[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: RESULTS_PER_PAGE,
  });

  const { data, isLoading, isError, error } = useGetSubjectsQuery({
    ...params,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<number | null>(null);
  const [promiseArguments, setPromiseArguments] = useState<any>(null);
  const [rowCountState, setRowCountState] = useState<number>(data?.count || 0);

  const [
    updateSubject,
    { isError: isEditError, error: editError, isSuccess: isEditSuccess },
  ] = useUpdateSubjectMutation();

  const [
    deleteSubject,
    { isError: isDeleteError, isSuccess: isDeleteSuccess, error: deleteError },
  ] = useDeleteSubjectMutation();

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const handlePaginationModelChange = (pageModel: GridPaginationModel) => {
    setPaginationModel({ ...pageModel });

    const limit = pageModel.pageSize;
    const offset = pageModel.page * pageModel.pageSize;
    dispatch(setParams({ limit, offset }));
  };

  // handle sorting
  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    if (sortModel.length > 0) {
      const item = sortModel[0];
      const sortType = item.sort;
      const sortField = String(item.field);
      const sortParam = sortType === "asc" ? sortField : `-${sortField}`;

      dispatch(setParams({ ordering: sortParam }));
    }
  }, []);

  // handle filtering
  const onFilterChange = (filterModel: GridFilterModel) => {
    if (filterModel.items.length > 0) {
      const filterField = filterModel.items[0].field;
      const filterValue = filterModel.items[0].value;

      if (filterField && filterValue) {
        dispatch(setParams({ [filterField]: filterValue }));
      } else if (filterField && !filterValue) {
        dispatch(removeParam(filterField));
      }
    }
  };

  // handle stop editing row
  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  // click edit
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  // save edit row
  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  // handle click delete
  const handleDeleteClick = (id: GridRowId) => () => {
    setSubjectToDelete(Number(id));
    setDeleteDialogOpen(true);
  };

  // delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  // confirm delete
  const confirmDelete = () => {
    if (subjectToDelete) {
      deleteSubject(subjectToDelete);
      closeDeleteDialog();
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  // edit process
  const processRowUpdate = useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel) =>
      new Promise<GridRowModel>((resolve, reject) => {
        // Save the arguments to resolve or reject the promise later
        setPromiseArguments({ resolve, reject, newRow, oldRow });
      }),
    [],
  );

  // cancel edit
  const handleNo = () => {
    const { oldRow, resolve } = promiseArguments;
    resolve(oldRow); // Resolve with the old row to not update the internal state
    setPromiseArguments(null);
  };

  // save edit row
  const handleYes = () => {
    const { newRow, oldRow, reject, resolve } = promiseArguments;

    // save updated data
    if (newRow.id) {
      updateSubject({ id: newRow.id, data: newRow });
      resolve(newRow);
    } else {
      reject(oldRow);
    }
    setPromiseArguments(null);
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // table columns
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      type: "string",
      flex: 1,
      editable: true,
    },
    {
      field: "code",
      headerName: "Code",
      type: "string",
      flex: 1,
      editable: true,
    },
    {
      field: "created_at",
      headerName: "Created At",
      type: "dateTime",
      flex: 1,
      editable: false,
      filterable: false,
      valueGetter: params => new Date(params.value as string),
    },
    {
      field: "updated_at",
      headerName: "Updated At",
      type: "dateTime",
      flex: 1,
      editable: false,
      filterable: false,
      valueGetter: params => new Date(params.value as string),
    },
    {
      field: "is_active",
      headerName: "Active",
      type: "boolean",
      flex: 1,
      editable: true,
      sortable: false,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  useEffect(() => {
    if (data?.results && data?.results.length > 0) {
      setRows(data?.results);
    } else {
      setRows([]);
    }
  }, [data?.results]);

  useEffect(() => {
    if (isEditSuccess) {
      toast.success("Subject edited successfully");
    }
    if (isDeleteSuccess) {
      toast.success("Subject deleted successfully");
    }
  }, [isDeleteSuccess, isEditSuccess]);

  useEffect(() => {
    setRowCountState(prevRowCountState =>
      data?.count !== undefined ? data?.count : prevRowCountState,
    );
  }, [data?.count, setRowCountState]);

  return (
    <Box>
      {(isError || isEditError || isDeleteError) && (
        <ErrorDisplay error={error || editError || deleteError} />
      )}

      {rows && (
        <Box
          sx={{
            width: "100%",
            "& .actions": {
              color: "text.secondary",
            },
            "& .textPrimary": {
              color: "text.primary",
            },
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            rowSelection={false}
            loading={isLoading}
            rowCount={rowCountState}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={handlePaginationModelChange}
            sortingMode="server"
            onSortModelChange={handleSortModelChange}
            filterMode="server"
            onFilterModelChange={onFilterChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            slots={{
              toolbar: GridToolbar,
            }}
          />
        </Box>
      )}

      {/* edit dialogue */}
      {!!promiseArguments && (
        <ConfirmDialogue
          open={!!promiseArguments}
          title="Edit Subject"
          message={"Are you want to save this subject?"}
          handleSubmit={handleYes}
          handleClose={handleNo}
        />
      )}

      {/* delete dialogue */}
      {deleteDialogOpen && (
        <ConfirmDialogue
          open={deleteDialogOpen}
          title="Delete Subject"
          message={"Are you want to delete this subject?"}
          handleSubmit={confirmDelete}
          handleClose={closeDeleteDialog}
        />
      )}
    </Box>
  );
};

export default SubjectTable;
