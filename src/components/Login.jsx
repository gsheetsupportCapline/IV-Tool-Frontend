import { useState } from "react";
import OfficeDropdown from "./OfficeDropdown";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState("true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("");

  const navigate = useNavigate();

  const toggleSignInForm = () => {
    setIsSignInForm(!isSignInForm);
  };

  const handleOfficeSelect = (office) => {
    setSelectedOffice(office);
    // Proceed with login process after selecting an office
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email: email,
          password: password,
          office: selectedOffice,
        }
      );

      // Assuming the server responds with a token or user data
      // You might want to store this in local storage or context
      localStorage.setItem("loggedInOffice", selectedOffice);
      localStorage.setItem("token", response.data.token);

      // Redirect to the Home page after successful login
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      // Handle the error, e.g., show an error message to the user
    }
  };

  return (
    <>
      <form className="bg-black shadow-md rounded px-8 pt-6 pb-8  w-3/12 my-36 mx-auto right-0 left-0 text-white  ">
        <h1 className="font-bold text-3xl py-4">Sign In</h1>
        <div className="mb-4">
          <OfficeDropdown onSelect={handleOfficeSelect} />
        </div>

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
        <p className="py-4 cursor-pointer" onClick={toggleSignInForm}></p>
      </form>
    </>
  );
};

export default Login;
