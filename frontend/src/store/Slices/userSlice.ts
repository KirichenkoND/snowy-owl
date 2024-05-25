import { createSlice } from '@reduxjs/toolkit';

export interface IUserSlice {
    role: null | "Teacher" | "Principal" | "Student";
    name: null | string
}

const initialState = { role: null, name: null } satisfies IUserSlice as IUserSlice

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setTeacherState: (state) => {
            state.role = "Teacher"
        },
        setPrincipalState: (state) => {
            state.role = "Principal"
        },
        setUser: (state, action) => {
            state.role = action.payload.role;
        },
        logoutUser: (state) => {
            state.role = null;
        },
        setName: (state, action) => {
            state.name = action.payload.name
        },
        setNameOut: (state) => {
            state.name = null;
        }
    }
})

export const { setTeacherState, setPrincipalState, setUser, logoutUser, setName, setNameOut } = userSlice.actions;
export default userSlice.reducer;