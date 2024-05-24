import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export interface IClass {
    id: number;
    name: string;
}

export interface IClassResponse {
    data: IClass[];
    success: boolean;
}

export interface ICreateOrUpdateClassRequest {
    name: string;
}

export const classesApi = createApi({
    reducerPath: 'classesApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        getClasses: builder.query<IClassResponse, { name?: string; id?: number; count?: number; offset?: number }>({
            query: (params) => ({
                url: 'classes',
                params,
            }),
        }),
        createClass: builder.mutation<IClass, ICreateOrUpdateClassRequest>({
            query: (newClass) => ({
                url: 'classes',
                method: 'POST',
                body: newClass,
            }),
        }),
        updateClass: builder.mutation<IClass, { id: number; data: ICreateOrUpdateClassRequest }>({
            query: ({ id, data }) => ({
                url: `classes/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteClass: builder.mutation<{ success: boolean }, number>({
            query: (id) => ({
                url: `classes/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetClassesQuery,
    useLazyGetClassesQuery,
    useCreateClassMutation,
    useUpdateClassMutation,
    useDeleteClassMutation,
} = classesApi;