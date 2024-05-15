import React, { useEffect, useState } from "react";
import { formatDateFromMs } from "../utils/helpers";
import { allNotesAtom, editorViewOpenedAtom, openDoc, openedObjectAtom, selectedNoteAtom, activeDocInformations} from "../hooks/editor";
import { useAtom } from "jotai";
import { formatDateFromMs } from "../utils/helpers";
import "../assets/sidebar.css";

export default Content = ({id, title, lastEdit}) => {
    var date = formatDateFromMs(lastEdit);
    const [select, setSelected] = useAtom(selectedNoteAtom);
    const [open, setOpened] = useAtom(openDoc);
    const [rawActive, setRawActive] = useAtom(editorViewOpenedAtom);
    const [openedObject, setOpenedObject] = useAtom(openedObjectAtom);
    const [docInfo, setDocInfo] = useAtom(activeDocInformations);
    const [notes, setNotes] = useAtom(allNotesAtom);

    const [changeTitle, setChangeTitle] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newTitleinputStyle, setNewTitleInputStyle] = useState("1px solid red");

    useEffect(() => {
      if (newTitle !== "") {
        setNewTitleInputStyle("1px solid green");
      }else {
        setNewTitleInputStyle("1px solid red");
      }
    }, [newTitle]);

    function selectNote() {
      if (id !== select) {
        setOpened(null);
        setRawActive(false);
        setDocInfo(null);
        setSelected(id);
        let onEditing = window.electron.ipcRenderer.send("get-one-note", id);
        window.electron.ipcRenderer.on("one-note", async (event, data) => {
          setOpenedObject(await data);
          setOpened(data["content"]);
        });
      }
    }

    return (
      <li className={(id==select ? "active " : " ")+"content"} onClick={selectNote}>
        {
          changeTitle ?
            <input type="text" placeholder={title} autoFocus={true}
              className="change-title-input"
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key == "Enter"){
                    // change the name
                    console.log("Enter key down");
                    if (newTitle !== "") {
                      // Send event to main process for update
                      let data = {
                        id: id,
                        note: {
                          title: newTitle.trim()
                        }
                      }
                      window.electron.ipcRenderer.send("save-note", data);
                      window.electron.ipcRenderer.on("success", (event, data) => {
                        console.log("update successfull");
                        selectNote();
                        // Refresh notes
                        window.electron.ipcRenderer.send("get-all-notes");
                          window.electron.ipcRenderer.on("all-notes", (event, data) => {
                          setNotes(data);
                        });
                        setNewTitle("");
                      });
                      setChangeTitle(false);
                    }else {
                      alert("Le champs de est vide. Veuillez entrer un nom.");
                    }
                    // Hide input field
                  }else if (e.key == "Escape") {
                    console.log("Escape key down");
                    setChangeTitle(false);
                  }
                }
              }
              style={{ border: newTitleinputStyle }}
            /> :
            <div className="title" onDoubleClick={() => setChangeTitle(true)}>{title}</div>
        }

        <p>
          {date}
        </p>
      </li>
    );
}

