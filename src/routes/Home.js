import Tweet from "components/Tweet";
import TweetFactory from "components/TweetFactory";
import { firebaseDB } from "fb";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";

const Home = ({ userObj }) => {
  const collectionRef = collection(firebaseDB, "tweets");
  const tweetQuery = query(collectionRef, orderBy("createdAt", "desc"));

  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    onSnapshot(tweetQuery, (snapShot) => {
      const tweetArr = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTweets(tweetArr);
      // console.log("worked ", new Date().toLocaleString());
    });
  });

  return (
    <div className="container">
      <TweetFactory userObj={userObj} collectionRef={collectionRef} />
      <div>
        {tweets.map((tw) => (
          <Tweet
            key={tw.id}
            tweetObj={tw}
            author={userObj.displayName}
            photo={userObj.photoURL}
            isOwner={tw.creatorId === userObj.uid ? true : false}
          />
        ))}
      </div>
    </div>
  );
};
export default Home;
