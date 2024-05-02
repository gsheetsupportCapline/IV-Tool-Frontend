import React, { useState } from "react";
import Header from "./Header";

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState("true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toggleSignInForm = () => {
    setIsSignInForm(!isSignInForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log("Email:", email, "Password:", password);
    // Here you can add your login logic, e.g., calling an API
  };

  return (
    <>
      <Header />
      <form className="bg-black shadow-md rounded px-8 pt-6 pb-8  w-3/12 my-36 mx-auto right-0 left-0 text-white  ">
        <h1 className="font-bold text-3xl py-4">
          {isSignInForm ? "Sign In" : "Sign Up"}
        </h1>
        <div className="mb-4">
          {!isSignInForm && (
            <input
              className="shadow appearance-none border rounded py-2 px-3 w-full bg-gray-700  leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
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
            {isSignInForm ? "Sign In" : "Sign Up"}
          </button>
        </div>
        <p className="py-4 cursor-pointer" onClick={toggleSignInForm}>
          {isSignInForm
            ? "New to IV ? Sign Up Now"
            : "Already registered ? Sign In Now"}
        </p>
      </form>
    </>
  );
};

export default Login;
