// src/components/TeachersComponent.tsx
import React, { useEffect, useState } from 'react';
import {
    useGetTeachersQuery,
    useCreateTeacherMutation,
    useUpdateTeacherMutation,
    useDeleteTeacherMutation,
} from '../../api/teachersApi';
import { useGetRoomsQuery } from '../../api/roomsApi';
import { useGetSubjectsQuery } from '../../api/subjectsApi';
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

const TeachersComponent: React.FC = () => {
    const { data: response, isLoading, isError, isSuccess, refetch } = useGetTeachersQuery({});
    const teachers = response?.data || [];

    const { data: roomsResponse } = useGetRoomsQuery({});
    const rooms = roomsResponse?.data || [];

    const { data: subjectsResponse } = useGetSubjectsQuery({});
    const subjects = subjectsResponse?.data || [];

    const [newTeacher, setNewTeacher] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        password: '',
        phone: '',
        room_id: 0,
        subject_id: 0
    });

    const [editTeacherData, setEditTeacherData] = useState<{ [id: number]: any }>({});
    const [isEditing, setIsEditing] = useState<{ [id: number]: boolean }>({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [createTeacher] = useCreateTeacherMutation();
    const [updateTeacher] = useUpdateTeacherMutation();
    const [deleteTeacher] = useDeleteTeacherMutation();

    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        if (isSuccess) {
            setEditTeacherData(teachers.reduce((acc, curr) => {
                acc[curr.id] = {
                    first_name: curr.first_name,
                    last_name: curr.last_name,
                    middle_name: curr.middle_name,
                    phone: curr.phone,
                    subject_id: curr.subject_id,
                    room_id: curr.room_id,
                };
                return acc;
            }, {} as { [id: number]: any }));
            setIsEditing(teachers.reduce((acc, curr) => {
                acc[curr.id] = false;
                return acc;
            }, {} as { [id: number]: boolean }));
        }
    }, [teachers, isSuccess]);

    const handleCreateTeacher = async () => {
        try {
            await createTeacher(newTeacher).unwrap();
            setNewTeacher({
                first_name: '',
                last_name: '',
                middle_name: '',
                password: '',
                phone: '',
                room_id: 0,
                subject_id: 0
            });
            refetch();
            setError(null);
            setSnackbarOpen(true);
            setIsPopupOpen(false);
        } catch (error) {
            setError('Failed to create teacher.');
            setSnackbarOpen(true);
        }
    };

    const handleUpdateTeacher = async (id: number) => {
        try {
            const { first_name, last_name, middle_name, phone, subject_id, room_id } = editTeacherData[id];
            await updateTeacher({ id, data: { first_name, last_name, middle_name, phone, subject_id, room_id } }).unwrap();
            setIsEditing({ ...isEditing, [id]: false });
            refetch();
            setError(null);
            setSnackbarOpen(true);
        } catch (error) {
            setError('Failed to update teacher.');
            setSnackbarOpen(true);
        }
    };

    const handleDeleteTeacher = async (id: number) => {
        try {
            await deleteTeacher(id).unwrap();
            refetch();
            setError(null);
            setSnackbarOpen(true);
        } catch (error) {
            setError('Failed to delete teacher.');
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
            <Typography variant="h4" component="h1" gutterBottom>Teachers</Typography>
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
                Добавить учителя
            </Button>
            <Dialog open={isPopupOpen} onClose={handleClosePopup}>
                <DialogTitle>Добавить нового учителя</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ...
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
                            label="First Name"
                            value={newTeacher.first_name}
                            onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={newTeacher.last_name}
                            onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Middle Name"
                            value={newTeacher.middle_name}
                            onChange={(e) => setNewTeacher({ ...newTeacher, middle_name: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={newTeacher.password}
                            onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            label="Phone"
                            value={newTeacher.phone}
                            onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                            variant="outlined"
                            fullWidth
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Select Room</InputLabel>
                            <Select
                                value={newTeacher.room_id}
                                onChange={(e) => setNewTeacher({ ...newTeacher, room_id: Number(e.target.value) })}
                                label="Select Room"
                            >
                                <MenuItem value={0} disabled>Select Room</MenuItem>
                                {rooms.map(room => (
                                    <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Select Subject</InputLabel>
                            <Select
                                value={newTeacher.subject_id}
                                onChange={(e) => setNewTeacher({ ...newTeacher, subject_id: Number(e.target.value) })}
                                label="Select Subject"
                            >
                                <MenuItem value={0} disabled>Select Subject</MenuItem>
                                {subjects.map(subject => (
                                    <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePopup} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateTeacher} color="primary">
                        Create Teacher
                    </Button>
                </DialogActions>
            </Dialog>
            <Paper sx={{ marginTop: 3 }}>
                <List>
                    {teachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((teacher) => (
                        <ListItem key={teacher.id}>
                            {isEditing[teacher.id] ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
                                    <TextField
                                        label="First Name"
                                        value={editTeacherData[teacher.id]?.first_name || ''}
                                        onChange={(e) => setEditTeacherData({
                                            ...editTeacherData,
                                            [teacher.id]: { ...editTeacherData[teacher.id], first_name: e.target.value }
                                        })}
                                        variant="outlined"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Last Name"
                                        value={editTeacherData[teacher.id]?.last_name || ''}
                                        onChange={(e) => setEditTeacherData({
                                            ...editTeacherData,
                                            [teacher.id]: { ...editTeacherData[teacher.id], last_name: e.target.value }
                                        })}
                                        variant="outlined"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Middle Name"
                                        value={editTeacherData[teacher.id]?.middle_name || ''}
                                        onChange={(e) => setEditTeacherData({
                                            ...editTeacherData,
                                            [teacher.id]: { ...editTeacherData[teacher.id], middle_name: e.target.value }
                                        })}
                                        variant="outlined"
                                        fullWidth
                                    />
                                    <TextField
                                        label="Phone"
                                        value={editTeacherData[teacher.id]?.phone || ''}
                                        onChange={(e) => setEditTeacherData({
                                            ...editTeacherData,
                                            [teacher.id]: { ...editTeacherData[teacher.id], phone: e.target.value }
                                        })}
                                        variant="outlined"
                                        fullWidth
                                    />
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Select Room</InputLabel>
                                        <Select
                                            value={editTeacherData[teacher.id]?.room_id || 0}
                                            onChange={(e) => setEditTeacherData({
                                                ...editTeacherData,
                                                [teacher.id]: { ...editTeacherData[teacher.id], room_id: Number(e.target.value) }
                                            })}
                                            label="Select Room"
                                        >
                                            <MenuItem value={0} disabled>Select Room</MenuItem>
                                            {rooms.map(room => (
                                                <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Select Subject</InputLabel>
                                        <Select
                                            value={editTeacherData[teacher.id]?.subject_id || 0}
                                            onChange={(e) => setEditTeacherData({
                                                ...editTeacherData,
                                                [teacher.id]: { ...editTeacherData[teacher.id], subject_id: Number(e.target.value) }
                                            })}
                                            label="Select Subject"
                                        >
                                            <MenuItem value={0} disabled>Select Subject</MenuItem>
                                            {subjects.map(subject => (
                                                <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Button variant="contained" color="primary" onClick={() => handleUpdateTeacher(teacher.id)}>
                                            Save
                                        </Button>
                                        <Button variant="outlined" color="secondary" onClick={() => handleCancelClick(teacher.id)}>
                                            Cancel
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <ListItemText
                                        primary={`${teacher.first_name} ${teacher.last_name} ${teacher.middle_name}`}
                                        secondary={`Room: ${rooms.find(room => room.id === teacher.room_id)?.name || 'N/A'}, Subject: ${subjects.find(subject => subject.id === teacher.subject_id)?.name || 'N/A'}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleEditClick(teacher.id)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteTeacher(teacher.id)} color="secondary">
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
                    count={teachers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Container>
    );
};

export default TeachersComponent;
