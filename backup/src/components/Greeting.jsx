import React from 'react'

const Greeting = () => {
  const greet_mes = "Selamat datang"
  const date_now = new Date();
  return (
    <div>
      <h1>{greet_mes}</h1>
      <p>Date : {date_now.getDate()}</p>
    </div>
  )
}

export default Greeting