import React, { useState, useRef } from "react";
import axios from "axios";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailError = useRef(null);
  const passwordError = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    axios({
      method: 'post',
      url: `${process.env.REACT_APP_URL_API}api/user/login`,
      withCredentials: true,
      data: {
        email,
        password,
      },
    })
      .then((res) => {
        if (res.data.errors) {
          emailError.current.innerHTML = res.data.errors.email || '';
          passwordError.current.innerHTML = res.data.errors.password || '';
        } else {
          window.location = '/';
        }
      })
      .catch((err) => {
        console.error('Erreur lors de la requête :', err);
        emailError.current.innerHTML = 'Une erreur s\'est produite. Veuillez réessayer.';
        passwordError.current.innerHTML = '';
      });
  };

  return (
    <form action="" onSubmit={handleLogin} id="sign-up-form">
      <label htmlFor="email">Email</label>
      <br />
      <input
        type="text"
        name="email"
        id="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <div className="email error" ref={emailError}></div>
      <br />

      <label htmlFor="password">Mot de passe</label>
      <br />
      <input
        type="password"
        name="password"
        id="password" // Correction : 'id' doit être 'password' au lieu de 'email'
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <div className="password error" ref={passwordError}></div>
      <br />
      <input type="submit" value="Se connecter" />
    </form>
  );
};

export default SignInForm;