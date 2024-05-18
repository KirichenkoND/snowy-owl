import { createSlice } from '@reduxjs/toolkit';

export interface IUserSlice {
    role: null | "Teacher" | "Principal" | "Student"
}

const initialState = {role: null} satisfies IUserSlice as IUserSlice

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
        }
    }
})

export const {setTeacherState, setPrincipalState, setUser, logoutUser} = userSlice.actions;
export default userSlice.reducer;