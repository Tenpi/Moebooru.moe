import React, {useEffect, useContext, useState} from "react"
import {HashLink as Link} from "react-router-hash-link"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import DragAndDrop from "../components/DragAndDrop"
import {HideNavbarContext, HideSidebarContext, ThemeContext, EnableDragContext, RelativeContext, HideTitlebarContext} from "../Context"
import "./styles/changeusernamepage.less"

const ChangeUsernamePage: React.FunctionComponent = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {relative, setRelative} = useContext(RelativeContext)
    const [clicked, setClicked] = useState(false)

    useEffect(() => {
        setHideNavbar(false)
        setHideTitlebar(false)
        setHideSidebar(false)
        setRelative(false)
        document.title = "Moebooru: Change Username"
    }, [])

    return (
        <>
        <DragAndDrop/>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content">
                <div className="change-username" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                    <span className="change-username-title">Change Username</span>
                    {clicked ?
                    <>
                    <span className="change-username-link">Your username has been changed.</span>
                    <div className="change-username-button-container-left">
                        <button className="change-username-button" onClick={() => setClicked(false)}>←Back</button>
                    </div>
                    </> : <>
                    <span className="change-username-link">You can change your username once per week. Your old username 
                    will become available after the change.</span>
                    <div className="change-username-row">
                        <span className="change-username-text">Username: </span>
                        <span className="change-username-text-small">Tenpi</span>
                    </div>
                    <div className="change-username-row">
                        <span className="change-username-text">New Username: </span>
                        <input className="change-username-input" type="text" spellCheck={false}/>
                    </div>
                    <div className="change-username-button-container">
                        <button className="change-username-button" onClick={() => setClicked(true)}>Change Username</button>
                    </div>
                    </>
                    }
                </div>
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default ChangeUsernamePage