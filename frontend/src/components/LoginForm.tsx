import "../styles/LoginForm.scss";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import axiosClient from "../utils/axiosInstance";
import { useWebSocket } from "../toasts/ToastsWebSocketProvider";

const login_failed_msg = "Login failed. Please try again";

function LoginForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  let navigate = useNavigate();
  const { handleStorageChange } = useWebSocket();

  useEffect(() => {
    sessionStorage.clear();
    handleStorageChange();
  }, []);

  const responseMessage = (response: { credential?: string }) => {
    if (response.credential) {
      axiosClient
        .post("/users/google_login_react/", { id_token: response.credential })
        .then(async (response) => {
          const { user_id, user_name, user_avatar } = response.data;

          sessionStorage.setItem("user_id", user_id);
          sessionStorage.setItem("user_name", user_name);
          handleStorageChange();

          const cachedAvatar = sessionStorage.getItem("user_avatar_cache");
          if (cachedAvatar) {
            sessionStorage.setItem("user_avatar", cachedAvatar);
          } else {
            try {
              const avatarResponse = await fetch(user_avatar);
              const blob = await avatarResponse.blob();
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result as string;
                sessionStorage.setItem("user_avatar_cache", base64data);
                sessionStorage.setItem("user_avatar", base64data);
              };
              reader.readAsDataURL(blob);
            } catch (error) {
              sessionStorage.setItem("user_avatar", user_avatar);
            }
          }
          navigate("/dashboard");
        })
        .catch(() => {
          errorMessage();
        });
    } else {
      errorMessage();
    }
    handleStorageChange();
  };

  const errorMessage = () => {
    setErrorMsg(login_failed_msg);
  };

  return (
    <div id={"login-form"} className={"card"}>
      <h2>Login by Google</h2>
      <div id={"google-login-button"}>
        <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
      </div>
      {errorMsg && <div className={"error-message"}>{errorMsg}</div>}
    </div>
  );
}

export default LoginForm;
