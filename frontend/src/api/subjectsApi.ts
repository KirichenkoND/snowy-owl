import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export interface ISubject {
    id: number;
    name: string;
}

export interface ISubjectResponse {
    data: ISubject[];
    success: boolean;
}

export interface ICreateOrUpdateSubjectRequest {
    name: string;
}

export const subjectsApi = createApi({
    reducerPath: 'subjectsApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        getSubjects: builder.query<ISubjectResponse, { name?: string; id?: number; count?: number; offset?: number }>({
            query: (params) => ({
                url: 'subjects',
                params,
            }),
        }),
        createSubject: builder.mutation<ISubject, ICreateOrUpdateSubjectRequest>({
            query: (newSubject) => ({
                url: 'subjects',
                method: 'POST',
                body: newSubject,
            }),
        }),
        updateSubject: builder.mutation<ISubject, { id: number; data: ICreateOrUpdateSubjectRequest }>({
            query: ({ id, data }) => ({
                url: `subjects/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteSubject: builder.mutation<{ success: boolean }, number>({
            query: (id) => ({
                url: `subjects/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetSubjectsQuery,
    useLazyGetSubjectsQuery,
    useCreateSubjectMutation,
    useUpdateSubjectMutation,
    useDeleteSubjectMutation,
} = subjectsApi;
