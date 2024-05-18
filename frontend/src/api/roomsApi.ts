// src/api/roomsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

export interface IRoom {
    id: number;
    name: string;
}

export interface IRoomResponse {
    data: IRoom[];
    success: boolean;
}

export interface ICreateOrUpdateRoomRequest {
    name: string;
}

export const roomsApi = createApi({
    reducerPath: 'roomsApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
    endpoints: (builder) => ({
        getRooms: builder.query<IRoomResponse, { name?: string; id?: number; subject_ids?: number[]; count?: number; offset?: number }>({
            query: (params) => ({
                url: 'rooms',
                params,
            }),
        }),
        createRoom: builder.mutation<IRoom, ICreateOrUpdateRoomRequest>({
            query: (newRoom) => ({
                url: 'rooms',
                method: 'POST',
                body: newRoom,
            }),
        }),
        updateRoom: builder.mutation<IRoom, { id: number; data: ICreateOrUpdateRoomRequest }>({
            query: ({ id, data }) => ({
                url: `rooms/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteRoom: builder.mutation<{ success: boolean }, number>({
            query: (id) => ({
                url: `rooms/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetRoomsQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
} = roomsApi;
