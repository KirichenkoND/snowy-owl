import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '../config';

export interface ILoginRequest {
    phone: string;
    password: string;
}

export interface ILoginResponse {
    field: string | null;
    message: string;
    success: boolean;
}

export interface IProfile {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    employed_at: string;
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        login: builder.mutation<ILoginResponse, ILoginRequest>({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'POST'
            }),
        }),
        me: builder.query<IProfile, void>({
            query: () => `auth/me`,
        }),
    }),
})

export const { useLoginMutation, useLogoutMutation, useMeQuery } = authApi;