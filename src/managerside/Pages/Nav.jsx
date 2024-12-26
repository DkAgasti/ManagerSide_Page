import React from "react";
import image from "../../assets/img/Logo.png"

const Nav = () => {
  return (
    <>
      <div className="w-full h-[50px] bg-sky-100 z-20  shadow-xl flex items-center">
        <img src={image} alt="Logo" className="h-[70px] ml-4" />
      </div>
    </>
  );
};

export default Nav;