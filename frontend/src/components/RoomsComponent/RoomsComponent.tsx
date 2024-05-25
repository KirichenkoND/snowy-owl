// src/components/RoomsComponent.tsx
import React, { useEffect, useState } from 'react';
import {
    useGetRoomsQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
} from '../../api/roomsApi';
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
    TablePagination,
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';

const RoomsComponent: React.FC = () => {
    const { data: response, isLoading: roomsLoading, isError: roomsError, isSuccess: roomsSuccess, refetch } = useGetRoomsQuery({ });
    const rooms = response?.data || [];

    const { data: subjectsResponse, isLoading: subjectsLoading, isError: subjectsError } = useGetSubjectsQuery();
    const subjects = subjectsResponse?.data || [];

    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomSubjectId, setNewRoomSubjectId] = useState<number | null>(null);
    const [editRoomNames, setEditRoomNames] = useState<{ [id: number]: string }>({});
    const [editRoomSubjects, setEditRoomSubjects] = useState<{ [id: number]: number }>({});
    const [isEditing, setIsEditing] = useState<{ [id: number]: boolean }>({});
    const [createRoom] = useCreateRoomMutation();
    const [updateRoom] = useUpdateRoomMutation();
    const [deleteRoom] = useDeleteRoomMutation();

    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        if (roomsSuccess) {
            setEditRoomNames(rooms.reduce((acc, curr) => {
                acc[curr.id] = curr.name;
                return acc;
            }, {} as { [id: number]: string }));
            setEditRoomSubjects(rooms.reduce((acc, curr) => {
                acc[curr.id] = curr.subject_id;
                return acc;
            }, {} as { [id: number]: number }));
            setIsEditing(rooms.reduce((acc, curr) => {
                acc[curr.id] = false;
                return acc;
            }, {} as { [id: number]: boolean }));
        }
    }, [rooms, roomsSuccess]);

    const handleCreateRoom = async () => {
        if (newRoomSubjectId === null) return;

        try {
            await createRoom({ name: newRoomName, subject_id: newRoomSubjectId }).unwrap();
            setNewRoomName('');
            setNewRoomSubjectId(null);
            refetch();
            setError(null);
            setSnackbarOpen(true);
        } catch (error) {
            setError('Failed to create room.');
            setSnackbarOpen(true);
        }
    };

    const handleUpdateRoom = async (id: number) => {
        if (editRoomSubjects[id] === undefined) return;

        try {
            await updateRoom({ id, data: { name: editRoomNames[id], subject_id: editRoomSubjects[id] } }).unwrap();
            setIsEditing({ ...isEditing, [id]: false });
            refetch();
            setError(null);
            setSnackbarOpen(true);
        } catch (error) {
            setError('Failed to update room.');
            setSnackbarOpen(true);
        }
    };

    const handleDeleteRoom = async (id: number) => {
        try {
            await deleteRoom(id).unwrap();
            refetch();
            setError(null);
            setSnackbarOpen(true);
        } catch (error) {
            setError('Failed to delete room.');
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

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (roomsLoading || subjectsLoading) return <CircularProgress />;
    if (roomsError || subjectsError) return <Alert severity="error">Ошибка загрузки данных.</Alert>;

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>Rooms</Typography>
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
            <Box mb={3}>
                <TextField
                    label="New Room Name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel>Select Subject</InputLabel>
                    <Select
                        value={newRoomSubjectId ?? ''}
                        onChange={(e) => setNewRoomSubjectId(Number(e.target.value))}
                        label="Select Subject"
                    >
                        <MenuItem value="" disabled>Select Subject</MenuItem>
                        {subjects.map(subject => (
                            <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleCreateRoom}>
                    Create Room
                </Button>
            </Box>
            <Paper>
                <List>
                    {rooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((room) => (
                        <ListItem key={room.id}>
                            {isEditing[room.id] ? (
                                <TextField
                                    value={editRoomNames[room.id]}
                                    onChange={(e) =>
                                        setEditRoomNames({ ...editRoomNames, [room.id]: e.target.value })
                                    }
                                    variant="outlined"
                                    fullWidth
                                />
                            ) : (
                                <ListItemText
                                    primary={room.name}
                                    secondary={`Subject: ${subjects.find(s => s.id === room.subject_id)?.name || 'N/A'}`}
                                />
                            )}
                            {isEditing[room.id] && (
                                <FormControl fullWidth variant="outlined" margin="normal">
                                    <Select
                                        value={editRoomSubjects[room.id] ?? ''}
                                        onChange={(e) => setEditRoomSubjects({
                                            ...editRoomSubjects,
                                            [room.id]: Number(e.target.value)
                                        })}
                                    >
                                        {subjects.map(subject => (
                                            <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                            <ListItemSecondaryAction>
                                {isEditing[room.id] ? (
                                    <>
                                        <IconButton onClick={() => handleUpdateRoom(room.id)} color="primary">
                                            <Save />
                                        </IconButton>
                                        <IconButton onClick={() => handleCancelClick(room.id)} color="secondary">
                                            <Cancel />
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        <IconButton onClick={() => handleEditClick(room.id)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteRoom(room.id)} color="secondary">
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
                    count={rooms.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Container>
    );
};

export default RoomsComponent;
