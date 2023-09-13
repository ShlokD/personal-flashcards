import { createContext, FunctionComponent } from "preact";
import { useContext, useState } from "preact/hooks";
import { StateUpdater } from "preact/compat";
type AppContextType = {
  selectedDeck?: string;
  setSelectedDeck?: StateUpdater<string>;
};

const AppContext = createContext<AppContextType>({});

export const useAppContext = () => useContext(AppContext);

const AppContextProvider: FunctionComponent<object> = ({ children }) => {
  const [selectedDeck, setSelectedDeck] = useState("");
  return (
    <AppContext.Provider value={{ selectedDeck, setSelectedDeck }}>
      {children}{" "}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
