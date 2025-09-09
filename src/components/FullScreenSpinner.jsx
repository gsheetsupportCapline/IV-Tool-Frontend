
const FullScreenSpinner = () => (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(255,255,255,0.7)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
    <div className="loader"></div>
    <style>
      {`
        .loader {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 70px;
          height: 70px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}
    </style>
  </div>
);

export default FullScreenSpinner;