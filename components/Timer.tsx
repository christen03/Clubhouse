"use client";

import React, { useState, useEffect } from 'react';

const Timer = () => {
  const calculateTimeLeft = () => {
    const targetDate = new Date('2024-09-30T18:00:00'); // Set the target date and time (Sep 30th 6PM)
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex justify-center gap-5 mt-8">
      <div className="bg-black text-white p-6 rounded-lg text-center">
        <p className="text-5xl font-bold">{formatTime(timeLeft.days)}</p>
        <p className="text-gray-400">Days</p>
      </div>
      <div className="bg-black text-white p-6 rounded-lg text-center">
        <p className="text-5xl font-bold">{formatTime(timeLeft.hours)}</p>
        <p className="text-gray-400">Hours</p>
      </div>
      <div className="bg-black text-white p-6 rounded-lg text-center">
        <p className="text-5xl font-bold">{formatTime(timeLeft.minutes)}</p>
        <p className="text-gray-400">Minutes</p>
      </div>
      <div className="bg-black text-white p-6 rounded-lg text-center">
        <p className="text-5xl font-bold">{formatTime(timeLeft.seconds)}</p>
        <p className="text-gray-400">Seconds</p>
      </div>
    </div>
  );
};

export default Timer;
