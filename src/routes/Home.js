import React, { useEffect, useState } from "react";
import Tweet from "components/Tweet";
import TweetFactory from "components/TweetFactory";
import { firebaseDB } from "fb";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const Home = ({ userObj }) => {
  const collectionRef = collection(firebaseDB, "tweets");
  const tweetQuery = query(collectionRef, orderBy("createdAt", "desc"));
  const myTweetQuery = query(
    collection(firebaseDB, "tweets"),
    where("creatorId", "==", userObj.uid),
    orderBy("createdAt", "desc")
  );
  const [tweets, setTweets] = useState([]);
  const [isOnlyMyTweets, setIsOnlyMyTweets] = useState(false);

  const handleMyTweets = (e) => {
    setIsOnlyMyTweets(e.target.checked);
  };

  useEffect(() => {
    const query = isOnlyMyTweets ? myTweetQuery : tweetQuery;
    onSnapshot(query, (snapShot) => {
      let tweetArr = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTweets(tweetArr);
    });
  }, [isOnlyMyTweets]);

  return (
    <div className="container">
      {userObj && (
        <>
          <div id="my-tweet-wrap">
            <label>
              <input
                type="checkbox"
                id="my-tweets"
                onClick={(event) => handleMyTweets(event)}
              />
              &nbsp;My tweets
            </label>
          </div>
        </>
      )}
      <TweetFactory userObj={userObj} collectionRef={collectionRef} />
      <div>
        {tweets.map((tw) => (
          <Tweet
            key={tw.id}
            tweetObj={tw}
            isOwner={tw.creatorId === userObj.uid ? true : false}
          />
        ))}
      </div>
    </div>
  );
};
export default Home;
