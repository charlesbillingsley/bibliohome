import { useEffect, useState } from "react";
import MainContent from "./MainContent";
import LoginPage from "./LoginPage";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [userImageUrl, setUserImageUrl] = useState("");

  useEffect(() => {
    const cachedId = localStorage.getItem("userid");
    if (cachedId) {
      axios
        .get("/user/" + cachedId)
        .then(function (response) {
          if (response.data) {
            handleUserLogin(response.data);
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  }, []);

  const handleUserLogin = (userData) => {
    // Save the user's id in localStorage
    localStorage.setItem("userid", userData.id);

    // Set the user in the state
    setUser(userData);
    var imagePath = "/image/user/" + userData.photo;
    setUserImageUrl(axios.defaults.baseURL + imagePath);
  };

  const handleUserLogout = () => {
    // Clear the user's login information from localStorage
    localStorage.removeItem("userid");

    // Set the user to null in the state
    setUser(null);
    setUserImageUrl("");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {user ? (
        <MainContent
          user={user}
          setUser={setUser}
          userImageUrl={userImageUrl}
          setUserImageUrl={setUserImageUrl}
          onLogout={handleUserLogout}
        />
      ) : (
        <LoginPage setUser={handleUserLogin} />
      )}
    </LocalizationProvider>
  );
}

export default App;
