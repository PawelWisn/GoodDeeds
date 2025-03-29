import "./LoginForm.scss";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import axiosClient from "../utils/axiosInstance";

const login_failed_msg = "Login failed. Please try again";

function LoginForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  let navigate = useNavigate();

  const responseMessage = (response: { credential?: string }) => {
    if (response.credential) {
      axiosClient
        .post("/users/google_login_react/", { id_token: response.credential })
        .then((response) => {
          sessionStorage.setItem("user_id", response.data.user_id);
          sessionStorage.setItem("user_name", response.data.user_name);
          navigate("/dashboard");
        })
        .catch(() => {
          setErrorMsg(login_failed_msg);
        });
    } else {
      setErrorMsg(login_failed_msg);
    }
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
