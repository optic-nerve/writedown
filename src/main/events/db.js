// const notes = require("../storage/note.db");
import { getNoteInfo, deleteNote, updateNote, getAllNotes, createNote } from "../storage/note.db";

export const notesEvents = (ipcMain) => {
  ipcMain.on("get-all-notes", async (event, message) => {
    console.log("GETTING ALL NOTES STORED IN DATABASE");
    var data = await getAllNotes();
    console.log(data);
    event.sender.send("all-notes", data)
  });

  ipcMain.on("get-one-note", async (event, id) => {
    event.sender.send("one-note", await getNoteInfo(id));
  });

  ipcMain.on("save-note", async (event, data) => {
    // console.log("WE WANT TO SAVE NOTE ", data);
    await updateNote(data['id'], data['note']);
    event.sender.send("success", "Note successfully saved in database.");
  });

  ipcMain.on("delete-note", async (event, noteId) => {
    await deleteNote(noteId);
    event.sender.send("success", "Note successfully deleted.");
  });
}

