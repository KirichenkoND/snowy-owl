import React, { useState, useEffect } from 'react';
import { useLazyGetMarksQuery, useCreateMarkMutation } from '../../api/marksApi';
import { useGetStudentsQuery } from '../../api/studentsApi';
import { useLazyGetSubjectsQuery } from '../../api/subjectsApi';
import { useMeQuery } from '../../api/authApi';
import { Alert, Snackbar, Container, Box, CircularProgress, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const MarksTableComponent: React.FC = () => {
    const { data: profile, isLoading: profileLoading, isError: profileError } = useMeQuery();
    const [getMarks, { data: marksResponse, isLoading: marksLoading, isError: marksError }] = useLazyGetMarksQuery();
    const marks = marksResponse?.data || [];

    const { data: studentsResponse, isLoading: studentsLoading, isError: studentsError } = useGetStudentsQuery({});
    const students = studentsResponse?.data || [];

    const [getSubjects, { data: subjectsResponse, isLoading: subjectsLoading, isError: subjectsError }] = useLazyGetSubjectsQuery();
    const subjects = subjectsResponse?.data || [];

    const [createMark] = useCreateMarkMutation();
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        getSubjects({});
    }, [getSubjects]);

    useEffect(() => {
        if (selectedSubject !== null) {
            getMarks({ subject_ids: [selectedSubject] });
        }
    }, [selectedSubject, getMarks]);

    const handleMarkChange = (studentId: number, mark: number) => {
        if (!profile || profileLoading || profileError || selectedSubject === null) {
            setError('Failed to fetch teacher profile or subject not selected');
            setSnackbarOpen(true);
            return;
        }

        const teacherId = profile.id;

        createMark({ student_id: studentId, subject_id: selectedSubject, mark, teacher_id: teacherId })
            .unwrap()
            .then(() => {
                setSnackbarOpen(true);
                getMarks({ subject_ids: [selectedSubject] });
            })
            .catch((error) => {
                setError(error.data?.message || 'Failed to update mark');
                setSnackbarOpen(true);
            });
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    if (subjectsLoading || studentsLoading || profileLoading) {
        return <CircularProgress />;
    }

    if (subjectsError || studentsError || profileError) {
        return <div>Ошибка загрузки данных.</div>;
    }

    const handleAddMark = (studentId: number, mark: number) => {
        if (!profile || profileLoading || profileError || selectedSubject === null) {
            setError('Please ensure a subject is selected and your profile is loaded.');
            setSnackbarOpen(true);
            return;
        }
    
        // Assumes profile.id is the teacher ID
        const teacherId = profile.id;
    
        if (mark >= 2 && mark <= 5) { // Ensure the mark is within a valid range
            createMark({ student_id: studentId, subject_id: selectedSubject, mark, teacher_id: teacherId })
                .unwrap()
                .then(() => {
                    setSnackbarOpen(true);
                    setError(null);
                    getMarks({ subject_ids: [selectedSubject] }); // Refresh marks
                })
                .catch((error) => {
                    setError(error.data?.message || 'Failed to add mark');
                    setSnackbarOpen(true);
                });
        } else {
            setError('Mark must be between 1 and 5.');
            setSnackbarOpen(true);
        }
    };

    const columns: GridColDef[] = [
        { field: 'student', headerName: 'Student', width: 200 },
        { field: 'marks', headerName: 'Marks', width: 300 },
        {
            field: 'addMark',
            headerName: 'Add Mark',
            width: 200,
            renderCell: (params: any) => (
                <TextField
                    type="number"
                    defaultValue=""
                    onChange={(e) => handleAddMark(params.id, parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 5 }}
                    onBlur={(e) => e.target.value = ''} // Clear after focus loss
                />
            )
        }
    ];

    const rows = students.map(student => {
        const studentMarks = marks.filter(mark => mark.student_id === student.id).map(mark => mark.mark).join(", ");
        return { id: student.id, student: `${student.first_name} ${student.last_name}`, marks: studentMarks };
    });

    return (
        <Container component="main" maxWidth="lg">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="subject-select-label">Subject</InputLabel>
                    <Select
                        labelId="subject-select-label"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value as number)}
                    >
                        {subjects.map((subject) => (
                            <MenuItem key={subject.id} value={subject.id}>
                                {subject.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{ height: 400, width: '100%' }}>
                    {marksLoading ? <CircularProgress /> : marksError ? <div>Ошибка.</div> :
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 20]}
                            disableSelectionOnClick
                        />
                    }
                </Box>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                        {error ? error : "Mark updated successfully"}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
};

export default MarksTableComponent;
