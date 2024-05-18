// src/components/RoomsComponent.tsx
import React, { useEffect, useState } from 'react';
import {
    useGetRoomsQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
} from '../../api/roomsApi';
import { useGetSubjectsQuery } from '../../api/subjectsApi';
import { Alert, Snackbar } from '@mui/material';

const RoomsComponent: React.FC = () => {
    const { data: response, isLoading: roomsLoading, isError: roomsError, isSuccess: roomsSuccess, refetch } = useGetRoomsQuery({ id: 1});
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
            console.error('Failed to create room:', error);
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
            console.error('Failed to update room:', error);
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
            console.error('Failed to delete room:', error);
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

    return (
        <div>
            <h1>Rooms</h1>
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
            {roomsLoading || subjectsLoading ? (
                <div>Загрузка...</div>
            ) : roomsError || subjectsError ? (
                <Alert severity="error">Ошибка загрузки данных.</Alert>
            ) : (
                <>
                    <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="New Room Name"
                    />
                    <select value={newRoomSubjectId ?? ''} onChange={(e) => setNewRoomSubjectId(Number(e.target.value))}>
                        <option value="" disabled>Select Subject</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                    </select>
                    <button onClick={handleCreateRoom}>Create Room</button>
                    <ul>
                        {rooms.map((room) => (
                            <li key={room.id}>
                                {isEditing[room.id] ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editRoomNames[room.id]}
                                            onChange={(e) => setEditRoomNames({
                                                ...editRoomNames,
                                                [room.id]: e.target.value
                                            })}
                                        />
                                        <select value={editRoomSubjects[room.id]} onChange={(e) => setEditRoomSubjects({
                                            ...editRoomSubjects,
                                            [room.id]: Number(e.target.value)
                                        })}>
                                            {subjects.map(subject => (
                                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleUpdateRoom(room.id)}>Сохранить</button>
                                        <button onClick={() => handleCancelClick(room.id)}>Отмена</button>
                                    </>
                                ) : (
                                    <>
                                        {room.name} (Subject: {subjects.find(s => s.id === room.subject_id)?.name || 'N/A'})
                                        <button onClick={() => handleEditClick(room.id)}>Update</button>
                                        <button onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default RoomsComponent;
