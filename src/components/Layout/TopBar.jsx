import React, { useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { forwardRef, useContext, useImperativeHandle, useRef } from "react";
import { useSelector } from "react-redux";
import { LayoutContext } from "../../store/layoutContext";
import { Button } from "primereact/button";
import { StyleClass } from "primereact/styleclass";
import { classNames } from "primereact/utils";
import { Ripple } from "primereact/ripple";
import SideBar from "./SideBar";
import { useDispatch } from "react-redux";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import avatar from "../../assets/images/avatar/square/avatar-m-1.jpg";
import { removeCredentials } from "../../store/authSlice";
import { useApi } from "../../utils/requests";
import { BASE_URL, API_URL } from "../../constants";
//import { postData } from "../../utils/requests";

const TopBar = forwardRef((props, ref) => {
  const { postData } = useApi();
  const { onMenuToggle, showRightSidebar, showConfigSidebar, isHorizontal } =
    useContext(LayoutContext);

  const dispatch = useDispatch();
  const menubuttonRef = useRef(null);
  const buttonref = useRef(null);
  const btnRef1 = useRef(null);
  const imgRef = useRef(null);
  const logoutRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  const onMenuButtonClick = () => {
    onMenuToggle();
  };

  const onConfigButtonClick = () => {
    showConfigSidebar();
  };

  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
  }));

  const logoutHandler = async () => {
    // if (!window.confirm("Are you sure?")) return;

    // await postData("auth/logout", {});
    // dispatch(removeCredentials());

    confirmDialog({
      message: "Are you sure you want to logout?",
      header: "Confirm Logout",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes",
      rejectLabel: "No",
      accept: async () => {
        await postData("auth/logout", {});
        dispatch(removeCredentials());
      },
    });
  };

  useEffect(() => {
    const handleUnload = (event) => {
      // detect reload vs close
      const navEntries = performance.getEntriesByType("navigation");

      const navType = navEntries?.[0]?.type;

      // skip reload
      if (navType === "reload") {
        return;
      }

      try {
        const token = localStorage.getItem("token");

        navigator.sendBeacon(
          `${BASE_URL}/auth/logout`,
          JSON.stringify({
            token,
          }),
        );

        dispatch(removeCredentials());
      } catch (err) {
        console.log("Logout on close failed", err);
      }
    };

    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, [dispatch]);

  return (
    <>
      <ConfirmDialog />
      <div className="layout-topbar">
        <div className="topbar-start">
          <button
            ref={buttonref}
            type="button"
            className="topbar-menubutton p-link p-trigger transition-duration-300"
            onClick={onMenuButtonClick}
          >
            <i className="pi pi-bars"></i>
          </button>
        </div>
        <div className="layout-topbar-menu-section">
          <SideBar sidebarRef={props.sidebarRef} />
        </div>
        <div className="topbar-end">
          <ul className="topbar-menu">
            <li
              className={classNames({
                "block topbar-item ": isHorizontal(),
                "block sm:hidden topbar-item": !isHorizontal(),
              })}
            >
              <StyleClass
                nodeRef={btnRef1}
                selector="@next"
                enterClassName="hidden"
                enterActiveClassName="px-scalein"
                leaveToClassName="hidden"
                leaveActiveClassName="px-fadeout"
                hideOnOutsideClick
              >
                <Button
                  ref={btnRef1}
                  type="button"
                  icon="pi pi-search"
                  className="p-button-text p-button-secondary"
                ></Button>
              </StyleClass>
              <ul
                className="hidden topbar-menu active-topbar-menu p-3 w-15rem  z-5"
                style={{ bottom: "-5.8rem" }}
              >
                <span className="p-input-icon-left w-full">
                  <i className="pi pi-search"></i>
                  <InputText
                    type="text"
                    placeholder="Search"
                    className="w-full"
                  />
                </span>
              </ul>
            </li>
            <li className="topbar-item">
              <StyleClass
                nodeRef={imgRef}
                selector="@next"
                enterClassName="hidden"
                enterActiveClassName="px-scalein"
                leaveToClassName="hidden"
                leaveActiveClassName="px-fadeout"
                hideOnOutsideClick
              >
                <a ref={imgRef} className="p-ripple cursor-pointer">
                  <img className="border-round-xl" src={avatar} alt="Profile" />
                  <Ripple />
                </a>
              </StyleClass>
              <ul
                className="topbar-menu active-topbar-menu p-4 w-22rem z-5 hidden"
                style={{ bottom: "-9.8rem" }}
              >
                <li
                  className="mb-3 pb-3"
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div className="flex align-items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="flex align-items-center justify-content-center"
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "14px",
                        background: "#eef2ff",
                        color: "#4338ca",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className="pi pi-user"
                        style={{
                          fontSize: "1.4rem",
                        }}
                      />
                    </div>

                    {/* User Details */}
                    <div className="flex flex-column flex-1">
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        {user?.name || "User"}
                      </span>

                      <span
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {user?.email}
                      </span>

                      <div className="mt-2">
                        <span
                          style={{
                            background: "#eef2ff",
                            color: "#4338ca",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                            display: "inline-block",
                          }}
                        >
                          {user?.role?.toLowerCase() === "user"
                            ? "BUYER"
                            : user?.role?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
                <li
                  className="m-0"
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    marginTop: "0.5rem",
                    paddingTop: "0.75rem",
                  }}
                >
                  <div className="flex align-items-center justify-content-between">
                    <a
                      ref={logoutRef}
                      onClick={logoutHandler}
                      className="flex align-items-center hover:text-primary-500 transition-duration-200 cursor-pointer"
                    >
                      <i className="pi pi-fw pi-sign-out mr-2"></i>
                      <span>Logout</span>
                    </a>
                    <div className="flex align-items-center text-600">
                      <i
                        className="pi pi-envelope mr-2"
                        style={{
                          fontSize: "0.9rem",
                          alignSelf: "flex-start",
                          marginTop: "2px",
                        }}
                      />

                      <div className="flex flex-column">
                        <a
                          href="mailto:support@coact.co.in"
                          className="text-primary text-sm"
                          style={{
                            textDecoration: "none",
                            lineHeight: "1.2",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          support@coact.co.in
                        </a>

                        <span
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          Version: V2.0.3
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
            <li>
              <Button
                type="button"
                icon="pi pi-cog"
                text
                className=" p-button-secondary flex-shrink-0"
                onClick={onConfigButtonClick}
              ></Button>
            </li>
            <li>
              <Button
                type="button"
                icon="pi pi-arrow-left"
                text
                className=" p-button-secondary flex-shrink-0"
                onClick={showRightSidebar}
              ></Button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
});

TopBar.displayName = "TopBar";

export default TopBar;
