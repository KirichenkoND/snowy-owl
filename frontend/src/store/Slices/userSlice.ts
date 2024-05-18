import { createSlice } from '@reduxjs/toolkit';

export interface IUserSlice {
    role: null | "Teacher" | "admin"
}

const initialState = {role: null} satisfies IUserSlice as IUserSlice

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setTeacherState: (state) => {
            state.role = "Teacher"
        },
        setAdminState: (state) => {
            state.role = "admin"
        },
        setUser: (state, action) => {
            state.role = action.payload.role;
        },
        logoutUser: (state) => {
            state.role = null;
        }
    }
})

export const {setTeacherState, setAdminState, setUser, logoutUser} = userSlice.actions;
export default userSlice.reducer;