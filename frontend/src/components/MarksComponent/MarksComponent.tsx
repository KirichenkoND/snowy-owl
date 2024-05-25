import React, { useState } from 'react';
import { useLazyGetMarksQuery } from '../../api/marksApi';
import { useGetStudentsQuery } from '../../api/studentsApi';
import { useGetTeachersQuery } from '../../api/teachersApi';
import { useGetSubjectsQuery } from '../../api/subjectsApi';
import { Alert, Snackbar, Container, Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, CircularProgress, Grid } from '@mui/material';
import { DataGrid, GridColDef, GridSortDirection, GridSortModel, GridPaginationModel } from '@mui/x-data-grid';

const MarksComponent: React.FC = () => {
    const [filters, setFilters] = useState({
        student_ids: [] as number[],
        teachers_ids: [] as number[],
        subject_ids: [] as number[],
        least: '' as string | number,
        most: '' as string | number,
        after: '',
        before: '',
    });

    const [getMarks, { data: marksResponse, isLoading: marksLoading, isError: marksError }] = useLazyGetMarksQuery();
    const marks = marksResponse?.data || [];

    const { data: studentsResponse } = useGetStudentsQuery({});
    const students = studentsResponse?.data || [];

    const { data: teachersResponse } = useGetTeachersQuery({});
    const teachers = teachersResponse?.data || [];

    const { data: subjectsResponse } = useGetSubjectsQuery({});
    const subjects = subjectsResponse?.data || [];

    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 5,
    });

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target as { name: string; value: any };
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleApplyFilters = () => {
        const filteredFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => {
                if (Array.isArray(value)) {
                    return value.length > 0;
                }
                return value !== '' && value !== null;
            })
        );
        getMarks(filteredFilters);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    if (marksLoading) return <div><CircularProgress /></div>;
    if (marksError) return <div>Ошибка.</div>;

    const columns: GridColDef[] = [
        { field: 'mark', headerName: 'Mark', width: 130 },
        { field: 'student_id', headerName: 'Student ID', width: 130 },
        { field: 'subject_id', headerName: 'Subject ID', width: 130 },
        { field: 'teachers_id', headerName: 'Teacher ID', width: 130 },
        { field: 'time', headerName: 'Time', width: 200 },
    ];

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
                <Box sx={{ mt: 3, mb: 2, width: '100%', overflow: 'hidden' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="teacher-select-label">Teachers</InputLabel>
                                <Select
                                    labelId="teacher-select-label"
                                    multiple
                                    value={filters.teachers_ids}
                                    onChange={handleFilterChange}
                                    inputProps={{ name: 'teachers_ids' }}
                                >
                                    {teachers.map((teacher) => (
                                        <MenuItem key={teacher.id} value={teacher.id}>
                                            {teacher.first_name} {teacher.last_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="least"
                                label="Minimum Mark"
                                type="number"
                                value={filters.least}
                                onChange={handleFilterChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="most"
                                label="Maximum Mark"
                                type="number"
                                value={filters.most}
                                onChange={handleFilterChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleApplyFilters}
                            >
                                Apply Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={marks}
                        columns={columns}
                        pageSize={paginationModel.pageSize}
                        rowsPerPageOptions={[5, 10, 20]}
                        pagination
                        paginationMode="client"
                        sortingMode="client"
                        sortModel={sortModel}
                        onSortModelChange={(model) => setSortModel(model)}
                        paginationModel={paginationModel}
                        onPaginationModelChange={(model) => setPaginationModel(model)}
                        disableSelectionOnClick
                    />
                </Box>
            </Box>
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
