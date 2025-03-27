import "./LoginForm.scss";
import axiosClient from "../utils/axiosInstance";
import React, { useState } from "react";
import { useNavigate } from "react-router";

function LoginForm() {
  let navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axiosClient.post(
        `${import.meta.env.VITE_API_URL}/users/login/`,
        {
          email: email,
          password: password,
        },
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className={"card login-card"}>
      <form onSubmit={handleSubmit}>
        <div className="form-group login-input">
          <label htmlFor="inputEmail">Email</label>
          <input
            type="email"
            className="form-control"
            id="inputEmail"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group login-input">
          <label htmlFor="inputPassword">Password</label>
          <input
            type="password"
            className="form-control"
            id="inputPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
