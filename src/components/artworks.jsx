import { useEffect } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Artsvg from "../assets/artworksvg.svg";
import ArrowDia from "../assets/arrow_dia.svg";
import fairy from "../assets/arts/fairybyriver2.jpg";
import ancient from "../assets/arts/ancientdystopian.png";
import centaur from "../assets/arts/centaur.jpg";
import ruinmoon from "../assets/arts/ruinsinmoon.jpg";
import eerie from "../assets/arts/eerieforest.jpg";
import pierportal from "../assets/arts/pierportal.jpg";
import lamponroad from "../assets/arts/lamponroad.jpg";
import feverdream from "../assets/arts/feverdream.jpg";
import nightbuilding from "../assets/arts/nightbuildings.jpg";
import pianorem from "../assets/arts/pianorem.jpg";
import peekingsky from "../assets/arts/peekingsky.jpg";
import starryperson from "../assets/arts/starryperson.jpg";
import delicatebutterfly from "../assets/arts/delicatebutterfly.jpg";
import levitating from "../assets/arts/levitating.jpg";
import pemrose from "../assets/arts/pemrose.jpg";
import taketheroad from "../assets/arts/taketheroad.jpg";
import "./home.css";

const ArtWorks = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(".proj_svg", { xPercent: 0 });
    gsap.set("#row", { xPercent: 0 });
    gsap.set("#allarts", { yPercent: 15, opacity: 0 });

    let rotate = gsap
      .timeline({
        scrollTrigger: {
          trigger: "",
          pin: true,
          scrub: 0.5,
          start: "top bottom",
          end: "bottom top",
        },
      })
      .to(".proj_svg", {
        rotation: 360 * 8,
        duration: 1,
        ease: "none",
      });

    let slide = gsap.to("#row", {
      x: -document.getElementById("row").scrollWidth + window.innerWidth - 50,
      scrollTrigger: {
        trigger: "#endtrigger",
        scrub: 0.5,
        start: "bottom bottom",
        end: "+=" + document.getElementById("row").offsetWidth / 0.6 + "px",
        ease: "none",
        pin: "#artworks",
        toggleActions: "play pause restart none",
      },
    });

    let comein = gsap.to("#allarts", {
      yPercent: 0,
      opacity: 1,
      scrollTrigger: {
        trigger: "#allarts",
        scrub: false,
        start: "top 95%",
        duration: 2,
        ease: "power4.in",
        toggleActions: "play pause pause reset",
      },
    });

    return () => {
      rotate.kill();
      slide.kill();
      comein.kill();
    };
  }, []);

  return (
    <>
      <div id="artworks">
        <div id="maincont">
          <div id="arthead">
            <p>Artworks</p>
            <img className="proj_svg" src={Artsvg} alt="svg" />
          </div>
          <div id="works">
            <div id="images">
              <div id="row">
                <div className="container">
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CdF5oVPv99J/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={fairy}
                      alt="A fairy sitting by the river in a yellow glow"
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CZ2G7VSt0C6/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={ancient}
                      alt="A statue with wires coming out of the back, a futuristic look"
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CWtP3T3PEaO/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={centaur}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/Cn9783LvlB2/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={lamponroad}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/Cpfcnc9vLG7/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={ruinmoon}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/Cg9-T_Tv0YW/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={eerie}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CtW1ohvPs8G/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={feverdream}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CvsN-VDvVbs/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={pierportal}
                      alt=""
                    />
                  </a>
                  <a target="_blank" href="https://www.instagram.com/p/Cqs2nj5PuPX/">
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={nightbuilding}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CQDaVzptWzH/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={pianorem}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CcyKqQ_vPE2/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={peekingsky}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/Cgm0aW3vG-G/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={starryperson}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CKrGM3enpXZ/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={delicatebutterfly}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CSefS5JlOMq/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={levitating}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CRoSeA7HS4p/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={pemrose}
                      alt=""
                    />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.instagram.com/p/CjIeeC1vQmm/"
                  >
                    <img
                      data-type="image"
                      className="interactable panel"
                      src={taketheroad}
                      alt=""
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div id="allarts" className="interactable" data-type="intlink">
            <p>Explore entire collection</p>
            <img src={ArrowDia} alt="" />
          </div>
        </div>
        <div id="endtrigger"></div>
      </div>
    </>
  );
};

export default ArtWorks;
