import { InputText } from "primereact/inputtext";
import { forwardRef, useContext, useImperativeHandle, useRef } from "react";
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
              <ul className="topbar-menu active-topbar-menu p-4 w-15rem z-5 hidden">
                <li role="menuitem" className="m-0" onClick={logoutHandler}>
                  <StyleClass
                    nodeRef={logoutRef}
                    selector="@grandparent"
                    enterClassName="hidden"
                    enterActiveClassName="px-scalein"
                    leaveToClassName="hidden"
                    leaveActiveClassName="px-fadeout"
                    hideOnOutsideClick
                  >
                    <a
                      ref={logoutRef}
                      className="flex align-items-center hover:text-primary-500 transition-duration-200 cursor-pointer"
                    >
                      <i className="pi pi-fw pi-sign-out mr-2"></i>
                      <span>Logout</span>
                    </a>
                  </StyleClass>
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
