import { atom } from "jotai";

export const selectedNoteAtom = atom(null);
export const allNotes = [];
export const allNotesAtom = atom(allNotes);
export let openDoc = atom(null);
export let openedObjectAtom = atom({});
export const editorViewOpenedAtom = atom(false);

