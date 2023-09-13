import Dexie from "dexie";
import { createContext, FunctionComponent } from "preact";
import { useContext } from "preact/hooks";

type DBContextType = {
  db?: Dexie | null;
};

const DBContext = createContext<DBContextType>({
  db: null,
});
const db = new Dexie("flashcards-db");

db.version(1).stores({
  decks: "deck_id",
  cards: "card_id,deck",
});

export const useDBContext = () => useContext(DBContext);

const DBContextProvider: FunctionComponent<object> = ({ children }) => (
  <DBContext.Provider value={{ db }}>{children} </DBContext.Provider>
);

export default DBContextProvider;
