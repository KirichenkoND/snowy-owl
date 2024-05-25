// src/components/StudentsComponent.tsx
import React, { useEffect, useState } from 'react';
import {
    useGetStudentsQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} from '../../api/studentsApi';
import { useGetClassesQuery } from '../../api/classesApi';
import {
    Alert,
    Snackbar,
    Container,
    Box,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Paper,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TablePagination,
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';

const StudentsComponent: React.FC = () => {
    const { data: response, isLoading, isError, isSuccess, refetch } = useGetStudentsQuery({});
    const students = response?.data || [];

    const { data: classesResponse } = useGetClassesQuery({});
    const classes = classesResponse?.data || [];

    const [newStudent, setNewStudent] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        class_id: 0,
        password: '',
        phone: ''
    });

    const [editStudentData, setEditStudentData] = useState<{ [id: number]: any }>({});
    const [isEditing, setIsEditing] = useState<{ [id: number]: boolean }>({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [createStudent] = useCreateStudentMutation();
    const [updateStudent] = useUpdateStudentMutation();
    const [deleteStudent] = useDeleteStudentMutation();

    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        if (isSuccess) {
            setEditStudentData(students.reduce((acc, curr) => {
                acc[curr.id] = {
                    first_name: curr.first_name,
                    last_name: curr.last_name,
                    middle_name: curr.middle_name,
                    class_id: curr.class_id,
                    phone: curr.phone,
                };
                return acc;
            }, {} as { [id: number]: any }));
            setIsEditing(students.reduce((acc, curr) => {
                acc[curr.id] = false;
                return acc;
            }, {} as { [id: number]: boolean }));
        }
    }, [students, isSuccess]);

    const handleCreateStudent = async () => {
        try {
            await createStudent(newStudent).unwrap();
            setNewStudent({
                first_name: '',
                last_name: '',
                middle_name: '',
                class_id: 0,
                password: '',
                phone: ''
            });
            refetch();
            setError(null);
            setSnackbarOpen(true);
            setIsPopupOpen(false);
        } catch (error) {
            setError('Failed to create student.');
            setSnackbarOpen(true);
        }
    };

    const handleUpdateStudent = async (id: number) => {
        try {
            const { first_name, last_name, middle_name, class_id, phone } = editStudentData[id];
            await updateStudent({ id, data: { first_name, last_name, middle_name, class_id, phone, password: '' } }).unwrap();
            setIsEditing({ ...isEditing, [id]: false });
            refetch();
            setError(null);
            setSnackbarOpen(true);
        } catch (error) {
            setError('Failed to update student.');
            setSnackbarOpen(true);
        }
    };

    const handleDeleteStudent = async (id: number) => {
        try {
            await deleteStudent(id).unwrap();
            refetch();
            setError(null);
            setSnackbarOpen(true);
        } catch (error) {
            setError('Failed to delete student.');
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

    const handleOpenPopup = () => {
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
    if (isError) return <Alert severity="error">Ошибка.</Alert>;

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>Students</Typography>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                    {error ? error : "Operation successful"}
                </Alert>
            </Snackbar>
            <Button variant="contained" color="primary" onClick={handleOpenPopup}>
                Добавить студента
            </Button>
            <Dialog open={isPopupOpen} onClose={handleClosePopup}>
                <DialogTitle>Добавить нового студента</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Введите информацию о новом студенте.
                    </DialogContentText>
                    <Box
                        component="form"
                        noValidate
                        autoComplete="off"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Имя"
                            value={newStudent.first_name}
                            onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Фамилия"
                            value={newStudent.last_name}
                            onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Отчество"
                            value={newStudent.middle_name}
                            onChange={(e) => setNewStudent({ ...newStudent, middle_name: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Телефон"
                            value={newStudent.phone}
                            onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Выберите класс</InputLabel>
                            <Select
                                value={newStudent.class_id}
                                onChange={(e) => setNewStudent({ ...newStudent, class_id: Number(e.target.value) })}
                                label="Выберите класс"
                            >
                                <MenuItem value={0} disabled>Выберите класс</MenuItem>
                                {classes.map(cls => (
                                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePopup} color="secondary">
                        Отмена
                    </Button>
                    <Button onClick={handleCreateStudent} color="primary">
                        Добавить студента
                    </Button>
                </DialogActions>
            </Dialog>
            <Paper sx={{ marginTop: 3 }}>
                <List>
                    {students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student) => (
                        <ListItem key={student.id}>
                            {isEditing[student.id] ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
                                    <TextField
                                        label="Имя"
                                        value={editStudentData[student.id]?.first_name || ''}
                                        onChange={(e) => setEditStudentData({
                                            ...editStudentData,
                                            [student.id]: { ...editStudentData[student.id], first_name: e.target.value }
                                        })}
                                        variant="outlined"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Фамилия"
                                        value={editStudentData[student.id]?.last_name || ''}
                                        onChange={(e) => setEditStudentData({
                                            ...editStudentData,
                                            [student.id]: { ...editStudentData[student.id], last_name: e.target.value }
                                        })}
                                        variant="outlined"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Отчество"
                                        value={editStudentData[student.id]?.middle_name || ''}
                                        onChange={(e) => setEditStudentData({
                                            ...editStudentData,
                                            [student.id]: { ...editStudentData[student.id], middle_name: e.target.value }
                                        })}
                                        variant="outlined"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Телефон"
                                        value={editStudentData[student.id]?.phone || ''}
                                        onChange={(e) => setEditStudentData({
                                            ...editStudentData,
                                            [student.id]: { ...editStudentData[student.id], phone: e.target.value }
                                        })}
                                        variant="outlined"
                                        fullWidth
                                    />
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Выберите класс</InputLabel>
                                        <Select
                                            value={editStudentData[student.id]?.class_id || 0}
                                            onChange={(e) => setEditStudentData({
                                                ...editStudentData,
                                                [student.id]: { ...editStudentData[student.id], class_id: Number(e.target.value) }
                                            })}
                                            label="Выберите класс"
                                        >
                                            <MenuItem value={0} disabled>Выберите класс</MenuItem>
                                            {classes.map(cls => (
                                                <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Button variant="contained" color="primary" onClick={() => handleUpdateStudent(student.id)}>
                                            Сохранить
                                        </Button>
                                        <Button variant="outlined" color="secondary" onClick={() => handleCancelClick(student.id)}>
                                            Отмена
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <ListItemText
                                        primary={`${student.first_name} ${student.last_name} ${student.middle_name}`}
                                        secondary={`Класс: ${classes.find(cls => cls.id === student.class_id)?.name || 'N/A'}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleEditClick(student.id)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteStudent(student.id)} color="secondary">
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </>
                            )}
                        </ListItem>
                    ))}
                </List>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={students.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Container>
    );
};

export default StudentsComponent;
