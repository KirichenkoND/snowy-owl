// src/components/MarksComponent.tsx
import React, { useState } from 'react';
import { useGetMarksQuery } from '../../api/marksApi';
import { useGetStudentsQuery } from '../../api/studentsApi';
import { useGetTeachersQuery } from '../../api/teachersApi';
import { useGetSubjectsQuery } from '../../api/subjectsApi';
import { Alert, Snackbar, Container, Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, CircularProgress } from '@mui/material';

const MarksComponent: React.FC = () => {
    const [filters, setFilters] = useState({
        student_ids: [] as number[],
        teacher_ids: [] as number[],
        subject_ids: [] as number[],
        least: '' as string | number,
        most: '' as string | number,
        after: '',
        before: '',
    });

    const { data: marksResponse, isLoading: marksLoading, isError: marksError, refetch } = useGetMarksQuery(filters);
    const marks = marksResponse?.data || [];

    const { data: studentsResponse } = useGetStudentsQuery({});
    const students = studentsResponse?.data || [];

    const { data: teachersResponse } = useGetTeachersQuery({});
    const teachers = teachersResponse?.data || [];

    const { data: subjectsResponse } = useGetSubjectsQuery({});
    const subjects = subjectsResponse?.data || [];

    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target as { name: string; value: any };
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleApplyFilters = () => {
        const filteredFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value.length !== 0)
        );
        refetch(filteredFilters);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    if (marksLoading) return <div><CircularProgress /></div>;
    if (marksError) return <div>Ошибка.</div>;

    return (
        <Container component="main" maxWidth="lg">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ mt: 3, mb: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="student-select-label">Students</InputLabel>
                        <Select
                            labelId="student-select-label"
                            multiple
                            value={filters.student_ids}
                            onChange={handleFilterChange}
                            inputProps={{ name: 'student_ids' }}
                        >
                            {students.map((student) => (
                                <MenuItem key={student.id} value={student.id}>
                                    {student.first_name} {student.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="teacher-select-label">Teachers</InputLabel>
                        <Select
                            labelId="teacher-select-label"
                            multiple
                            value={filters.teacher_ids}
                            onChange={handleFilterChange}
                            inputProps={{ name: 'teacher_ids' }}
                        >
                            {teachers.map((teacher) => (
                                <MenuItem key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="subject-select-label">Subjects</InputLabel>
                        <Select
                            labelId="subject-select-label"
                            multiple
                            value={filters.subject_ids}
                            onChange={handleFilterChange}
                            inputProps={{ name: 'subject_ids' }}
                        >
                            {subjects.map((subject) => (
                                <MenuItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="least"
                        label="Minimum Mark"
                        type="number"
                        value={filters.least}
                        onChange={handleFilterChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="most"
                        label="Maximum Mark"
                        type="number"
                        value={filters.most}
                        onChange={handleFilterChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="after"
                        label="After Date"
                        type="datetime-local"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={filters.after}
                        onChange={handleFilterChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="before"
                        label="Before Date"
                        type="datetime-local"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={filters.before}
                        onChange={handleFilterChange}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={handleApplyFilters}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Box>
            <ul>
                {marks.map((mark) => (
                    <li key={mark.id}>
                        Mark: {mark.mark}, Student ID: {mark.student_id}, Subject ID: {mark.subject_id}, Teacher ID: {mark.teacher_id}, Time: {mark.time}
                    </li>
                ))}
            </ul>
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
        </Container>
    );
};

export default MarksComponent;
