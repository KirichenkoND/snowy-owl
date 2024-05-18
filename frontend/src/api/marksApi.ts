// src/api/marksApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export interface IMark {
    id: number;
    mark: number;
    student_id: number;
    subject_id: number;
    teacher_id: number;
    time: string;
}

export interface IMarkResponse {
    data: IMark[];
    success: boolean;
}

export interface ICreateMarkRequest {
    mark: number;
    student_id: number;
    subject_id: number;
    teacher_id?: number;
}

export const marksApi = createApi({
    reducerPath: 'marksApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        getMarks: builder.query<IMarkResponse, {
            student_ids?: number[];
            teacher_ids?: number[];
            subject_ids?: number[];
            least?: number;
            most?: number;
            after?: string;
            before?: string;
            count?: number;
            offset?: number;
        }>({
            query: (params) => ({
                url: 'marks',
                params,
            }),
        }),
        createMark: builder.mutation<IMark, ICreateMarkRequest>({
            query: (newMark) => ({
                url: 'marks',
                method: 'POST',
                body: newMark,
            }),
        }),
    }),
});

export const {
    useGetMarksQuery,
    useCreateMarkMutation,
} = marksApi;
