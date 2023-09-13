import { useState, useEffect } from "preact/hooks";
import { useDBContext } from "./db-context";
import { useAppContext } from "./app-context";
import { Link } from "preact-router/match";
import { ulid } from "ulid";
import { Card, CurrentCard, DeckType } from "./types";
import { TargetedEvent } from "preact/compat";

type AddCardFormProps = {
  submitCardForm: ({ front, back }: { front: string; back: string }) => void;
  resetCardForm: () => void;
  showCardForm: boolean;
};

const AddCardForm = ({
  submitCardForm,
  resetCardForm,
  showCardForm,
}: AddCardFormProps) => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const handleSubmit = (ev: TargetedEvent<HTMLFormElement, Event>) => {
    ev.preventDefault();
    submitCardForm({ front, back });
  };
  const handleReset = (ev: TargetedEvent<HTMLFormElement, Event>) => {
    ev.preventDefault();
    setFront("");
    setBack("");
    resetCardForm();
  };
  return (
    <form
      onSubmit={handleSubmit}
      onReset={handleReset}
      className={`p-4 ${showCardForm ? "flex flex-col" : "hidden"}`}
    >
      <label htmlFor="deck-title" className="my-2 font-bold">
        Front
      </label>
      <textarea
        className="p-2 border-2"
        id="card-front"
        required
        value={front}
        onChange={(ev) => setFront((ev?.target as HTMLTextAreaElement)?.value)}
        autoComplete="off"
      />

      <label htmlFor="deck-description" className="my-2 font-bold">
        Back
      </label>
      <textarea
        className="p-2 border-2"
        id="card-back"
        required
        value={back}
        onChange={(ev) => setBack((ev?.target as HTMLTextAreaElement)?.value)}
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

export function Deck() {
  const [deck, setDeck] = useState<DeckType>({
    deck_id: "",
    title: "",
    description: "",
  });
  const [cards, setCards] = useState<Card[]>([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [currentCard, setCurrentCard] = useState<CurrentCard>({
    index: 0,
    showFront: true,
    correct: 0,
    tries: 0,
  });
  const { db } = useDBContext();
  const { selectedDeck } = useAppContext();

  const loadData = async () => {
    try {
      const rawDeck = await db
        ?.table("decks")
        .filter((d) => d.deck_id === selectedDeck)
        .toArray();
      if (rawDeck && rawDeck.length > 0) {
        setDeck(rawDeck[0]);
      }
      const rawCards = await db
        ?.table("cards")
        .filter((c) => c.deck === selectedDeck)
        .toArray();
      if (rawCards) {
        const cards = rawCards.map((c) => ({
          ...c,
          correct: false,
          showFront: true,
        }));
        setCards(cards);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitCardForm = async ({
    front,
    back,
  }: {
    front: string;
    back: string;
  }) => {
    if (selectedDeck) {
      const id = ulid();
      const payload = {
        card_id: id,
        deck: selectedDeck,
        front,
        back,
      };
      setCards((prev) => [...prev, payload]);
      await db?.table("cards").put(payload);
    }
    setShowCardForm(false);
  };

  const resetCardForm = () => {
    setShowCardForm(false);
  };

  const flipCard = () => {
    setCurrentCard((prev) => ({ ...prev, showFront: !prev.showFront }));
  };

  const handleWrong = () => {
    const index = cards?.findIndex(
      (c, i) => !c.correct && i !== currentCard.index
    );
    if (index !== -1) {
      setCurrentCard((prev) => ({
        ...prev,
        index,
        showFront: true,
        tries: prev.tries + 1,
      }));
    } else {
      setCurrentCard((prev) => ({
        ...prev,
        showFront: true,
        tries: prev.tries + 1,
      }));
    }
  };

  const handleRight = () => {
    setCards((prev) => {
      const newCards = prev.slice();
      newCards[currentCard.index] = {
        ...newCards[currentCard.index],
        correct: true,
      };
      return newCards;
    });
    const index = cards.findIndex(
      (c, i) => !c.correct && i !== currentCard.index
    );
    setCurrentCard((prev) => ({
      ...prev,
      index,
      showFront: true,
      tries: prev.tries + 1,
      correct: prev.correct + 1,
    }));
  };

  const restart = () => {
    setCards((prev) => prev.map((p) => ({ ...p, correct: false })));
    setCurrentCard({ index: 0, showFront: true, correct: 0, tries: 0 });
  };

  if (!selectedDeck) {
    return (
      <main className="flex flex-col px-4 items-center justify-center min-h-screen w-full gap-2">
        <h1 className="text-4xl">No Deck Selected</h1>
        <Link className="text-2xl p-2 underline" href="/">
          Return Home
        </Link>
      </main>
    );
  }

  const current = cards?.[currentCard?.index];
  return (
    <div className="flex flex-col p-4 min-h-screen w-full ">
      <header className="flex">
        <Link href="/">
          <h1 className="text-4xl font-bold">Personal Flashcards</h1>
        </Link>{" "}
      </header>
      <main className="flex flex-col my-8 lg:w-2/3 self-center">
        <h2 className="text-2xl font-bold my-1">{deck?.title || "Deck"}</h2>
        <p className="text-lg mb-2">{deck?.description || ""}</p>
        <p className="text-lg mb-2">{cards?.length || 0} Cards</p>
        <div className="flex flex-col">
          <button
            className="bg-green-200 px-6 py-4 w-2/3 self-center rounded-lg font-bold text-lg my-2"
            onClick={() => setShowCardForm((prev) => !prev)}
          >
            {showCardForm ? "Close" : "Add Card"}
          </button>
          <AddCardForm
            showCardForm={showCardForm}
            submitCardForm={submitCardForm}
            resetCardForm={resetCardForm}
          />
          <hr className="w-full my-2 border-2 border-black" />
          {currentCard?.index === -1 && (
            <div className="flex flex-col self-center">
              <p className="py-2 text-xl font-bold">
                Total tries: {currentCard?.tries}
              </p>
              <p className="py-2 text-xl font-bold">
                Total correct: {currentCard?.correct}
              </p>
              <p className="py-2 text-xl font-bold">
                Success:{" "}
                {((currentCard?.correct / currentCard.tries) * 100).toFixed(2)}%
              </p>
              <button
                className="bg-green-200 px-6 py-4 rounded-lg font-bold text-lg my-2"
                onClick={restart}
              >
                Restart
              </button>
            </div>
          )}
          {current && (
            <button
              className="w-4/5 px-4 py-32 border-2 border-black rounded-2xl self-center my-4 text-3xl font-bold"
              onClick={flipCard}
            >
              {currentCard?.showFront ? current.front : current.back}
            </button>
          )}
          {!currentCard?.showFront && (
            <div className="flex">
              <button
                className="w-1/2 bg-red-400 p-4 text-xl text-white"
                onClick={handleWrong}
              >
                &#10006;
              </button>

              <button
                className="w-1/2 bg-green-400 p-4 text-xl text-white"
                onClick={handleRight}
              >
                &#10004;
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
