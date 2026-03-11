"use client";
import { useState } from 'react';
const ForgotPassword = () => {
    
    const [email, setEmail] = useState('')
    async function submit() {
      try {
        const res = await fetch("http://localhost:8000/auth/forgot-password/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }).then((res) =>{
          console.log("res submit reeset: ", res)
        })

        // const data = await res.json();
        // console.log(data);

        alert("Reset email sent");
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    }
  return (
    <div>
        <h1>Forgot Password</h1>

      <input
        type="email"
        placeholder="email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <button onClick={submit}>
        Send Reset Link
      </button>
    </div>
  )
}

export default ForgotPassword