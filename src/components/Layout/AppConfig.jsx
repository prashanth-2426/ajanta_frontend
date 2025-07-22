import { useContext, useEffect } from "react";
import PrimeReact, { PrimeReactContext } from "primereact/api";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { RadioButton } from "primereact/radiobutton";
import { Sidebar } from "primereact/sidebar";
import { classNames } from "primereact/utils";
import { LayoutContext } from "../../store/layoutContext";

const AppConfig = (props) => {
  const {
    layoutConfig,
    setLayoutConfig,
    layoutState,
    setLayoutState,
    isSlim,
    isSlimPlus,
    isHorizontal,
  } = useContext(LayoutContext);
  const { setRipple, changeTheme } = useContext(PrimeReactContext);

  const scales = [12, 13, 14, 15, 16];
  const themes = [
    { name: "avocado", color: "#AEC523" },
    { name: "blue", color: "#5297FF" },
    { name: "purple", color: "#464DF2" },
    { name: "teal", color: "#14B8A6" },
    { name: "green", color: "#34B56F" },
    { name: "indigo", color: "#6366F1" },
    { name: "orange", color: "#FF810E" },
    { name: "red", color: "#FF9B7B" },
    { name: "turquoise", color: "#58AED3" },
    { name: "yellow", color: "#FFB340" },
  ];

  useEffect(() => {
    if (isSlim() || isSlimPlus() || isHorizontal()) {
      setLayoutState((prevState) => ({ ...prevState, resetMenu: true }));
    }
  }, [layoutConfig.menuMode]);

  const onInlineMenuPositionChange = (e) => {
    setLayoutConfig((prevState) => ({
      ...prevState,
      menuProfilePosition: e.value,
    }));
  };
  const onConfigButtonClick = () => {
    setLayoutState((prevState) => ({
      ...prevState,
      configSidebarVisible: true,
    }));
  };

  const onConfigSidebarHide = () => {
    setLayoutState((prevState) => ({
      ...prevState,
      configSidebarVisible: false,
    }));
  };

  const changeInputStyle = (e) => {
    setLayoutConfig((prevState) => ({ ...prevState, inputStyle: e.value }));
  };

  const changeRipple = (e) => {
    setRipple?.(e.value);
    setLayoutConfig((prevState) => ({
      ...prevState,
      ripple: e.value,
    }));
  };

  const changeMenuMode = (e) => {
    setLayoutConfig((prevState) => ({ ...prevState, menuMode: e.value }));
  };

  const onChangeMenuTheme = (name) => {
    setLayoutConfig((prevState) => ({ ...prevState, menuTheme: name }));
  };

  const changeColorScheme = (colorScheme) => {
    changeTheme?.(layoutConfig.colorScheme, colorScheme, "theme-link", () => {
      setLayoutConfig((prevState) => ({
        ...prevState,
        colorScheme,
        menuTheme: colorScheme === "dark" ? "dark" : "light",
      }));
    });
  };

  const _changeTheme = (theme) => {
    changeTheme?.(layoutConfig.theme, theme, "theme-link", () => {
      setLayoutConfig((prevState) => ({ ...prevState, theme }));
    });
  };
  const onTopbarChangeTheme = (name) => {
    setLayoutConfig((prevState) => ({ ...prevState, topbarTheme: name }));

    if (isHorizontal()) {
      setLayoutConfig((prevState) => ({ ...prevState, menuTheme: name }));
      if (name === "transparent") {
        setLayoutConfig((prevState) => ({ ...prevState, menuTheme: "light" }));
      }
    }
  };

  const decrementScale = () => {
    setLayoutConfig((prevState) => ({
      ...prevState,
      scale: prevState.scale - 1,
    }));
  };

  const incrementScale = () => {
    setLayoutConfig((prevState) => ({
      ...prevState,
      scale: prevState.scale + 1,
    }));
  };

  const applyScale = () => {
    document.documentElement.style.fontSize = layoutConfig.scale + "px";
  };

  useEffect(() => {
    applyScale();
    // changeColorScheme("dark");
  }, [layoutConfig.scale]);

  return (
    <>
      {/* <button
        className="layout-config-button config-link"
        type="button"
        onClick={onConfigButtonClick}
      >
        <i className="pi pi-cog"></i>
      </button> */}
      <Sidebar
        visible={layoutState.configSidebarVisible}
        onHide={onConfigSidebarHide}
        position="right"
        className="layout-config-sidebar w-18rem"
      >
        <div className="px-2">
          <h5>Color Scheme</h5>
          <div className="flex">
            <div className="field-radiobutton flex-auto">
              <RadioButton
                name="colorScheme"
                value="light"
                checked={layoutConfig.colorScheme === "light"}
                onChange={(e) => changeColorScheme(e.value)}
              ></RadioButton>
              <label htmlFor="theme3">Light</label>
            </div>

            <div className="field-radiobutton flex-auto">
              <RadioButton
                name="colorScheme"
                value="dark"
                checked={layoutConfig.colorScheme === "dark"}
                onChange={(e) => changeColorScheme(e.value)}
              ></RadioButton>
              <label htmlFor="theme1">Dark</label>
            </div>
          </div>

          <h5>Themes</h5>
          <div className="flex flex-wrap row-gap-3">
            {themes.map((t, i) => {
              return (
                <div key={i} className="w-3">
                  <button
                    autoFocus={layoutConfig.theme === t.name}
                    className='"cursor-pointer p-link w-2rem h-2rem border-circle flex-shrink-0 flex align-items-center justify-content-center'
                    onClick={() => _changeTheme(t.name)}
                    style={{ backgroundColor: t.color }}
                  ></button>
                </div>
              );
            })}
          </div>

          <h5>Theme Scale</h5>
          <div className="flex align-items-center">
            <Button
              icon="pi pi-minus"
              type="button"
              onClick={decrementScale}
              className="w-2rem h-2rem mr-2"
              rounded
              text
              disabled={layoutConfig.scale === scales[0]}
            ></Button>
            <div className="flex gap-2 align-items-center">
              {scales.map((s, i) => {
                return (
                  <i
                    key={i}
                    className={classNames("pi pi-circle-fill text-300", {
                      "text-primary-500": s === layoutConfig.scale,
                    })}
                  ></i>
                );
              })}
            </div>
            <Button
              icon="pi pi-plus"
              type="button"
              onClick={incrementScale}
              className="w-2rem h-2rem ml-2"
              rounded
              text
              disabled={layoutConfig.scale === scales[scales.length - 1]}
            ></Button>
          </div>

          {!props.minimal && (
            <>
              <h5>Menu Type</h5>
              <div className="flex flex-wrap row-gap-3">
                <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="menuMode"
                    value="static"
                    checked={layoutConfig.menuMode === "static"}
                    inputId="mode1"
                    onChange={(e) => changeMenuMode(e)}
                  ></RadioButton>
                  <label htmlFor="mode1">Static</label>
                </div>
                {/* <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="menuMode"
                    value="overlay"
                    checked={layoutConfig.menuMode === "overlay"}
                    inputId="mode2"
                    onChange={(e) => changeMenuMode(e)}
                  ></RadioButton>
                  <label htmlFor="mode2">Overlay</label>
                </div> */}
                <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="menuMode"
                    value="slim"
                    checked={layoutConfig.menuMode === "slim"}
                    inputId="mode3"
                    onChange={(e) => changeMenuMode(e)}
                  ></RadioButton>
                  <label htmlFor="mode3">Slim</label>
                </div>
                {/* <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="menuMode"
                    value="compact"
                    checked={layoutConfig.menuMode === "slim-plus"}
                    inputId="mode4"
                    onChange={(e) => changeMenuMode(e)}
                  ></RadioButton>
                  <label htmlFor="mode4">Slim+</label>
                </div> */}
                <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="menuMode"
                    value="drawer"
                    checked={layoutConfig.menuMode === "drawer"}
                    inputId="mode6"
                    onChange={(e) => changeMenuMode(e)}
                  ></RadioButton>
                  <label htmlFor="mode6">Drawer</label>
                </div>
                <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="menuMode"
                    value="reveal"
                    checked={layoutConfig.menuMode === "reveal"}
                    inputId="mode5"
                    onChange={(e) => changeMenuMode(e)}
                  ></RadioButton>
                  <label htmlFor="mode5">Reveal</label>
                </div>
                <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="menuMode"
                    value="horizontal"
                    checked={layoutConfig.menuMode === "horizontal"}
                    inputId="mode4"
                    onChange={(e) => changeMenuMode(e)}
                  ></RadioButton>
                  <label htmlFor="mode4">Horizontal</label>
                </div>
              </div>
              <h5>Menu Theme</h5>
              <div className="flex flex-wrap row-gap-3">
                <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="menuTheme"
                    value="light"
                    checked={layoutConfig.menuTheme === "light"}
                    onChange={(e) => onChangeMenuTheme(e.value)}
                    disabled={
                      layoutConfig.colorScheme === "dark" || isHorizontal()
                    }
                    inputId="menutheme-light"
                  ></RadioButton>
                  <label htmlFor="menutheme-light">Light</label>
                </div>
                <div className="flex align-items-center gap-2 w-6 pl-2">
                  <RadioButton
                    name="menuTheme"
                    value="dark"
                    checked={layoutConfig.menuTheme === "dark"}
                    onChange={(e) => onChangeMenuTheme(e.value)}
                    disabled={
                      layoutConfig.colorScheme == "dark" || isHorizontal()
                    }
                    inputId="menutheme-dark"
                  ></RadioButton>
                  <label htmlFor="menutheme-dark">Dark</label>
                </div>
              </div>

              <h5>Topbar Theme</h5>
              <div className="flex flex-wrap row-gap-3">
                <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="topbarTheme"
                    value="light"
                    checked={layoutConfig.topbarTheme === "light"}
                    onChange={(e) => onTopbarChangeTheme(e.value)}
                    disabled={layoutConfig.colorScheme === "dark"}
                    inputId="topbartheme-light"
                  ></RadioButton>
                  <label htmlFor="topbartheme-light">Light</label>
                </div>
                <div className="flex align-items-center gap-2 w-6 pl-2">
                  <RadioButton
                    name="topbarTheme"
                    value="dark"
                    disabled={layoutConfig.colorScheme === "dark"}
                    checked={layoutConfig.topbarTheme === "dark"}
                    onChange={(e) => onTopbarChangeTheme(e.value)}
                    inputId="topbartheme-dark"
                  ></RadioButton>
                  <label htmlFor="topbartheme-dark">Dark</label>
                </div>
                <div className="flex align-items-center gap-2 w-6">
                  <RadioButton
                    name="topbarTheme"
                    value="transparent"
                    disabled={layoutConfig.colorScheme === "dark"}
                    checked={layoutConfig.topbarTheme === "transparent"}
                    onChange={(e) => onTopbarChangeTheme(e.value)}
                    inputId="topbartheme-transparent"
                  ></RadioButton>
                  <label htmlFor="topbartheme-transparent">Transparent</label>
                </div>
              </div>
              <h5>Input Style</h5>
              <div className="flex">
                <div className="field-radiobutton flex-1">
                  <RadioButton
                    inputId="input_outlined"
                    name="inputstyle"
                    value="outlined"
                    checked={layoutConfig.inputStyle === "outlined"}
                    onChange={(e) => changeInputStyle(e)}
                  />
                  <label htmlFor="input_outlined">Outlined</label>
                </div>
                <div className="field-radiobutton flex-1">
                  <RadioButton
                    inputId="input_filled"
                    name="inputstyle"
                    value="filled"
                    checked={layoutConfig.inputStyle === "filled"}
                    onChange={(e) => changeInputStyle(e)}
                  />
                  <label htmlFor="input_filled">Filled</label>
                </div>
              </div>
              {/* <h5>Ripple Effect</h5>
              <InputSwitch
                checked={layoutConfig.ripple}
                onChange={(e) => changeRipple(e)}
              /> */}
            </>
          )}
        </div>
      </Sidebar>
    </>
  );
};

export default AppConfig;
