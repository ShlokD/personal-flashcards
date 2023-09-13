import { useState, useEffect } from "preact/hooks";
import { useDBContext } from "./db-context";
import { useAppContext } from "./app-context";
import { Link } from "preact-router/match";
import { ulid } from "ulid";
import { route } from "preact-router";
import { Card, DeckType } from "./types";
import { TargetedEvent } from "preact/compat";

type AddCardFormProps = {
  submitDeckForm: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => void;
  resetDeckForm: () => void;
  showDeckForm: boolean;
};

const AddDeckForm = ({
  submitDeckForm,
  resetDeckForm,
  showDeckForm,
}: AddCardFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (ev: TargetedEvent<HTMLFormElement, Event>) => {
    ev.preventDefault();
    submitDeckForm({ title, description });
  };
  const handleReset = (ev: TargetedEvent<HTMLFormElement, Event>) => {
    ev.preventDefault();
    setTitle("");
    setDescription("");
    resetDeckForm();
  };
  return (
    <form
      onSubmit={handleSubmit}
      onReset={handleReset}
      className={`p-4 ${showDeckForm ? "flex flex-col" : "hidden"}`}
    >
      <label htmlFor="deck-title" className="my-2 font-bold">
        Title
      </label>
      <input
        className="p-2 border-2"
        id="deck-title"
        required
        maxLength={50}
        value={title}
        onChange={(ev) => setTitle((ev?.target as HTMLInputElement)?.value)}
        autoComplete="off"
      />

      <label htmlFor="deck-description" className="my-2 font-bold">
        Description (optional)
      </label>
      <textarea
        className="p-2 border-2"
        id="deck-description"
        value={description}
        onChange={(ev) =>
          setDescription((ev?.target as HTMLTextAreaElement)?.value)
        }
      />
      <div className="flex gap-4 my-2 self-center">
        <button
          className="bg-green-200 px-4 py-2 self-center rounded-lg font-bold text-lg"
          type="submit"
        >
          Add
        </button>
        <button
          className="bg-gray-200 px-4 py-2 self-center rounded-lg font-bold text-lg"
          type="reset"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export function App() {
  const [decks, setDecks] = useState<DeckType[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [showDeckForm, setShowDeckForm] = useState(false);

  const { db } = useDBContext();
  const { setSelectedDeck } = useAppContext();

  const submitDeckForm = async ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => {
    const id = ulid();
    const payload = {
      deck_id: id,
      title,
      description,
    };
    setDecks((prev) => [...prev, payload]);
    await db?.table("decks").put(payload);
    setShowDeckForm(false);
  };

  const resetDeckForm = () => {
    setShowDeckForm(false);
  };

  const loadData = async () => {
    try {
      const rawDecks = await db?.table("decks").toArray();
      const rawCards = await db?.table("cards").toArray();
      if (rawDecks) {
        setDecks(rawDecks);
      }
      if (rawCards) {
        setCards(rawCards);
      }
    } catch (e) {
      return;
    }
  };

  const redirectToDeck = (id: string) => {
    setSelectedDeck?.(id);
    route("/deck");
  };

  useEffect(() => {
    loadData();
  }, []);
  return (
    <div className="flex flex-col p-4">
      <header className="flex">
        <Link href="/">
          <h1 className="text-4xl font-bold">Personal Flashcards</h1>
        </Link>
      </header>
      <main className="flex flex-col">
        <h2 className="text-2xl font-bold my-4">Dashboard</h2>
        <div className="my-2 flex items-center gap-4 my-4 justify-center">
          <p className="p-4 bg-green-200 rounded-lg text-lg text-gray-700">
            {decks?.length || 0} Decks
          </p>
          <p className="p-4 bg-blue-200 rounded-lg text-lg text-gray-700">
            {cards?.length || 0} Cards
          </p>
        </div>
        <div className="flex flex-col">
          <button
            className="bg-green-200 px-6 py-4 w-2/3 self-center rounded-lg font-bold text-lg my-2"
            onClick={() => setShowDeckForm((prev) => !prev)}
          >
            {showDeckForm ? "Close" : "Add Deck"}
          </button>
          <AddDeckForm
            showDeckForm={showDeckForm}
            submitDeckForm={submitDeckForm}
            resetDeckForm={resetDeckForm}
          />

          {decks.length === 0 && (
            <p className="font-bold text-xl p-2 text-center my-2">
              No decks added yet. Click the button to get started{" "}
            </p>
          )}
          <hr className="border-black py-2" />
          <div className="flex flex-col lg:flex-row gap-2 items-center w-2/3 flex-wrap">
            {decks.map((deck, i) => (
              <button
                key={`deck-${i}`}
                className="px-4 py-12 lg:px-12 lg:py-10 border-2 border-black rounded-lg text-2xl font-bold"
                onClick={() => redirectToDeck(deck.deck_id)}
              >
                {deck.title}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
