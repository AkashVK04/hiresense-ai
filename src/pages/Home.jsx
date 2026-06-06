import { useNavigate } from "react-router-dom";
function Home() {
const navigate = useNavigate();
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
      }}
    >
      <h1>HireSense AI</h1>

      <h2>Resume-Based Mock Interview Platform</h2>

      <button
  onClick={() => navigate("/upload")}
  style={{
    padding: "10px 20px",
    cursor: "pointer",
  }}
>
  Start Interview
</button>
    </div>
  );
};

export default Home;