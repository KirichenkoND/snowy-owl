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
import { Alert, Snackbar } from '@mui/material';
import Popup from '../Popup/Popup';

const TeachersComponent: React.FC = () => {
    const { data: response, isLoading, isError, isSuccess, refetch } = useGetTeachersQuery({});
    const teachers = response?.data || [];

    const { data: roomsResponse } = useGetRoomsQuery({ id: 1 });
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

    useEffect(() => {
        if (isSuccess) {
            console.log('Teachers fetched successfully:', teachers);
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
            console.error('Failed to create teacher:', error);
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
            console.error('Failed to update teacher:', error);
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
            console.error('Failed to delete teacher:', error);
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

    if (isLoading) return <div>Загрузка...</div>;
    if (isError) return <div>Ошибка.</div>;

    return (
        <div>
            <h1>Teachers</h1>
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
            <button onClick={handleOpenPopup}>Create Teacher</button>
            <Popup isOpen={isPopupOpen} onClose={handleClosePopup}>
                <div>
                    <input
                        type="text"
                        value={newTeacher.first_name}
                        onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })}
                        placeholder="First Name"
                    />
                    <input
                        type="text"
                        value={newTeacher.last_name}
                        onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })}
                        placeholder="Last Name"
                    />
                    <input
                        type="text"
                        value={newTeacher.middle_name}
                        onChange={(e) => setNewTeacher({ ...newTeacher, middle_name: e.target.value })}
                        placeholder="Middle Name"
                    />
                    <input
                        type="password"
                        value={newTeacher.password}
                        onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                        placeholder="Password"
                    />
                    <input
                        type="text"
                        value={newTeacher.phone}
                        onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                        placeholder="Phone"
                    />
                    <select
                        value={newTeacher.room_id}
                        onChange={(e) => setNewTeacher({ ...newTeacher, room_id: Number(e.target.value) })}
                    >
                        <option value={0} disabled>Select Room</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                    <select
                        value={newTeacher.subject_id}
                        onChange={(e) => setNewTeacher({ ...newTeacher, subject_id: Number(e.target.value) })}
                    >
                        <option value={0} disabled>Select Subject</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                    </select>
                    <button onClick={handleCreateTeacher}>Create Teacher</button>
                </div>
            </Popup>
            <ul>
                {teachers.map((teacher) => (
                    <li key={teacher.id}>
                        {isEditing[teacher.id] ? (
                            <>
                                <input
                                    type="text"
                                    value={editTeacherData[teacher.id]?.first_name || ''}
                                    onChange={(e) => setEditTeacherData({
                                        ...editTeacherData,
                                        [teacher.id]: { ...editTeacherData[teacher.id], first_name: e.target.value }
                                    })}
                                    placeholder="First Name"
                                />
                                <input
                                    type="text"
                                    value={editTeacherData[teacher.id]?.last_name || ''}
                                    onChange={(e) => setEditTeacherData({
                                        ...editTeacherData,
                                        [teacher.id]: { ...editTeacherData[teacher.id], last_name: e.target.value }
                                    })}
                                    placeholder="Last Name"
                                />
                                <input
                                    type="text"
                                    value={editTeacherData[teacher.id]?.middle_name || ''}
                                    onChange={(e) => setEditTeacherData({
                                        ...editTeacherData,
                                        [teacher.id]: { ...editTeacherData[teacher.id], middle_name: e.target.value }
                                    })}
                                    placeholder="Middle Name"
                                />
                                <input
                                    type="text"
                                    value={editTeacherData[teacher.id]?.phone || ''}
                                    onChange={(e) => setEditTeacherData({
                                        ...editTeacherData,
                                        [teacher.id]: { ...editTeacherData[teacher.id], phone: e.target.value }
                                    })}
                                    placeholder="Phone"
                                />
                                <select
                                    value={editTeacherData[teacher.id]?.room_id || 0}
                                    onChange={(e) => setEditTeacherData({
                                        ...editTeacherData,
                                        [teacher.id]: { ...editTeacherData[teacher.id], room_id: Number(e.target.value) }
                                    })}
                                >
                                    <option value={0} disabled>Select Room</option>
                                    {rooms.map(room => (
                                        <option key={room.id} value={room.id}>{room.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={editTeacherData[teacher.id]?.subject_id || 0}
                                    onChange={(e) => setEditTeacherData({
                                        ...editTeacherData,
                                        [teacher.id]: { ...editTeacherData[teacher.id], subject_id: Number(e.target.value) }
                                    })}
                                >
                                    <option value={0} disabled>Select Subject</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                                <button onClick={() => handleUpdateTeacher(teacher.id)}>Сохранить</button>
                                <button onClick={() => handleCancelClick(teacher.id)}>Отмена</button>
                            </>
                        ) : (
                            <>
                                {teacher.first_name} {teacher.last_name} {teacher.middle_name}
                                <div>
                                    Room: {rooms.find(room => room.id === teacher.room_ids)?.name || 'N/A'},
                                    Subject: {subjects.find(subject => subject.id === teacher.subject_ids)?.name || 'N/A'}
                                </div>
                                <button onClick={() => handleEditClick(teacher.id)}>Update</button>
                                <button onClick={() => handleDeleteTeacher(teacher.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TeachersComponent;
