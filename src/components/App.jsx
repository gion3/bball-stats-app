import { useState } from "react"

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async(e) =>{
    console.log('Handle submit called')
    e.preventDefault()
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name:username, password })
    });

    if (response.ok) {
      alert('User logged in');
    } else {
      alert('Error logging in user');
    }
  }
  return (
    <>
      <h1>Login Test</h1>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="https://google.com">Register</a></p>
    </>
  );
}

export default App
