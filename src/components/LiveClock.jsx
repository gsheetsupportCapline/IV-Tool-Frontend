import { useState, useEffect } from "react";

const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Format time in CST timezone
  const formatCSTTime = () => {
    const options = {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    const cstTime = currentTime.toLocaleString("en-US", options);
    return cstTime;
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        backgroundColor: "#1e293b",
        color: "#ffffff",
        padding: "4px 8px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        fontSize: "13px",
        fontWeight: "500",
        zIndex: 1000,
        fontFamily: "monospace",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        {/* <span style={{ fontSize: "13px" }}>🕐</span> */}
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600" }}>
            {formatCSTTime()}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#94a3b8",
              marginTop: "2px",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LiveClock;
