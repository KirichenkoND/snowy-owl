// src/components/SubjectsComponent.tsx
import React, { useEffect, useState } from "react";
import {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from "../../api/subjectsApi";
import { Alert, Snackbar } from "@mui/material";
import { useLazyGetTeachersQuery } from "../../api/teachersApi";
import Popup from "../Popup/Popup";

const SubjectsComponent: React.FC = () => {
  const {
    data: response,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useGetSubjectsQuery({});
  const [trigger, { data: data1, isLoading: classInfoisLoading }] =
    useLazyGetTeachersQuery();
  const subjects = response?.data || [];

  const [newSubjectName, setNewSubjectName] = useState("");
  const [editSubjectNames, setEditSubjectNames] = useState<{
    [id: number]: string;
  }>({});
  const [isEditing, setIsEditing] = useState<{ [id: number]: boolean }>({});
  const [createSubject] = useCreateSubjectMutation();
  const [updateSubject] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  const [error, setError] = useState<string | null>(null);

  const [classData, setClassData] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      console.log("Subjects fetched successfully:", subjects);
      setEditSubjectNames(
        subjects.reduce((acc, curr) => {
          acc[curr.id] = curr.name;
          return acc;
        }, {} as { [id: number]: string })
      );
      setIsEditing(
        subjects.reduce((acc, curr) => {
          acc[curr.id] = false;
          return acc;
        }, {} as { [id: number]: boolean })
      );
    }
  }, [subjects, isSuccess]);

  const handleCreateSubject = async () => {
    try {
      await createSubject({ name: newSubjectName }).unwrap();
      setNewSubjectName("");
      refetch();
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Failed to create subject:", error);
      setError("Failed to create subject.");
      setSnackbarOpen(true);
    }
  };

  const handleUpdateSubject = async (id: number) => {
    try {
      await updateSubject({
        id,
        data: { name: editSubjectNames[id] },
      }).unwrap();
      setIsEditing({ ...isEditing, [id]: false });
      refetch();
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Failed to update subject:", error);
      setError("Failed to update subject.");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    try {
      await deleteSubject(id).unwrap();
      refetch();
      setError(null);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Failed to delete subject:", error);
      setError("Failed to delete subject.");
      setSnackbarOpen(true);
    }
  };

  const handleEditClick = (id: number) => {
    setIsEditing({ ...isEditing, [id]: true });
  };

  const handleCancelClick = (id: number) => {
    setIsEditing({ ...isEditing, [id]: false });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleShowPopupClassInfo = (id: number) => {
    setClassData(trigger({ subject_ids: [id] }));
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (isError) return <div>Ошибка.</div>;

  return (
    <div>
      <h1>Subjects</h1>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error ? error : "Operation successful"}
        </Alert>
      </Snackbar>
      <input
        type="text"
        value={newSubjectName}
        onChange={(e) => setNewSubjectName(e.target.value)}
        placeholder="New Subject Name"
      />
      <button onClick={handleCreateSubject}>Create Subject</button>
      <ul style={{ listStyle: "none" }}>
        {subjects.map((subject) => (
          <li
            key={subject.id}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isEditing[subject.id] ? (
              <>
                <input
                  type="text"
                  value={editSubjectNames[subject.id]}
                  onChange={(e) =>
                    setEditSubjectNames({
                      ...editSubjectNames,
                      [subject.id]: e.target.value,
                    })
                  }
                />
                <button onClick={() => handleUpdateSubject(subject.id)}>
                  Сохранить
                </button>
                <button onClick={() => handleCancelClick(subject.id)}>
                  Отмена
                </button>
              </>
            ) : (
              <>
                <p
                  onClick={() => handleShowPopupClassInfo(subject.id)}
                  style={{ marginRight: 30, cursor: "pointer" }}
                >
                  {subject.name}
                </p>
                <button onClick={() => handleEditClick(subject.id)}>
                  Update
                </button>
                <button onClick={() => handleDeleteSubject(subject.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <Popup isOpen={isPopupOpen} onClose={handleClosePopup}>
        {data1 && data1.data.length > 0 ? (
          <div>
            {data1.data.map((studentInfo) => {
              return (
                <>
                  <p>Имя:{studentInfo.first_name}</p>
                  <p>Фамилия:{studentInfo.middle_name}</p>
                  <p>Отчество:{studentInfo.last_name}</p>
                  <p>Номер телефона:{studentInfo.phone}</p>
                  <p>Кабинет:{studentInfo.room_id}</p>
                </>
              );
            })}
          </div>
        ) : (
          <p>Пусто</p>
        )}
      </Popup>
    </div>
  );
};

export default SubjectsComponent;
