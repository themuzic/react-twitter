import React, { useEffect, useState } from "react";
import AppRouter from "components/Router";
import { authService } from "fb";
import { updateCurrentUser } from "firebase/auth";
import Loader from "./Loader";

function App() {
  const [init, setInit] = useState(false);
  const [ready, setReady] = useState(false);
  const [userObj, setUserObj] = useState(null);

  const checkUserState = () => {
    authService.getAuth().onAuthStateChanged((user) => {
      if (user) {
        if (user.displayName === null) {
          user.displayName = user.email.split("@")[0];
        }
        setUserObj(user);
      }
      setInit(true);
    });
  };

  useEffect(() => {
    checkUserState();
    if (init) {
      document.getElementById("loader_img").classList.add("ready");
      console.log(document.getElementById("loader_img"));
      setTimeout(() => {
        setReady(true);
      }, 1200);
    }
  }, [init]);

  const refreshUser = async () => {
    await updateCurrentUser(
      authService.getAuth(),
      authService.getAuth().currentUser
    );
    setUserObj(authService.getAuth().currentUser);
  };

  return (
    <>
      {ready ? (
        <AppRouter
          isLoggedIn={Boolean(userObj)}
          userObj={userObj}
          refreshUser={refreshUser}
        />
      ) : (
        <Loader />
      )}
    </>
  );
}
export default App;
