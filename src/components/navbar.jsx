import { useState, useEffect } from "react";
import nav_svg from "../assets/nav_svg.svg";

function NavBar() {
  const [activeLink, setActiveLink] = useState("home");
  const onUpdateActiveLink = (value) => {
    setActiveLink(value);
  };

  // const sections = document.querySelectorAll(".section");
  // const navLi = document.querySelectorAll("nav .link");
  // window.onscroll = () => {
  //   var current = "";

  //   sections.forEach((section) => {
  //     const sectionTop = section.offsetTop;
  //     if (pageYOffset >= sectionTop - 60) {
  //       current = section.getAttribute("id");
  //     }
  //   });

  //   navLi.forEach((li) => {
  //     li.classList.remove("active");
  //     if (li.classList.contains(current)) {
  //       li.classList.add("active");
  //     }
  //   });
  // };

  return (
    <>
      <nav className="navbar" id="navbar">
        <div className="dec-img">
          <img src={nav_svg} />
        </div>
        <div className="links">
          <div
            className={
              activeLink === "home" ? "active link" : "link interactable"
            }
            onClick={() => onUpdateActiveLink("home")}
            data-type="inlink"
          >
            <a href="#home">Home</a>
          </div>
          <div
            className={
              activeLink === "projects" ? "active link" : "link interactable"
            }
            onClick={() => onUpdateActiveLink("projects")}
            data-type="inlink"
          >
            <a href="#projects">Projects</a>
          </div>
          <div
            className={
              activeLink === "artworks" ? "active link" : "link interactable"
            }
            onClick={() => onUpdateActiveLink("artworks")}
            data-type="inlink"
          >
            <a href="#artworks">Artworks</a>
          </div>
          <div
            className={
              activeLink === "contactstab" ? "active link" : "link interactable"
            }
            onClick={() => onUpdateActiveLink("contactstab")}
            data-type="inlink"
          >
            <a href="#contactstab">Contact</a>
          </div>
          <div
            className={
              activeLink === "resume" ? "active link" : "link interactable"
            }
            onClick={() => onUpdateActiveLink("resume")}
            data-type="inlink"
          >
            <a href="#resume">Resume</a>
          </div>
        </div>
        <div className="dec-img" id="flip-icon">
          <img src={nav_svg} />
        </div>
      </nav>
    </>
  );
}

export default NavBar;
