import { fbStorage, firebaseDB } from "fb";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPencilAlt,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const Tweet = ({ tweetObj, author, photo, isOwner }) => {
  const [editing, setEditing] = useState(false);
  const [newTweet, setNewTweet] = useState(tweetObj.text);
  const [imageUrl, setImageUrl] = useState(tweetObj.attachmentUrl);
  const [delImageUrl, setDelImageUrl] = useState();
  const [newImageUrl, setNewImageUrl] = useState();
  const [elapsedTime, setElapsedTime] = useState();
  const docRef = doc(firebaseDB, `tweets/${tweetObj.id}`);
  const ogImageUrl = tweetObj.attachmentUrl;

  const onDeleteClick = async (event) => {
    event.preventDefault();
    const fireStorageRef = fbStorage.ref(
      fbStorage.getStorage(),
      tweetObj.attachmentUrl
    );
    if (window.confirm("Are you sure you wanna delete this tweet?")) {
      await deleteDoc(docRef);
      await deleteObject(fireStorageRef);
    }
  };

  const onUpdateClick = async (event) => {
    event.preventDefault();

    let attachmentUrl = "";
    if (newImageUrl !== "") {
      const random = Date.now();
      const fireStorageRef = fbStorage.ref(
        fbStorage.getStorage(),
        `${tweetObj.creatorId}/${random}`
      );
      const response = await fbStorage.uploadString(
        fireStorageRef,
        newImageUrl,
        "data_url"
      );
      attachmentUrl = await getDownloadURL(response.ref);
    }

    if (attachmentUrl === "") {
      updateDoc(docRef, {
        text: newTweet,
      });
    } else {
      updateDoc(docRef, {
        text: newTweet,
        attachmentUrl,
      });
    }

    if (delImageUrl) {
      const fireStorageRef = fbStorage.ref(fbStorage.getStorage(), delImageUrl);
      await deleteObject(fireStorageRef);
    }

    setEditing(false);
  };

  const onChange = (event) => {
    setNewTweet(event.target.value);
  };

  const deleteImg = (event) => {
    if (window.confirm("Do you wanna delete the image?")) {
      setDelImageUrl(imageUrl);
      setImageUrl("");
    }
  };

  const onAttachNew = (event) => {
    const {
      target: { files },
    } = event;
    const attachedFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setNewImageUrl(result);
    };
    reader.readAsDataURL(attachedFile);
  };

  const deleteNewImg = () => setNewImageUrl("");

  const toggleEditing = () => {
    setEditing((prev) => !prev);
    if (delImageUrl) {
      setDelImageUrl("");
      setImageUrl(ogImageUrl);
    }
  };

  const calcElapsedTime = () => {
    const start = new Date(tweetObj.createdAt);
    const end = new Date(); // 현재 날짜
    const diff = end - start; // 경과 시간

    const times = [
      { time: "분", milliSeconds: 1000 * 60 },
      { time: "시간", milliSeconds: 1000 * 60 * 60 },
      { time: "일", milliSeconds: 1000 * 60 * 60 * 24 },
      { time: "개월", milliSeconds: 1000 * 60 * 60 * 24 * 30 },
      { time: "년", milliSeconds: 1000 * 60 * 60 * 24 * 365 },
    ].reverse();

    for (const value of times) {
      const betweenTime = Math.floor(diff / value.milliSeconds);

      if (betweenTime > 0) {
        return `${betweenTime}${value.time} 전`;
      }
    }

    return "방금 전";
  };

  useEffect(() => {
    setElapsedTime(calcElapsedTime());
  }, []);

  return (
    <div key={tweetObj.id} className="tweet">
      {editing ? (
        <>
          {isOwner && (
            <>
              <form className="container tweetEdit">
                <input
                  type="text"
                  value={newTweet}
                  onChange={onChange}
                  placeholder="Edit your tweet"
                  className="tweetInput"
                  required
                  autoFocus
                  style={{ marginBottom: "10px" }}
                />
                {!delImageUrl && (
                  <div className="img_wrap">
                    <div
                      className="img_delete"
                      onClick={(event) => deleteImg(event)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M175 175C184.4 165.7 199.6 165.7 208.1 175L255.1 222.1L303 175C312.4 165.7 327.6 165.7 336.1 175C346.3 184.4 346.3 199.6 336.1 208.1L289.9 255.1L336.1 303C346.3 312.4 346.3 327.6 336.1 336.1C327.6 346.3 312.4 346.3 303 336.1L255.1 289.9L208.1 336.1C199.6 346.3 184.4 346.3 175 336.1C165.7 327.6 165.7 312.4 175 303L222.1 255.1L175 208.1C165.7 199.6 165.7 184.4 175 175V175zM512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z" />
                      </svg>
                    </div>
                    <img src={imageUrl} alt=""></img>
                  </div>
                )}
                {delImageUrl && !newImageUrl && (
                  <div className="new_attach">
                    <label
                      htmlFor={`attach_${tweetObj.id}`}
                      className="factoryInput_label"
                    >
                      <span>Add Photo</span>
                      <FontAwesomeIcon icon={faPlus} />
                    </label>
                    <input
                      type="file"
                      id={`attach_${tweetObj.id}`}
                      accept="image/*"
                      onChange={onAttachNew}
                      style={{
                        display: "none",
                      }}
                    />
                  </div>
                )}
                {newImageUrl && (
                  <div className="new_attachment">
                    <img
                      src={newImageUrl}
                      alt=""
                      style={{
                        backgroundImage: newImageUrl,
                      }}
                    />
                    <div className="new_clear" onClick={deleteNewImg}>
                      <span>Remove</span>
                      <FontAwesomeIcon icon={faTimes} />
                    </div>
                  </div>
                )}

                <button onClick={onUpdateClick} className="formBtn">
                  Edit
                </button>
                <button onClick={toggleEditing} className="formBtn cancelBtn">
                  Cancel
                </button>
              </form>
            </>
          )}
        </>
      ) : (
        <>
          <div>
            <div className="tweet_top">
              <div className="photo_small">
                {photo ? (
                  <>
                    <label className="profile_photo">
                      <img src={photo} alt="" />
                    </label>
                  </>
                ) : (
                  <label className="profile_photo">
                    {author.substring(0, 1).toUpperCase()}
                  </label>
                )}
              </div>
              <div className="tweet_info">
                <div className="tweet_author">
                  <div className="name">{author}</div>&nbsp;·&nbsp;
                  <span>{elapsedTime}</span>
                </div>
                <h4 className="text">{tweetObj.text}</h4>
              </div>
            </div>
            <div className="tweet_bottom">
              {tweetObj.attachmentUrl && (
                <img src={tweetObj.attachmentUrl} alt="" />
              )}
            </div>
          </div>
          {isOwner && (
            <div className="tweet_actions">
              <span onClick={onDeleteClick} title="Delete">
                <FontAwesomeIcon icon={faTrash} />
              </span>
              <span onClick={toggleEditing} title="Edit">
                <FontAwesomeIcon icon={faPencilAlt} />
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tweet;
