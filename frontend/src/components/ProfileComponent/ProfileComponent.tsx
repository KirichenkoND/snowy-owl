import React from "react";
import { useMeQuery } from "../../api/authApi";

const ProfileComponent: React.FC = () => {
  const { data: profile, isLoading, isError, isSuccess } = useMeQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading profile.</div>;
  console.log(profile);
  return (
    <>
      {profile && isSuccess && (
        <div>
          <h1>Profile</h1>
          <p style={{ color: "black" }}>ID: {profile.phone}</p>
          <p>First Name: {profile.first_name}</p>
          <p>Last Name: {profile.last_name}</p>
          <p>Phone: {profile.phone}</p>
          <p>Role: {profile.role}</p>
          <p>Employed At: {profile.employed_at}</p>
        </div>
      )}
    </>
  );
};

export default ProfileComponent;
