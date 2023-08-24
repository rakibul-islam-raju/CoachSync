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
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { toast } from "react-toastify";
import ConfirmDialogue from "../../../../components/ConfirmDialogue/ConfirmDialogue";
import { PAGE_SIZE_OPTIONS, RESULTS_PER_PAGE } from "../../../../config";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { ITeacher } from "../../../../redux/teacher/teacher.type";
import {
  useDeleteTeacherMutation,
  useGetTeachersQuery,
  useUpdateTeacherMutation,
} from "../../../../redux/teacher/teacherApi";
import { removeParam, setParams } from "../../../../redux/teacher/teacherSlice";

function mapSortModel(fieldName: string): string {
  switch (fieldName) {
    case "first_name":
      return "user__first_name";
    case "last_name":
      return "user__last_name";
    case "email":
      return "user__email";
    case "phone":
      return "user__phone";
    default:
      return fieldName;
  }
}

const TeacherTable: FC = () => {
  const dispatch = useAppDispatch();
  const { params } = useAppSelector(state => state.teacher);

  const [rows, setRows] = useState<ITeacher[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: RESULTS_PER_PAGE,
  });

  const { data, isLoading, isError, error } = useGetTeachersQuery({
    ...params,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<number | null>(null);
  const [promiseArguments, setPromiseArguments] = useState<any>(null);
  const [rowCountState, setRowCountState] = useState<number>(data?.count || 0);

  const [
    updateTeacher,
    { isError: isEditError, error: editError, isSuccess: isEditSuccess },
  ] = useUpdateTeacherMutation();

  const [
    deleteTeacher,
    { isError: isDeleteError, isSuccess: isDeleteSuccess, error: deleteError },
  ] = useDeleteTeacherMutation();

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  // handle pagination models
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
      const sortField = mapSortModel(String(item.field));
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
    setTeacherToDelete(Number(id));
    setDeleteDialogOpen(true);
  };

  // delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTeacherToDelete(null);
  };

  // confirm delete
  const confirmDelete = () => {
    if (teacherToDelete) {
      deleteTeacher(teacherToDelete);
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
      updateTeacher({ id: newRow.id, data: newRow });
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
      field: "first_name",
      headerName: "First Name",
      type: "string",
      flex: 1,
      editable: true,
      valueGetter: params => params.row.user.first_name,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      type: "string",
      flex: 1,
      editable: true,
      valueGetter: params => params.row.user.last_name,
    },
    {
      field: "email",
      headerName: "Email",
      type: "string",
      flex: 1,
      editable: true,
      valueGetter: params => params.row.user.email,
    },
    {
      field: "phone",
      headerName: "Phone",
      type: "string",
      flex: 1,
      editable: true,
      valueGetter: params => params.row.user.phone,
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
      toast.success("Teacher edited successfully");
    }
    if (isDeleteSuccess) {
      toast.success("Teacher deleted successfully");
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
            // onPaginationModelChange={setPaginationModel}
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
          title="Edit Teacher"
          message={"Are you want to save this Teacher?"}
          handleSubmit={handleYes}
          handleClose={handleNo}
        />
      )}

      {/* delete dialogue */}
      {deleteDialogOpen && (
        <ConfirmDialogue
          open={deleteDialogOpen}
          title="Delete Teacher"
          message={"Are you want to delete this Teacher?"}
          handleSubmit={confirmDelete}
          handleClose={closeDeleteDialog}
        />
      )}
    </Box>
  );
};

export default TeacherTable;
