import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {auth} from "../../firebaseConfig";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import "./LoginPage.css";

const LoginPage = () => {

    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!isLogin && password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: username });
            }

            const idToken = await userCredential.user.getIdToken();

            // Make API call to the backend to sync user
            await fetch('http://localhost:5000/api/users/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: idToken }),
            });
            
            navigate("/");
          } catch (err) {
            setError(err.message);
          }
          setLoading(false);
        };

        return (
            <div className="login-container">
              <h1 className="h1">{isLogin ? "Login to your account" : "Create a bball-stats-app account!"}</h1>
              <form onSubmit={handleSubmit} className="login-form">
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                {!isLogin && (
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                )}
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading}>
                  {loading ? (isLogin ? "Logging in..." : "Signing up...") : (isLogin ? "Login" : "Sign Up")}
                </button>
              </form>
              <div className="toggle-link">
                {isLogin ? (
                  <p>
                    Don't have an account?{" "}
                    <button type="button" className="toggle-button" onClick={() => setIsLogin(false)}>
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button type="button" className="toggle-button"onClick={() => setIsLogin(true)}>
                      Log in
                    </button>
                  </p>
                )}
              </div>
            </div>
          );
}

export default LoginPage;
