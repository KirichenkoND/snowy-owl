import React, { useEffect } from "react";
import "./App.scss";
import { useAppDispatch } from "./store/store";
import { Outlet } from "react-router-dom";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { setName, setUser } from "./store/Slices/userSlice";
import { useMeQuery } from "./api/authApi";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isError, isLoading, isSuccess } = useMeQuery();
  const {
    data: data1,
    isError: isError1,
    isLoading: isLoading1,
    isSuccess: isSuccess1,
  } = useMeQuery();
  useEffect(() => {
    if (isSuccess && data && isSuccess1 && data1) {
      dispatch(setUser({ phone: data.phone, role: data.role }));
      dispatch(setName({ name: data1.first_name }));
    }
    if (isSuccess1 && data1) {
      dispatch(setName({ name: data1.first_name }));
    }
  }, [isSuccess, data, dispatch, data1, isSuccess1]);

  if (isError || isError1) {
    console.log("Error fetching profile data");
  }

  if (isLoading || isLoading1) {
    console.log("Loading profile data");
  }

  return (
    <>
      <Header profileData={data1} />
      <div className="app-container">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default App;
