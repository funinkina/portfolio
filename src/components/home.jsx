import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import UpSvg from "../assets/upup.svg";
import Deco from "../assets/deco-1.svg";
import "./home.css";

const Home = () => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");
  const [delta, setDelta] = useState(300 - Math.random() * 100);
  const [index, setIndex] = useState(1);
  const toRotate = ["website", "design", "interface", "app"];
  const period = 3000;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let speed = gsap
      .timeline({
        scrollTrigger: {
          trigger: ".artsvg",
          pin: false,
          scrub: 0.2,
          start: "top 90%",
          end: "bottom top",
        },
      })
      .to(".artsvg", {
        yPercent: -300,
        ease: "none",
      });

    function rotateElement() {
      gsap.to("#decosvgimg", {
        ease: 'none',
        rotation: "+=90", // Rotate by 90 degrees
        duration: 0.5, // Animation duration in seconds
        onComplete: () => {
          setTimeout(rotateElement, 500);
      },
      });
    }
    rotateElement();

    return () => {
      speed.kill();
    };
  }, []);

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => {
      clearInterval(ticker);
    };
  }, [text]);

  const tick = () => {
    let i = loopNum % toRotate.length;
    let fullText = toRotate[i];
    let updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta((prevDelta) => prevDelta / 2);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setIndex((prevIndex) => prevIndex - 1);
      setDelta(period);
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setIndex(1);
      setDelta(500);
    } else {
      setIndex((prevIndex) => prevIndex + 1);
    }
  };

  return (
    <>
      <div className="intro section" id="home">
        <div className="name">
          <p>funinkina</p>
        </div>
        <div className="infotext" datatype="link">
          <span className="firstline">
            <p>
              Making the world <span id="fancy">organised</span>
            </p>
          </span>
          <span className="secondline">
            <p>
              <span id="one">one</span>
              <span className="magic">
                <span className="magic-text">{text}</span>
              </span>
              <span id="atatime">at a time.</span>
            </p>
          </span>
        </div>
        <div className="artsvg" data-speed="1.2">
          <img className="artsvgimg" src={UpSvg} alt="" />
        </div>
        <div id="decosvg" data-speed="1.2">
          <img id="decosvgimg" src={Deco} alt="" />
        </div>
      </div>
    </>
  );
};

export default Home;
