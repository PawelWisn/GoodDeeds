import "./LoginForm.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import axiosClient from "../utils/axiosInstance";
import Cookies from "js-cookie";

function LoginForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  let navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/users/set_csrf_token/");
    axiosClient.defaults.headers.common["X-CSRFToken"] =
      Cookies.get("csrftoken");
  }, []);

  const responseMessage = (response: { credential?: string }) => {
    if (response.credential) {
      axiosClient
        .post(
          "/users/google_login_react/",
          { id_token: response.credential },
          { headers: { "X-CSRFToken": Cookies.get("csrftoken") } },
        )
        .then(() => {
          navigate("/dashboard");
        })
        .catch(() => {
          setErrorMsg("Login failed. Please try again");
        });
    } else {
      setErrorMsg("Login failed. Please try again");
    }
  };

  const errorMessage = () => {
    setErrorMsg("Login failed. Please try again");
  };

  return (
    <div id={"login-form"} className={"card"}>
      <h2>Login by Google</h2>
      <div id={"google-login-button"}>
        <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
      </div>
      {errorMsg && <div className="error-message">{errorMsg}</div>}
    </div>
  );
}

export default LoginForm;
