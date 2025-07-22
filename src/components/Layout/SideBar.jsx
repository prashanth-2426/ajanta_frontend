import React, { useContext } from "react";
import AppMenu from "./AppMenu";
import { LayoutContext } from "../../store/layoutContext";
import { MenuProvider } from "../../store/menuContext";

import logoImg from "../../assets/images/ajantha_logo.png";

const SideBar = (props) => {
  const { layoutConfig, setLayoutState, layoutState } =
    useContext(LayoutContext);
  let timeout = null;

  const anchor = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      anchored: !prevLayoutState.anchored,
    }));
  };
  const onMouseEnter = () => {
    if (!layoutState.anchored) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        sidebarActive: true,
      }));
    }
  };
  const onMouseLeave = () => {
    if (!layoutState.anchored) {
      if (!timeout) {
        timeout = setTimeout(() => {
          setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            sidebarActive: false,
          }));
        }, 300);
      }
    }
  };

  return (
    <React.Fragment>
      <div
        ref={props.sidebarRef}
        className="layout-sidebar"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="sidebar-header">
          <a onClick={() => {}} className="app-logo cursor-pointer">
            <img src={logoImg} alt={"Logo "} width="140" height="25" />
          </a>
          <button
            className="layout-sidebar-anchor p-link"
            type="button"
            onClick={anchor}
          ></button>
        </div>

        <div className="layout-menu-container">
          <MenuProvider>
            <AppMenu />
          </MenuProvider>
        </div>
      </div>
    </React.Fragment>
  );
};

SideBar.displayName = "SideBar";

export default SideBar;
