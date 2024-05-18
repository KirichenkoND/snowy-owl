import { configureStore } from '@reduxjs/toolkit';
import { authApi } from "./../api/authApi";
import { classesApi } from "./../api/classesApi";
import { subjectsApi } from './../api/subjectsApi';
import { roomsApi } from './../api/roomsApi';
import { teachersApi } from '../api/teachersApi';
import { studentsApi } from '../api/studentsApi';
import { marksApi } from '../api/marksApi';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userSlice from './Slices/userSlice';

export const store = configureStore({
    reducer: {
        user: userSlice,
        [authApi.reducerPath]: authApi.reducer,
        [classesApi.reducerPath]: classesApi.reducer,
        [subjectsApi.reducerPath]: subjectsApi.reducer,
        [roomsApi.reducerPath]: roomsApi.reducer,
        [teachersApi.reducerPath]: teachersApi.reducer,
        [studentsApi.reducerPath]: studentsApi.reducer,
        [marksApi.reducerPath]: marksApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(
                authApi.middleware,
                classesApi.middleware,
                subjectsApi.middleware,
                roomsApi.middleware,
                teachersApi.middleware,
                studentsApi.middleware,
                marksApi.middleware,
            )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
