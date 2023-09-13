export type DeckType = {
  deck_id: string;
  title: string;
  description?: string;
};

export type Card = {
  card_id: string;
  deck: string;
  front: string;
  back: string;
  correct?: boolean | null;
};

export type CurrentCard = {
  index: number;
  showFront: boolean;
  tries: number;
  correct: number;
};
