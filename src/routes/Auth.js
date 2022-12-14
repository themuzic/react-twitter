import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faGoogle,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import AuthForm from "components/AuthForm";
import { authService, firebaseDB } from "fb";
import { doc, setDoc } from "firebase/firestore";

const Auth = () => {
  const auth = authService.getAuth();
  const onSocialClick = async (event) => {
    const {
      target: { name },
    } = event;
    let provider;
    if (name === "google") {
      provider = new authService.GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
    } else if (name === "github") {
      provider = new authService.GithubAuthProvider();
      provider.addScope("repo");
    }
    const { user } = await authService.signInWithPopup(auth, provider);

    const newMember = {
      uid: user.uid,
      photoURL: user.photoURL,
      displayName: user.displayName,
    };
    setDoc(doc(firebaseDB, "members", user.uid), newMember);
  };

  return (
    <div className="authContainer">
      <div style={{ textAlign: "center" }}>
        <FontAwesomeIcon
          icon={faTwitter}
          color={"#04AAFF"}
          size="3x"
          style={{ marginBottom: 30 }}
        />
        <AuthForm />
        <div className="authBtns">
          <button onClick={onSocialClick} name="google" className="authBtn">
            Continue with Google <FontAwesomeIcon icon={faGoogle} />
          </button>
          &nbsp;
          <button onClick={onSocialClick} name="github" className="authBtn">
            Continue with Github <FontAwesomeIcon icon={faGithub} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
