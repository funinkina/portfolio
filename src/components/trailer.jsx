import { useState, useEffect } from "react";
import "./home.css";

const Trailer = () => {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const trailer = document.getElementById("trailer");

    const animateTrailer = (e, interacting) => {
      const x = e.clientX - trailer.offsetWidth / 2,
        y = e.clientY - trailer.offsetHeight / 2;

      const keyframes = {
        transform: `translate(${x}px, ${y}px) scale(${interacting ? 5 : 1})`,
      };

      trailer.animate(keyframes, {
        duration: 100,
        fill: "forwards",
      });
    };

    const getTrailerClass = (type) => {
      switch (type) {
        case "inlink":
          return "arrow_circle_down";
        case "external":
          return "open_in_new";
        case "image":
          return "gallery_thumbnail";
        case "intlink":
          return "expand_content";
        case "mail":
          return "mail";
        case "social":
          return "alternate_email";
        case "document":
          return "description"
        default:
          return "";
      }
    };

    window.onmousemove = (e) => {
      const interactable = e.target.closest(".interactable"),
        interacting = interactable !== null;

      animateTrailer(e, interacting);

      trailer.dataset.type = interacting ? interactable.dataset.type : "";

      if (interacting) {
        setLabel(getTrailerClass(interactable.dataset.type));
      }
    };
  }, []);

  return (
    <div id="trailer">
      <span id="trailer-icon" className="material-symbols-rounded">
        {label}
      </span>
    </div>
  );
};

export default Trailer;
