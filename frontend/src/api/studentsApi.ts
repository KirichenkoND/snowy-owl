// src/api/studentsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export interface IStudent {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    class_id: number;
    phone: string;
}

export interface IStudentResponse {
    data: IStudent[];
    success: boolean;
}

export interface ICreateOrUpdateStudentRequest {
    first_name: string;
    last_name: string;
    middle_name: string;
    class_id: number;
    password: string;
    phone: string;
}

export const studentsApi = createApi({
    reducerPath: 'studentsApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        getStudents: builder.query<IStudentResponse, { name?: string; id?: number; class_ids?: number[]; count?: number; offset?: number }>({
            query: (params) => ({
                url: 'students',
                params,
            }),
        }),
        createStudent: builder.mutation<IStudent, ICreateOrUpdateStudentRequest>({
            query: (newStudent) => ({
                url: 'students',
                method: 'POST',
                body: newStudent,
            }),
        }),
        updateStudent: builder.mutation<IStudent, { id: number; data: ICreateOrUpdateStudentRequest }>({
            query: ({ id, data }) => ({
                url: `students/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteStudent: builder.mutation<{ success: boolean }, number>({
            query: (id) => ({
                url: `students/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetStudentsQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} = studentsApi;
