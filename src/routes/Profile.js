import { authService, fbStorage, firebaseDB } from "fb";
import { signOut, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = ({ userObj, refreshUser }) => {
  const [newName, setNewName] = useState(userObj.displayName);
  const [photoUrl, setPhotoUrl] = useState(userObj.photoURL);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const myRef = doc(firebaseDB, `members/${userObj.uid}`);
  const navigate = useNavigate();

  const onLogOutClick = () => {
    signOut(authService.getAuth());
    navigate("/");
    refreshUser();
  };

  const getMyTweets = async () => {
    const q = query(
      collection(firebaseDB, "tweets"),
      where("creatorId", "==", userObj.uid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {});
  };

  const onChange = (event) => {
    setNewName(event.target.value);
  };
  const onSubmit = async (event) => {
    event.preventDefault();

    let attachmentUrl = "";
    if (newPhotoUrl !== "") {
      const random = Date.now();
      const fireStorageRef = fbStorage.ref(
        fbStorage.getStorage(),
        `${userObj.uid}/photo/${random}`
      );
      const response = await fbStorage.uploadString(
        fireStorageRef,
        newPhotoUrl,
        "data_url"
      );
      attachmentUrl = await getDownloadURL(response.ref);
    }

    let updateUserInfo = "";
    if (userObj.displayName !== newName && newPhotoUrl) {
      updateUserInfo = {
        displayName: newName,
        photoURL: attachmentUrl,
      };
    } else if (userObj.displayName !== newName) {
      updateUserInfo = {
        displayName: newName,
      };
    } else if (newPhotoUrl) {
      updateUserInfo = {
        photoURL: attachmentUrl,
      };
    }

    if (updateUserInfo !== "") {
      await updateProfile(userObj, updateUserInfo);
    }

    if (attachmentUrl === "") {
      updateDoc(myRef, {
        displayName: newName,
      });
    } else {
      updateDoc(myRef, {
        displayName: newName,
        photoURL: attachmentUrl,
      });
    }

    refreshUser();
  };

  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const attachedFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setPhotoUrl(result);
      setNewPhotoUrl(result);
    };
    reader.readAsDataURL(attachedFile);
  };

  useEffect(() => {
    getMyTweets();
  });

  return (
    <div className="container profile">
      <form className="profileForm" onSubmit={onSubmit}>
        <div className="photo_wrap">
          <div className={`photo_big${photoUrl ? "" : " no_photo"}`}>
            {photoUrl ? (
              <>
                <label className="profile_photo" htmlFor="photo_file">
                  <img src={photoUrl} alt="" />
                </label>
              </>
            ) : (
              <label className="profile_photo" htmlFor="photo_file">
                <span>{userObj.displayName.substring(0, 1).toUpperCase()}</span>
              </label>
            )}
          </div>
          <input
            type="file"
            id="photo_file"
            accept="image/*"
            onChange={onFileChange}
            style={{
              display: "none",
            }}
          />
        </div>
        <input
          type="text"
          placeholder="Display Name"
          className="formInput"
          onChange={onChange}
          value={newName}
          autoFocus
        />
        <input
          type="submit"
          value="Update Profile"
          className="formBtn"
          style={{
            marginTop: 10,
          }}
        />
      </form>
      <span className="formBtn cancelBtn logOut" onClick={onLogOutClick}>
        Sign Out
      </span>
    </div>
  );
};

export default Profile;
