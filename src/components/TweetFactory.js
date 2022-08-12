import { fbStorage } from "fb";
import { addDoc } from "firebase/firestore";
import { getDownloadURL } from "firebase/storage";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const TweetFactory = ({ userObj, collectionRef }) => {
  const [tweet, setTweet] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const onSubmit = async (event) => {
    if (tweet === "") {
      return;
    }
    event.preventDefault();

    let attachmentUrl = "";
    if (fileUrl !== "") {
      const storage = fbStorage.getStorage();
      const random = Date.now();
      const fireStorageRef = fbStorage.ref(storage, `${userObj.uid}/${random}`);
      const response = await fbStorage.uploadString(
        fireStorageRef,
        fileUrl,
        "data_url"
      );
      attachmentUrl = await getDownloadURL(response.ref);
    }

    const newTweet = {
      text: tweet,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      attachmentUrl,
    };
    //console.log(uploadedFileUrl);
    await addDoc(collectionRef, newTweet);
    setTweet("");
    setFileUrl("");
  };

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setTweet(value);
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
      setFileUrl(result);
    };
    reader.readAsDataURL(attachedFile);
  };

  const onClearPhoto = () => {
    setFileUrl("");
  };

  return (
    <form onSubmit={onSubmit} className="factoryForm">
      <div className="factoryInput_container">
        <input
          type="text"
          placeholder="What you wanna talk?"
          className="tweetInput"
          maxLength={120}
          value={tweet}
          onChange={onChange}
        />
        <input
          type="submit"
          value="&rarr;"
          className="factoryInput_arrow"
          title="Tweet!"
        />
      </div>
      <label htmlFor="attach-file" className="factoryInput_label">
        <span>Add Photo</span>
        <FontAwesomeIcon icon={faPlus} />
      </label>
      <input
        type="file"
        id="attach-file"
        accept="image/*"
        onChange={onFileChange}
        style={{
          display: "none",
        }}
      />
      {fileUrl && (
        <div className="factoryForm_attachment">
          <img
            src={fileUrl}
            alt=""
            style={{
              backgroundImage: fileUrl,
            }}
          />
          <div className="factoryForm_clear" onClick={onClearPhoto}>
            <span>Remove</span>
            <FontAwesomeIcon icon={faTimes} />
          </div>
        </div>
      )}
    </form>
  );
};

export default TweetFactory;
