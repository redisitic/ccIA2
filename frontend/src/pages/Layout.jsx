import React from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <div className="w-full">
        <div className="container flex flex-col items-center justify-center mx-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Layout;
