// src/components/SubjectsComponent.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  Snackbar,
  Container,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  TablePagination,
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from "../../api/subjectsApi";
import { useLazyGetTeachersQuery } from "../../api/teachersApi";
import Popup from "../Popup/Popup";

const SubjectsComponent: React.FC = () => {
  const {
    data: response,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useGetSubjectsQuery({});
  const [trigger, { data: data1 }] = useLazyGetTeachersQuery();
  const subjects = response?.data || [];

  const [newSubjectName, setNewSubjectName] = useState("");
  const [editSubjectNames, setEditSubjectNames] = useState<{ [id: number]: string }>({});
  const [isEditing, setIsEditing] = useState<{ [id: number]: boolean }>({});
  const [createSubject] = useCreateSubjectMutation();
  const [updateSubject] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (isSuccess) {
      setEditSubjectNames(subjects.reduce((acc, curr) => {
        acc[curr.id] = curr.name;
        return acc;
      }, {} as { [id: number]: string }));
      setIsEditing(subjects.reduce((acc, curr) => {
        acc[curr.id] = false;
        return acc;
      }, {} as { [id: number]: boolean }));
    }
  }, [subjects, isSuccess]);

  const handleCreateSubject = async () => {
    try {
      await createSubject({ name: newSubjectName }).unwrap();
      setNewSubjectName("");
      refetch();
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      setError("Failed to create subject.");
      setSnackbarOpen(true);
    }
  };

  const handleUpdateSubject = async (id: number) => {
    try {
      await updateSubject({ id, data: { name: editSubjectNames[id] } }).unwrap();
      setIsEditing({ ...isEditing, [id]: false });
      refetch();
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      setError("Failed to update subject.");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    try {
      await deleteSubject(id).unwrap();
      refetch();
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      setError("Failed to delete subject.");
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
    setClassData(trigger({ subject_ids: [id] }));
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
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Ошибка.</Typography>;

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>Subjects</Typography>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: "100%" }}>
          {error ? error : "Operation successful"}
        </Alert>
      </Snackbar>
      <Box mb={3}>
        <TextField
          label="New Subject Name"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleCreateSubject}>
          Create Subject
        </Button>
      </Box>
      <Paper>
        <List>
          {subjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((subject) => (
            <ListItem key={subject.id}>
              {isEditing[subject.id] ? (
                <TextField
                  value={editSubjectNames[subject.id]}
                  onChange={(e) =>
                    setEditSubjectNames({ ...editSubjectNames, [subject.id]: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                />
              ) : (
                <ListItemText
                  primary={subject.name}
                  onClick={() => handleShowPopupClassInfo(subject.id)}
                  style={{ cursor: "pointer" }}
                />
              )}
              <ListItemSecondaryAction>
                {isEditing[subject.id] ? (
                  <>
                    <IconButton onClick={() => handleUpdateSubject(subject.id)} color="primary">
                      <Save />
                    </IconButton>
                    <IconButton onClick={() => handleCancelClick(subject.id)} color="secondary">
                      <Cancel />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => handleEditClick(subject.id)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteSubject(subject.id)} color="secondary">
                      <Delete />
                    </IconButton>
                  </>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={subjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Popup isOpen={isPopupOpen} onClose={handleClosePopup}>
        {data1 && data1.data.length > 0 ? (
          <Box>
            {data1.data.map((studentInfo) => (
              <Box key={studentInfo.id}>
                <Typography>Имя: {studentInfo.first_name}</Typography>
                <Typography>Фамилия: {studentInfo.middle_name}</Typography>
                <Typography>Отчество: {studentInfo.last_name}</Typography>
                <Typography>Номер телефона: {studentInfo.phone}</Typography>
                <Typography>Кабинет: {studentInfo.room_id}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>Пусто</Typography>
        )}
      </Popup>
    </Container>
  );
};

export default SubjectsComponent;
