import ProjSvg from "../assets/proj_svg.svg";
import Side from "../assets/side.svg";
import Arrow from "../assets/arrow.svg";
import ArrowDia from "../assets/arrow_dia.svg";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const RecentProjects = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(".proj_svg", { xPercent: 0 });
    gsap.set("#allprojs", { xPercent: 20, opacity: 0.5 });
    gsap.set(".sidedecor", { yPercent: 40 });

    let rotate = gsap
      .timeline({
        scrollTrigger: {
          trigger: "",
          pin: true,
          scrub: true,
          start: "top bottom",
          end: "bottom top",
          invalidateOnRefresh: true,
        },
      })
      .to(".proj_svg", {
        rotation: 360 * 6,
        duration: 1,
        ease: "none",
      });

    let comein = gsap.to("#allprojs", {
      xPercent: 0,
      opacity: 1,
      scrollTrigger: {
        trigger: "#allprojs",
        scrub: false,
        start: "top 95%",
        duration: 1.5,
        ease: "circ.in",
      },
    });

    return () => {
      rotate.kill();
      comein.kill();
    };
  }, []);

  return (
    <div id="projectstab">
      <div className="recent_projects section" id="projects">
        <div id="head">
          <p>Recent Projects</p>
          <img className="proj_svg" src={ProjSvg} alt="svg" />
        </div>
        <div id="content">
          <div id="side-deco">
            <img src={Side} alt="" className="flip-alt" />
            <img src={Side} alt="" className="" />
            <img src={Side} alt="" className="flip-alt" />
            <img src={Side} alt="" className="" />
            <img src={Side} alt="" className="flip-alt" />
            <img src={Side} alt="" className="" />
            <img src={Side} alt="" className="flip-alt" />
          </div>
          <div id="projects">
            <div
              className="one-proj top-proj interactable"
              data-type="external"
            >
              <a target="_blank" href="https://twitter.com/tay_lyricbot">
                <div className="project">
                  <p>Taylor&nbsp;Swift&nbsp;Lyrics&nbsp;Twitter&nbsp;Bot</p>
                  <div className="arrow">
                    <img src={Arrow} alt="" />
                  </div>
                </div>
              </a>
            </div>
            <div className="one-proj interactable" data-type="external">
              <a target="_blank" href="https://github.com/funinkina/HalfBold">
                <div className="project">
                  <p>HalfBold</p>
                  <div className="arrow">
                    <img src={Arrow} alt="" />
                  </div>
                </div>
              </a>
            </div>
            <div className="one-proj interactable" data-type="external">
              <a
                target="_blank"
                href="https://github.com/funinkina/manjaro-minimal-bootsplash"
              >
                <div className="project">
                  <p>Manjaro&nbsp;Bootsplash&nbsp;Screen</p>
                  <div className="arrow">
                    <img src={Arrow} alt="" />
                  </div>
                </div>
              </a>
            </div>
            <div className="one-proj interactable" data-type="external">
              <a target="_blank" href="https://papanarazhain.com/">
                <div className="project">
                  <p>Papa&nbsp;Naraz&nbsp;Hain</p>
                  <div className="arrow">
                    <img src={Arrow} alt="" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div id="allprojs" className="interactable" data-type="intlink">
          <p>See all projects</p>
          <img src={ArrowDia} alt="" />
        </div>
        <div id="trigger"></div>
      </div>
    </div>
  );
};

export default RecentProjects;
