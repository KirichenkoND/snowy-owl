import React, { useState } from 'react';
import { useMeQuery } from '../../api/authApi';


const ProfileComponent: React.FC = () => {
    const { data: profile, isLoading, isError } = useMeQuery();

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading profile.</div>;

    return (
        <>
            <div>
                <h1>Profile</h1>
                <p>ID: {profile.id}</p>
                <p>First Name: {profile.first_name}</p>
                <p>Last Name: {profile.last_name}</p>
                <p>Phone: {profile.phone}</p>
                <p>Role: {profile.role}</p>
                <p>Employed At: {profile.employed_at}</p>
            </div>
        </>
    );
};

export default ProfileComponent;
