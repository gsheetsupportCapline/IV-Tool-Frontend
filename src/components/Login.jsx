import { useState } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email: email,
          password: password,
        }
      );
      // console.log("response", response);
      // console.log("response data", response.data);

      localStorage.setItem("token", response.data.token);

      const userRole = response.data.data.userDetails.role;
      localStorage.setItem(
        "loggedinUserId",
        response.data.data.userDetails._id
      );
      localStorage.setItem(
        "loggedinUserName",
        response.data.data.userDetails.name
      );
      localStorage.setItem("role", response.data.data.userDetails.role);
      localStorage.setItem(
        "assignedOffice",
        response.data.data.userDetails.assignedOffice
      );
      switch (userRole) {
        case "admin":
          navigate("/home");
          break;
        case "user":
          navigate("/dashboard");
          break;
        case "officeuser":
          navigate("/home");
          break;
        default:
          console.error("Unknown user role:", userRole);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <form className="bg-black shadow-md rounded px-8 pt-6 pb-8  w-3/12 my-36 mx-auto right-0 left-0 text-white  ">
        <h1 className="font-bold text-3xl py-4">Sign In</h1>

        <div className="mb-4">
          <input
            className="shadow appearance-none border rounded py-2 px-3 w-full bg-gray-700  leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <input
            className="shadow appearance-none border rounded  w-full py-2 px-3  mb-3 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleSubmit}
          >
            Sign In
          </button>
        </div>
      </form>
    </>
  );
};

export default Login;
