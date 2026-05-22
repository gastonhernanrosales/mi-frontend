import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Startup() {

  const navigate = useNavigate();

  const { role } = useParams();

  useEffect(() => {

    const timer = setTimeout(() => {

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/cajero");
      }

    }, 28000);

    return () => clearTimeout(timer);

  }, []);

  return (

    <div className="startup-intro">

      <video
        autoPlay
        playsInline
        className="startup-video"
      >
        <source src="/startup.mp4" type="video/mp4" />
      </video>

    </div>
  );
}