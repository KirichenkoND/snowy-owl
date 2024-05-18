// src/api/teachersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export interface ITeacher {
    id: number;
    name: string;
    subject_ids: number[];
    room_ids: number[];
}

export interface ITeacherResponse {
    data: ITeacher[];
    success: boolean;
}

export interface ICreateOrUpdateTeacherRequest {
    name: string;
    subject_ids: number[];
    room_ids: number[];
}

export const teachersApi = createApi({
    reducerPath: 'teachersApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        getTeachers: builder.query<ITeacherResponse, { name?: string; id?: number; subject_ids?: number[]; room_ids?: number[]; count?: number; offset?: number }>({
            query: (params) => ({
                url: 'teachers',
                params,
            }),
        }),
        createTeacher: builder.mutation<ITeacher, ICreateOrUpdateTeacherRequest>({
            query: (newTeacher) => ({
                url: 'teachers',
                method: 'POST',
                body: newTeacher,
            }),
        }),
        updateTeacher: builder.mutation<ITeacher, { id: number; data: ICreateOrUpdateTeacherRequest }>({
            query: ({ id, data }) => ({
                url: `teachers/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteTeacher: builder.mutation<{ success: boolean }, number>({
            query: (id) => ({
                url: `teachers/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetTeachersQuery,
    useCreateTeacherMutation,
    useUpdateTeacherMutation,
    useDeleteTeacherMutation,
} = teachersApi;
