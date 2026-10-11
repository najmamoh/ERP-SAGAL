// import React, { createContext, useContext, useState } from 'react';

// const StateContext = createContext();

const initialState = {
    chat: false,
    cart: false,
    userProfile: false,
    notification: false,
  };
  
  
  
  
  import React, { createContext, useContext, useState, ReactNode } from 'react';
  
  interface State {
    chat: boolean;
    cart: boolean;
    userProfile: boolean;
    notification: boolean;
  }
  
  interface StateContextValue {
    currentColor: string;
    currentMode: string;
    activeMenu: boolean;
    screenSize: number | undefined;
    setScreenSize: React.Dispatch<React.SetStateAction<number | undefined>>;
    handleClick: (clicked: keyof State) => void;
    isClicked: State;
    initialState: State;
    setIsClicked: React.Dispatch<React.SetStateAction<State>>;
    setActiveMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentColor: React.Dispatch<React.SetStateAction<string>>;
    setCurrentMode: React.Dispatch<React.SetStateAction<string>>;
    setMode: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setColor: (color: string) => void;
    themeSettings: boolean;
    setThemeSettings: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
  const StateContext = createContext<StateContextValue>({
    currentColor: '#03C9D7',
    currentMode: 'Light',
    activeMenu: true,
    screenSize: undefined,
    setScreenSize: () => {},
    handleClick: () => {},
    isClicked: {
      chat: false,
      cart: false,
      userProfile: false,
      notification: false,
    },
    initialState: {
      chat: false,
      cart: false,
      userProfile: false,
      notification: false,
    },
    setIsClicked: () => {},
    setActiveMenu: () => {},
    setCurrentColor: () => {},
    setCurrentMode: () => {},
    setMode: () => {},
    setColor: () => {},
    themeSettings: false,
    setThemeSettings: () => {},
  });
  
  export const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [screenSize, setScreenSize] = useState<number | undefined>(undefined);
    const [currentColor, setCurrentColor] = useState<string>('#03C9D7');
    const [currentMode, setCurrentMode] = useState<string>('Light');
    const [themeSettings, setThemeSettings] = useState<boolean>(false);
    const [activeMenu, setActiveMenu] = useState<boolean>(true);
    const [isClicked, setIsClicked] = useState<State>({
      chat: false,
      cart: false,
      userProfile: false,
      notification: false,
    });
  
  
    const setMode = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentMode(e.target.value);
      localStorage.setItem('themeMode', e.target.value);
      setThemeSettings(false)
    };
  
    const setColor = (color: string) => {
      setCurrentColor(color);
      localStorage.setItem('colorMode', color);
      setThemeSettings(false)
    };
  
    const handleClick = (clicked: keyof State) => setIsClicked({ ...initialState, [clicked]: true });
  
    return (
      <StateContext.Provider
        value={{
          currentColor: currentColor,
          currentMode: currentMode,
          activeMenu,
          screenSize,
          setScreenSize,
          handleClick,
          isClicked,
          initialState,
          setIsClicked,
          setActiveMenu,
          setCurrentColor,
          setCurrentMode: setCurrentColor,
          setMode,
          setColor,
          themeSettings,
          setThemeSettings,
        }}
      >
        {children}
      </StateContext.Provider>
    );
  };
  
  export const useStateContext = () => useContext(StateContext);
  