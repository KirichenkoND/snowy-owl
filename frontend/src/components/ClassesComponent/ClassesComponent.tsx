// src/components/ClassesComponent.tsx
import React, { useEffect, useState } from 'react';
import { useGetClassesQuery, useUpdateClassMutation, useDeleteClassMutation, useCreateClassMutation } from '../../api/classesApi';
import { Alert, CircularProgress, Snackbar } from '@mui/material';

const ClassesComponent: React.FC = () => {
    const { data: response, isLoading, isError, isSuccess, refetch } = useGetClassesQuery({});
    const classes = response?.data || [];

    const [newClassName, setNewClassName] = useState('');
    const [editClassNames, setEditClassNames] = useState<{ [id: number]: string }>({});
    const [isEditing, setIsEditing] = useState<{ [id: number]: boolean }>({});
    const [createClass] = useCreateClassMutation();
    const [updateClass] = useUpdateClassMutation();
    const [deleteClass] = useDeleteClassMutation();

    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            console.log('Classes fetched successfully:', classes);
            setEditClassNames(classes.reduce((acc, curr) => {
                acc[curr.id] = curr.name;
                return acc;
            }, {} as { [id: number]: string }));
            setIsEditing(classes.reduce((acc, curr) => {
                acc[curr.id] = false;
                return acc;
            }, {} as { [id: number]: boolean }));
        }
    }, [classes, isSuccess]);

    const handleCreateClass = async () => {
        try {
            await createClass({ name: newClassName }).unwrap();
            setNewClassName('');
            refetch();
            setError(null);
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Failed to create class:', error);
            setError('Failed to create class.');
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
            console.error('Failed to update class:', error);
            setError('Failed to update class.');
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
            console.error('Failed to delete class:', error);
            setError('Failed to delete class.');
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

    if (isLoading) return <div><CircularProgress /></div>;
    if (isError) return <div>Ошибка.</div>;

    return (
        <div>
            <h1>Classes</h1>
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
            <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="New Class Name"
            />
            <button onClick={handleCreateClass}>Create Class</button>
            <ul>
                {classes.map((classItem) => (
                    <li key={classItem.id}>
                        {isEditing[classItem.id] ? (
                            <>
                                <input
                                    type="text"
                                    value={editClassNames[classItem.id]}
                                    onChange={(e) => setEditClassNames({
                                        ...editClassNames,
                                        [classItem.id]: e.target.value
                                    })}
                                />
                                <button onClick={() => handleUpdateClass(classItem.id)}>Сохранить</button>
                                <button onClick={() => handleCancelClick(classItem.id)}>Отмена</button>
                            </>
                        ) : (
                            <>
                                {classItem.name}
                                <button onClick={() => handleEditClick(classItem.id)}>Update</button>
                                <button onClick={() => handleDeleteClass(classItem.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClassesComponent;
