// src/components/ClassesComponent.tsx
import React, { useEffect, useState } from 'react';
import { useGetClassesQuery, useUpdateClassMutation, useDeleteClassMutation, useCreateClassMutation } from '../../api/classesApi';
import { Alert, CircularProgress, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from '@mui/material';

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
            <TextField
                label="New Class Name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleCreateClass}>Create Class</Button>
           
            <div style={{ margin: '5%' }}>
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {classes.map((classItem) => (
                                <TableRow key={classItem.id}>
                                    <TableCell>
                                        {isEditing[classItem.id] ? (
                                            <TextField
                                                value={editClassNames[classItem.id]}
                                                onChange={(e) => setEditClassNames({
                                                    ...editClassNames,
                                                    [classItem.id]: e.target.value
                                                })}
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
                                                <Button onClick={() => handleUpdateClass(classItem.id)} variant="contained" color="primary" sx={{ marginRight: 1 }}>Save</Button>
                                                <Button onClick={() => handleCancelClick(classItem.id)} variant="outlined">Cancel</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button onClick={() => handleEditClick(classItem.id)} variant="contained" color="primary" sx={{ marginRight: 1 }}>Update</Button>
                                                <Button onClick={() => handleDeleteClass(classItem.id)} variant="contained" color="secondary">Delete</Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            
        </div>
    );
};

export default ClassesComponent;
