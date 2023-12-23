type MagicItem = {
  readonly consumption: string | number
};

export type AbstractOwnedEntry = {
  readonly name: string
  readonly magicItem: OwnedMagicItem
  readonly item: MagicItem
  readonly uses: number
};

export type OwnedMagicItem = {
  readonly name: string
  readonly uses: number
  readonly charges: number
  readonly ownedEntries: (AbstractOwnedEntry)[]
  readonly chargesOnWholeItem: boolean
};

type MagicItemsActor = {
  items: OwnedMagicItem[]
};

type MagicItems = {
  actor: (id: string) => MagicItemsActor | null | undefined
};

declare global {
  const MagicItems: MagicItems;
}

export {};
