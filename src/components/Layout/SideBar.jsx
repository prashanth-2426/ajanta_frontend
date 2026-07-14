import React, { useContext } from "react";
import AppMenu from "./AppMenu";
import { LayoutContext } from "../../store/layoutContext";
import { MenuProvider } from "../../store/menuContext";
import { useSelector } from "react-redux";

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

  const user = useSelector((state) => state.auth.user);

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

        {/* <div className="layout-menu-container">
          <MenuProvider>
            <AppMenu />
          </MenuProvider>
        </div> */}
        <div
          className="layout-menu-container"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 80px)",
            justifyContent: "space-between",
          }}
        >
          <MenuProvider>
            <AppMenu />
          </MenuProvider>

          <div
            style={{
              padding: "1rem",
              borderTop: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <div className="flex align-items-center gap-3">
              {/* Avatar */}
              <div
                className="flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#eef2ff",
                  color: "#4338ca",
                  flexShrink: 0,
                }}
              >
                <i
                  className="pi pi-user"
                  style={{
                    fontSize: "1.1rem",
                  }}
                />
              </div>

              {/* User Info */}
              <div className="flex flex-column overflow-hidden">
                <span
                  style={{
                    fontWeight: 600,
                    color: "#1e293b",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name || "User"}
                </span>

                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email}
                </span>

                <div className="flex align-items-center gap-2 mt-1">
                  <span
                    style={{
                      background: "#eef2ff",
                      color: "#4338ca",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {user?.role?.toLowerCase() === "user"
                      ? "BUYER"
                      : user?.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

SideBar.displayName = "SideBar";

export default SideBar;
