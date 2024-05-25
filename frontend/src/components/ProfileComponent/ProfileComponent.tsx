import React from "react";
import { useMeQuery } from "../../api/authApi";
import {
  CircularProgress,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
} from "@mui/material";

const ProfileComponent: React.FC = () => {
  const { data: profileResponse, isLoading, isError, isSuccess } = useMeQuery();
  const profile = profileResponse?.data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Error loading profile.</Alert>;

  return (
    <Container>
      {profile && isSuccess && (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          <List>
            {Object.entries(profile).map(([key, value]) => (
              <ListItem key={key}>
                <ListItemText
                  primary={key.replace(/_/g, " ")}
                  secondary={
                    key === "employed_at" ? formatDate(value as string) : String(value)
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default ProfileComponent;
