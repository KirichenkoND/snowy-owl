// src/components/AuthComponent.tsx
import React, { useState } from 'react';
import { useLoginMutation } from '../../api/authApi';
import { useAppDispatch } from "../../store/store";
import { Alert, Snackbar, TextField, Button, Container, Box, Typography } from '@mui/material';
import { setUser } from '../../store/Slices/userSlice';

const AuthComponent: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [login, { isLoading }] = useLoginMutation();
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const dispatch = useAppDispatch();

    const handleLogin = async () => {
        try {
            const userData = await login({ phone, password }).unwrap();
            setError(null);
            setSnackbarOpen(true);
            console.log("User Data:", userData); // Отладочное сообщение
            dispatch(setUser({ phone, role: "Teacher" }));
            console.log("Dispatched setUser with role: Teacher"); // Отладочное сообщение
        } catch (error) {
            if ((error as { data: { message: string } })?.data?.message) {
                setError((error as { data: { message: string } }).data.message);
            } else {
                setError('Failed to login.');
            }
            setSnackbarOpen(true);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="phone"
                        label="Phone"
                        name="phone"
                        autoComplete="phone"
                        autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        Sign In
                    </Button>
                </Box>
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                    {error ? error : "Login successful"}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AuthComponent;
