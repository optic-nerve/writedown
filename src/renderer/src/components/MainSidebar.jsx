import { FaAngleRight, FaBookmark, FaBookAtlas, FaPlus, FaCube, FaCubes } from "react-icons/fa6";
import {RiAddCircleLine, RiBallPenFill, RiBookMarkedLine, RiDeleteBin5Line, RiDeleteBinLine, RiHashtag, RiPriceTag3Line, RiPushpinLine} from "react-icons/ri"
import "../assets/main-sidebar.css";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import { useAtom } from "jotai";
import { allNoteBooksAtom, allNotebooksNotesAtom, allTagsAtom, pinnedNoteAtom, reloadAtom, selectedNotebookAtom, sidebarOpenAtom, sidebarTitleAtom, trashedNotesAtom } from "../hooks/global";
import { allNotesAtom, selectedNoteAtom } from "../hooks/editor";
import { NewTag } from "./Newtag";

export default function MainSidebar () {
  const [notebookListOpen, setNotebookListOpen] = useState(true);
  const [selectedNotebook, setSelectedNotebook] = useAtom(selectedNotebookAtom);
  const [newNotebookName, setNewnotebookName] = useState("");

  // Menu active state
  const [activeSubmenu, setActiveSubmenu] = useState("all-notes");

  const [tagListOpen, setTagListOpen] = useState(true);


  // Modal states
  const [notebookModalOpen, setNotebookModalOpen] = useState(false);
  const [modalAdditionalInfo, setModalAdditionalInfo] = useState("");

  // Atoms
  const [notebooksAtom, setNotebooksAtom] = useAtom(allNoteBooksAtom);
  const [tags, setTags] = useAtom(allTagsAtom);
  const [allNotesbookNotes] = useAtom(allNotebooksNotesAtom);
  const [pinned, setPinned] = useAtom(pinnedNoteAtom);
  const [notes, setNotes] = useAtom(allNotesAtom);
  const [trashedNotes, setTrashedNotes] = useAtom(trashedNotesAtom);
  const [sidebarTitle, setSidebarTitle] = useAtom(sidebarTitleAtom);
  const [selectedNote] = useAtom(selectedNoteAtom);
  const [reload] = useAtom(reloadAtom);
  const [newTagPopupMenuOpen, setNewtagPopupMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  useEffect(() => {
    console.log("Main Sidebar Refresh");
  }, [notebooksAtom, notes, pinned, trashedNotes, tags, selectedNote, reload])

  const notebookCreation = () => {
    console.log("Notebook creation button hit");
    if (newNotebookName !== "" && newNotebookName !== null) {
        let data = {
          name: newNotebookName.trim(),
          description: "",
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        window.electron.ipcRenderer.send("new-notebook", data);
        window.electron.ipcRenderer.on("success", async (event, data) => {
          // console.log(data);
          window.electron.ipcRenderer.send("all-notebooks");
          setNotebookModalOpen(false);
          setNewnotebookName("");
        });
      // Refresh notes
    }else {
      setModalAdditionalInfo("Le champs est vide !");
    }
  }
  const handleNotebookNamechange = (e) => {
    setNewnotebookName(e.target.value);
    setModalAdditionalInfo("");
  }

  const getNotebookNotes = (id) => {
    setSelectedNotebook(id);
    window.electron.ipcRenderer.send("notebook-notes", id);
    window.electron.ipcRenderer.on("notebook-notes-success", (event, data) => {
      console.log(`Notebook ${id} notes : `, data);
      setNotes(data);
    });
  }

  const allInTrash = () => {
    window.electron.ipcRenderer.send("all-in-trash", null);
    window.electron.ipcRenderer.on("all-in-trash", (event, data) => {
      console.log(`Trash notes : `, data);
      setNotes(data);
      setTrashedNotes(data);
    });
  }

  return (
<div className="main-sidebar">
  <div className={"main-sidebar-section all-notes "}>
    <div
      className={"head " + (activeSubmenu=='all-notes' ? "active " : "")}
      onDoubleClick={() => {
        setSelectedNotebook(null);
        setSidebarTitle("All notes");
        setActiveSubmenu("all-notes");
        setSidebarOpen(true);
        window.electron.ipcRenderer.send("get-all-notes");
        window.electron.ipcRenderer.on("all-notes", (event, data) => {
          setNotes(data);
        });
      }

      }>
      <div className="leading">
        <RiHashtag size={20} color="white"/>
        <span className="title">Your notes</span>
      </div>
      <span className="counter">{allNotesbookNotes.length}</span>
      <FaAngleRight color="white" className="right-angle-icon" />
    </div>
  </div>
  <div className="main-sidebar-section pin">
    <div className={"head"+ (activeSubmenu=='pinned' ? " active" : "")}
      onDoubleClick={() => {
        setSidebarOpen(true);
        setSelectedNotebook(null);
        setSidebarTitle("Pinned notes");
        setActiveSubmenu("pinned");
        window.electron.ipcRenderer.send("pinned-notes", null);
        window.electron.ipcRenderer.on("pinned-notes-success", (event, data) => {
          setNotes(data);
        });
    }}>
      <div className="leading">
        <RiPushpinLine size={20} color="white"/>
        <span className="title">Pinned</span>
      </div>
      <span className="counter">{pinned.length}</span>
    </div>
    <div className="content">

    </div>
  </div>


  <div className="main-sidebar-section notebooks">
    <div className={"head"+ (activeSubmenu=='notebooks' ? " active" : "")}
      onDoubleClick={() => {
        setNotebookListOpen(!notebookListOpen);
        setActiveSubmenu("notebooks");} }>
      <div className="leading">
        <RiBookMarkedLine size={20} color="white"/>
        <span className="title"> Notebooks</span>
      </div>
      <RiAddCircleLine size={20} onClick={() =>setNotebookModalOpen(true)}/>
    </div>
    <div className={"content"+(notebookListOpen ? " open": "")}>
      <ul className="notebook-list">
        {
          notebooksAtom != null ?
            notebooksAtom.map(element => {
              return (
                    <li key={element.id}
                      className={"notebook " + (selectedNotebook == element.id ? "active" : "")}
                      onClick={() =>{
                        setSidebarOpen(true);
                        setActiveSubmenu("notebooks");
                        setSidebarTitle(element.name)
                        getNotebookNotes(element.id)
                        setSelectedNotebook(element.id);
                      }
                      }
                    >
                      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <FaCube size={12}/>
                        <span className="notebook-name">{element.name}</span>
                      </div>
                      <span className="counter">{element.notes_count}</span>
                    </li>

              );
            }) : <div style={{ fontSize: "0.7rem" }}>Empty</div>
        }
      </ul>
    </div>
  </div>

  <div className="main-sidebar-section trash">
    <div
      className={"head"+ (activeSubmenu=='trash' ? " active" : "")}
      onDoubleClick={() => {
        setSidebarOpen(true);
        setSelectedNotebook(null);
        allInTrash();
        setActiveSubmenu("trash");
        setSidebarTitle("Trash")}}>
      <div className="leading">
        <RiDeleteBinLine size={20} color="white"/>
        <span className="title">Trash</span>
      </div>
      <span className="counter">{trashedNotes.length}</span>
    </div>
    <div className="content">

    </div>
  </div>
  <div className="main-sidebar-section tags">
    <div className="head" onClick={() => setTagListOpen(!tagListOpen)}>
      <div className="leading">
        <RiPriceTag3Line size={20} color="white"/>
        <span className="title">Tags</span>
      </div>
      <span className="counter">{tags ? tags.length : null}</span>
    </div>
    <div className={ "content" + (tagListOpen ?" open": "")}>
      <ul>
        {
          tags != null ?
            tags.map(element => {
              return(
                <li key={element.id}>
                  <div className="color" style={{ backgroundColor: element.color }}>
                  </div>{element.name}
                </li>)
            }): <div style={{ fontSize: "0.7rem" }}>No tags</div>
        }
      </ul>
      <button className="add-tag-btn" onClick={() => setNewtagPopupMenuOpen(!newTagPopupMenuOpen)}>
        <span className="btn-name">Add</span>
        <span className="btn-icon"><FaPlus /></span>
      </button>
      {
        newTagPopupMenuOpen ?
          <Modal
            openModal={newTagPopupMenuOpen}
            closeModal={() => setNewtagPopupMenuOpen(false)}
            action="Create"
            title="Create new tag"
            type="success"
            actionCallback={()=>console.log("OKay")}
            withActionBar={false}
          >
            <NewTag
              // close={() => setNewtagPopupMenuOpen(!newTagPopupMenuOpen)}
        />
          </Modal>
           :
          null
      }
    </div>
  </div>


      {
        notebookModalOpen ?
          <Modal
            openModal={notebookModalOpen}
            closeModal={() => setNotebookModalOpen(false)}
            action="Create"
            title="Notebook creation"
            type="success"
            actionCallback={notebookCreation}
          >
          <div style={{ display: "flex", alignItems:"center", justifyContent: "center", gap: "1rem", padding: "10px" }}>
          <input
            type="text"
            style={{
              backgroundColor:"transparent",
              color: "white",
              border: "1px solid #3b3b3b",
              width: "200px",
              height: "1.5rem",
              paddingLeft:"5px",
              fontSize: "1.0rem"
              }}
            placeholder="Notebook name"
            onChange={handleNotebookNamechange}/>
            <div className="over-infos" style={{ color: "red" }}>
              {modalAdditionalInfo}
            </div>
          </div>
          </Modal> :
          null
      }
</div>

    // Modals

  );
}
