import React, { Component, FC, useEffect, useState } from "react"

const Clock : FC<{deadline?:string}> = () => {
  const [hours, setHours] = useState<number>()
  const [minutes, setMinutes] = useState<number>()
  const [seconds, setSeconds] = useState<number>()
  const [days, setDays] = useState<number>()

  const leading0 = num => {
    return num < 10 ? "0" + num : num
  }
  const getTimeUntil = deadline => {
    const time = Date.parse(deadline) - Date.parse(new Date().toString())
    if (time < 0) {
      setDays(0)
      setHours(0)
      setMinutes(0)
      setSeconds(0)
    } else {
      const seconds = Math.floor((time / 1000) % 60)
      const minutes = Math.floor((time / 1000 / 60) % 60)
      const hours = Math.floor((time / (1000 * 60 * 60)) % 24)
      const days = Math.floor(time / (1000 * 60 * 60 * 24))
      setDays(days)
      setHours(hours)
      setMinutes(minutes)
      setSeconds(seconds)
    }
  }

  useEffect(() => {
    getTimeUntil("December, 30, 2021")
    setInterval(() => getTimeUntil("December, 30, 2021"), 1000)

    return () => {
      // setDays = (state,callback)=>{
      return
      // };
    }
  }, [])

  return (
    <div>
      <div className="Clock-days">{leading0(days)}d</div>
      <div className="Clock-hours">{leading0(hours)}h</div>
      <div className="Clock-minutes">{leading0(minutes)}m</div>
      <div className="Clock-seconds">{leading0(seconds)}s</div>
    </div>
  )
}
export default Clock
