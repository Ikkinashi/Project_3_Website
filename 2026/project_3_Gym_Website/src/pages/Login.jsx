import React, { useState } from "react";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        console.log("Email:", email);
        console.log("Password:", password);
    };

    return (
        <div className="login-page">

            <div className="login-container">

                {/* LEFT SIDE */}
                <div className="login-brand">

                    <div className="brand-label">
                        FORGE FITNESS
                    </div>

                    <h1>
                        FORGE YOUR
                        <span> STRONGER SELF.</span>
                    </h1>

                    <p>
                        Train harder. Recover smarter.
                        Build the version of yourself you've always wanted.
                    </p>

                    <div className="brand-line"></div>

                    <small>
                        PERFORMANCE • DISCIPLINE • PROGRESS
                    </small>

                </div>


                {/* RIGHT SIDE */}
                <div className="login-card">

                    <div className="login-header">

                        <span className="login-overline">
                            MEMBER ACCESS
                        </span>

                        <h2>Welcome Back</h2>

                        <p>
                            Sign in to continue your Forge journey.
                        </p>

                    </div>


                    <form onSubmit={handleLogin}>

                        <div className="input-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </div>


                        <div className="input-group">

                            <div className="password-label">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <a href="#">
                                    Forgot password?
                                </a>

                            </div>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                        </div>


                        <button
                            className="login-button"
                            type="submit"
                        >
                            LOGIN
                            <span>→</span>
                        </button>

                    </form>


                    <div className="signup-text">

                        Don't have an account?

                        <a href="#">
                            Sign up
                        </a>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;