// src/components/ClassesComponent.tsx
import React, { useEffect, useState } from "react";
import {
  useGetClassesQuery,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useCreateClassMutation,
  useLazyGetClassesQuery,
} from "../../api/classesApi";
import {
  Alert,
  CircularProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  TablePagination,
} from "@mui/material";
import Popup from "../Popup/Popup";
import { useLazyGetStudentsQuery } from "../../api/studentsApi";

const ClassesComponent: React.FC = () => {
  const {
    data: response,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useGetClassesQuery({});
  const classes = response?.data || [];
  const [trigger, { data: data1, isLoading: classInfoisLoading }] =
    useLazyGetStudentsQuery();
  const [newClassName, setNewClassName] = useState("");
  const [editClassNames, setEditClassNames] = useState<{
    [id: number]: string;
  }>({});
  const [isEditing, setIsEditing] = useState<{ [id: number]: boolean }>({});
  const [createClass] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();
  const [classData, setClassData] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (isSuccess) {
      setEditClassNames(
        classes.reduce((acc, curr) => {
          acc[curr.id] = curr.name;
          return acc;
        }, {} as { [id: number]: string })
      );
      setIsEditing(
        classes.reduce((acc, curr) => {
          acc[curr.id] = false;
          return acc;
        }, {} as { [id: number]: boolean })
      );
    }
  }, [classes, isSuccess]);

  const handleCreateClass = async () => {
    try {
      await createClass({ name: newClassName }).unwrap();
      setNewClassName("");
      refetch();
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      setError("Failed to create class.");
      setSnackbarOpen(true);
    }
  };

  const handleUpdateClass = async (id: number) => {
    try {
      await updateClass({ id, data: { name: editClassNames[id] } }).unwrap();
      setIsEditing({ ...isEditing, [id]: false });
      refetch();
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      setError("Failed to update class.");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClass = async (id: number) => {
    try {
      await deleteClass(id).unwrap();
      refetch();
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      setError("Failed to delete class.");
      setSnackbarOpen(true);
    }
  };

  const handleEditClick = (id: number) => {
    setIsEditing({ ...isEditing, [id]: true });
  };

  const handleCancelClick = (id: number) => {
    setIsEditing({ ...isEditing, [id]: false });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleShowPopupClassInfo = (id: number) => {
    setClassData(trigger({ class_ids: [id] }));
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, rowsPerPage));
    setPage(0);
  };

  if (isLoading)
    return (
      <div>
        <CircularProgress />
      </div>
    );
  if (isError) return <Alert severity="error">Ошибка.</Alert>;

  return (
    <div>
      <h1>Classes</h1>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error ? error : "Operation successful"}
        </Alert>
      </Snackbar>
      <TextField
        label="New Class Name"
        value={newClassName}
        onChange={(e) => setNewClassName(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleCreateClass}>
        Create Class
      </Button>
      <div style={{ margin: "5%" }}>
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell
                      onClick={() => handleShowPopupClassInfo(classItem.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {isEditing[classItem.id] ? (
                        <TextField
                          value={editClassNames[classItem.id]}
                          onChange={(e) =>
                            setEditClassNames({
                              ...editClassNames,
                              [classItem.id]: e.target.value,
                            })
                          }
                          variant="outlined"
                          fullWidth
                        />
                      ) : (
                        classItem.name
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {isEditing[classItem.id] ? (
                        <>
                          <Button
                            onClick={() => handleUpdateClass(classItem.id)}
                            variant="contained"
                            color="primary"
                            sx={{ marginRight: 1 }}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => handleCancelClick(classItem.id)}
                            variant="outlined"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleEditClick(classItem.id)}
                            variant="contained"
                            color="primary"
                            sx={{ marginRight: 1 }}
                          >
                            Update
                          </Button>
                          <Button
                            onClick={() => handleDeleteClass(classItem.id)}
                            variant="contained"
                            color="secondary"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={classes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </div>
      <Popup isOpen={isPopupOpen} onClose={handleClosePopup}>
        {data1 && data1.data.length > 0 ? (
          <div>
            {data1.data.map((studentInfo) => (
              <>
                <p>Имя:{studentInfo.first_name}</p>
                <p>Фамилия:{studentInfo.middle_name}</p>
                <p>Отчество:{studentInfo.last_name}</p>
                <p>Номер телефона:{studentInfo.phone}</p>
              </>
            ))}
          </div>
        ) : (
          <p>Пусто</p>
        )}
      </Popup>
    </div>
  );
};

export default ClassesComponent;
