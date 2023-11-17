import { useEffect } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import contactsvg from "../assets/contact.svg";
import instagram from "../assets/instagram.svg";
import github from "../assets/github.svg";
import linkedin from "../assets/linkedin.svg";

const Contact = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(".proj_svg", { xPercent: 0 });

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

    return () => {
      rotate.kill();
    };
  });
  return (
    <>
      <div id="contactstab">
        <div id="contactmain">
          <div id="contacthead">
            <p>Contact</p>
            <img src={contactsvg} alt="" className="proj_svg" />
          </div>
          <div className="spacer"></div>
          <div id="coninfo">
            <p>Aryan Kushwaha</p>
            <a
              href="mailto:funinkina@outlook.com"
              data-type="mail"
              className="interactable"
            >
              funinkina@outlook.com
            </a>
          </div>
          <div id="socials">
            <a href="https://www.instagram.com/funinkina/">
                <img
                  data-type="social"
                  className="interactable"
                  src={instagram}
                  alt=""
                />
            </a>
            <a href="https://github.com/funinkina">
                <img
                  data-type="social"
                  className="interactable"
                  src={github}
                  alt=""
                />
            </a>
            <a href="https://linkedin.com/in/funinkina">
                <img
                  data-type="social"
                  className="interactable"
                  src={linkedin}
                  alt=""
                />
            </a>
            <a href="" data-type="document" className="interactable">Get Resume</a>
          </div>
          <div className="spacer"></div>
        </div>
      </div>
    </>
  );
};

export default Contact;
