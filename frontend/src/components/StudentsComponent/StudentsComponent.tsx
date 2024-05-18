// src/components/StudentsComponent.tsx
import React, { useEffect, useState } from 'react';
import {
    useGetStudentsQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} from '../../api/studentsApi';
import { useGetClassesQuery } from '../../api/classesApi';
import { Alert, Snackbar } from '@mui/material';
import Popup from '../Popup/Popup';

const StudentsComponent: React.FC = () => {
    const { data: response, isLoading, isError, isSuccess, refetch } = useGetStudentsQuery({});
    const students = response?.data || [];

    const { data: classesResponse } = useGetClassesQuery({});
    const classes = classesResponse?.data || [];

    const [newStudent, setNewStudent] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        class_id: 0
    });

    const [editStudentData, setEditStudentData] = useState<{ [id: number]: any }>({});
    const [isEditing, setIsEditing] = useState<{ [id: number]: boolean }>({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [createStudent] = useCreateStudentMutation();
    const [updateStudent] = useUpdateStudentMutation();
    const [deleteStudent] = useDeleteStudentMutation();

    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            console.log('Students fetched successfully:', students);
            setEditStudentData(students.reduce((acc, curr) => {
                acc[curr.id] = {
                    first_name: curr.first_name,
                    last_name: curr.last_name,
                    middle_name: curr.middle_name,
                    class_id: curr.class_id,
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
                class_id: 0
            });
            refetch();
            setError(null);
            setSnackbarOpen(true);
            setIsPopupOpen(false);
        } catch (error) {
            console.error('Failed to create student:', error);
            setError('Failed to create student.');
            setSnackbarOpen(true);
        }
    };

    const handleUpdateStudent = async (id: number) => {
        try {
            const { first_name, last_name, middle_name, class_id } = editStudentData[id];
            await updateStudent({ id, data: { first_name, last_name, middle_name, class_id } }).unwrap();
            setIsEditing({ ...isEditing, [id]: false });
            refetch();
            setError(null);
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Failed to update student:', error);
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
            console.error('Failed to delete student:', error);
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

    if (isLoading) return <div>Загрузка...</div>;
    if (isError) return <div>Ошибка.</div>;

    return (
        <div>
            <h1>Students</h1>
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
            <button onClick={handleOpenPopup}>Create Student</button>
            <Popup isOpen={isPopupOpen} onClose={handleClosePopup}>
                <div>
                    <input
                        type="text"
                        value={newStudent.first_name}
                        onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                        placeholder="First Name"
                    />
                    <input
                        type="text"
                        value={newStudent.last_name}
                        onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                        placeholder="Last Name"
                    />
                    <input
                        type="text"
                        value={newStudent.middle_name}
                        onChange={(e) => setNewStudent({ ...newStudent, middle_name: e.target.value })}
                        placeholder="Middle Name"
                    />
                    <select
                        value={newStudent.class_id}
                        onChange={(e) => setNewStudent({ ...newStudent, class_id: Number(e.target.value) })}
                    >
                        <option value={0} disabled>Select Class</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                    <button onClick={handleCreateStudent}>Create Student</button>
                </div>
            </Popup>
            <ul>
                {students.map((student) => (
                    <li key={student.id}>
                        {isEditing[student.id] ? (
                            <>
                                <input
                                    type="text"
                                    value={editStudentData[student.id]?.first_name || ''}
                                    onChange={(e) => setEditStudentData({
                                        ...editStudentData,
                                        [student.id]: { ...editStudentData[student.id], first_name: e.target.value }
                                    })}
                                    placeholder="First Name"
                                />
                                <input
                                    type="text"
                                    value={editStudentData[student.id]?.last_name || ''}
                                    onChange={(e) => setEditStudentData({
                                        ...editStudentData,
                                        [student.id]: { ...editStudentData[student.id], last_name: e.target.value }
                                    })}
                                    placeholder="Last Name"
                                />
                                <input
                                    type="text"
                                    value={editStudentData[student.id]?.middle_name || ''}
                                    onChange={(e) => setEditStudentData({
                                        ...editStudentData,
                                        [student.id]: { ...editStudentData[student.id], middle_name: e.target.value }
                                    })}
                                    placeholder="Middle Name"
                                />
                                <select
                                    value={editStudentData[student.id]?.class_id || 0}
                                    onChange={(e) => setEditStudentData({
                                        ...editStudentData,
                                        [student.id]: { ...editStudentData[student.id], class_id: Number(e.target.value) }
                                    })}
                                >
                                    <option value={0} disabled>Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                                <button onClick={() => handleUpdateStudent(student.id)}>Сохранить</button>
                                <button onClick={() => handleCancelClick(student.id)}>Отмена</button>
                            </>
                        ) : (
                            <>
                                {student.first_name} {student.last_name} {student.middle_name}
                                <div>
                                    Class: {classes.find(cls => cls.id === student.class_id)?.name || 'N/A'}
                                </div>
                                <button onClick={() => handleEditClick(student.id)}>Update</button>
                                <button onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StudentsComponent;
