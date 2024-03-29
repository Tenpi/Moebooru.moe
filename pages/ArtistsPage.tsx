import React, {useEffect, useContext, useState, useRef} from "react"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import functions from "../structures/Functions"
import DragAndDrop from "../components/DragAndDrop"
import search from "../assets/purple/search.png"
import searchMagenta from "../assets/magenta/search.png"
import searchPurpleLight from "../assets/purple-light/search.png"
import searchMagentaLight from "../assets/magenta-light/search.png"
import searchIconHover from "../assets/purple/search-hover.png"
import searchMagentaHover from "../assets/magenta/search-hover.png"
import searchMagentaLightHover from "../assets/magenta-light/search-hover.png"
import searchPurpleLightHover from "../assets/purple-light/search-hover.png"
import sort from "../assets/purple/sort.png"
import ArtistRow from "../components/ArtistRow"
import sortMagenta from "../assets/magenta/sort.png"
import axios from "axios"
import {ThemeContext, EnableDragContext, HideNavbarContext, HideSidebarContext, RelativeContext, MobileContext,
HideTitlebarContext, ActiveDropdownContext, HeaderTextContext, SidebarTextContext} from "../Context"
import "./styles/artistspage.less"

const ArtistsPage: React.FunctionComponent = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {relative, setRelative} = useContext(RelativeContext)
    const {activeDropdown, setActiveDropdown} = useContext(ActiveDropdownContext)
    const {headerText, setHeaderText} = useContext(HeaderTextContext)
    const {sidebarText, setSidebarText} = useContext(SidebarTextContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const [sortType, setSortType] = useState("posts")
    const [artists, setArtists] = useState([]) as any
    const [index, setIndex] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [visibleArtists, setVisibleArtists] = useState([]) as any
    const [offset, setOffset] = useState(0)
    const [ended, setEnded] = useState(false)
    const [getSearchIconHover, setSearchIconHover] = useState(false)
    const sortRef = useRef(null) as any

    const updateArtists = async () => {
        const result = await axios.get("/api/search/artists", {params: {sort: sortType, query: searchQuery}, withCredentials: true}).then((r) => r.data)
        setEnded(false)
        setIndex(0)
        setVisibleArtists([])
        setArtists(result)
    }

    useEffect(() => {
        setHideNavbar(true)
        setHideTitlebar(true)
        setHideSidebar(false)
        setRelative(false)
        setActiveDropdown("none")
        setHeaderText("")
        setSidebarText("")
        document.title = "Moebooru: Artists"
        setTimeout(() => {
            updateArtists()
        }, 200)
    }, [])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    useEffect(() => {
        updateArtists()
    }, [sortType])

    useEffect(() => {
        let currentIndex = index
        const newVisibleArtists = visibleArtists as any
        for (let i = 0; i < 10; i++) {
            if (!artists[currentIndex]) break
            newVisibleArtists.push(artists[currentIndex])
            currentIndex++
        }
        setIndex(currentIndex)
        setVisibleArtists(functions.removeDuplicates(newVisibleArtists))
    }, [artists])

    const updateOffset = async () => {
        if (ended) return
        const newOffset = offset + 10
        const result = await axios.get("/api/search/artists", {params: {sort: sortType, query: searchQuery, offset: newOffset}, withCredentials: true}).then((r) => r.data)
        if (result?.length >= 10) {
            setOffset(newOffset)
            setArtists((prev: any) => functions.removeDuplicates([...prev, ...result]))
        } else {
            if (result?.length) setArtists((prev: any) => functions.removeDuplicates([...prev, ...result]))
            setEnded(true)
        }
    }

    useEffect(() => {
        const scrollHandler = async () => {
            if (functions.scrolledToBottom()) {
                let currentIndex = index
                if (!artists[currentIndex]) return updateOffset()
                const newVisibleArtists = visibleArtists as any
                for (let i = 0; i < 10; i++) {
                    if (!artists[currentIndex]) return updateOffset()
                    newVisibleArtists.push(artists[currentIndex])
                    currentIndex++
                }
                setIndex(currentIndex)
                setVisibleArtists(functions.removeDuplicates(newVisibleArtists))
            }
        }
        window.addEventListener("scroll", scrollHandler)
        return () => {
            window.removeEventListener("scroll", scrollHandler)
        }
    })

    const getSearchIcon = () => {
        if (theme === "purple") return getSearchIconHover ? searchIconHover : search
        if (theme === "purple-light") return getSearchIconHover ? searchPurpleLightHover : searchPurpleLight
        if (theme === "magenta") return getSearchIconHover ? searchMagentaHover : searchMagenta
        if (theme === "magenta-light") return getSearchIconHover ? searchMagentaLightHover : searchMagentaLight
        return getSearchIconHover ? searchIconHover : search
    }

    const getSort = () => {
        if (theme.includes("magenta")) return sortMagenta
        return sort
    }

    const getSortMargin = () => {
        const rect = sortRef.current?.getBoundingClientRect()
        if (!rect) return "0px"
        const raw = window.innerWidth - rect.right
        let offset = 0
        if (sortType === "cuteness") offset = -40
        if (sortType === "reverse cuteness") offset = -10
        if (sortType === "posts") offset = -45
        if (sortType === "reverse posts") offset = -15
        if (sortType === "alphabetic") offset = -25
        if (sortType === "reverse alphabetic") offset = 0
        return `${raw + offset}px`
    }

    const getSortJSX = () => {
        return (
            <div className="artistsort-item" ref={sortRef} onClick={() => {setActiveDropdown(activeDropdown === "sort" ? "none" : "sort")}}>
                <img className="artistsort-img" src={getSort()}/>
                <span className="artistsort-text">{functions.toProperCase(sortType)}</span>
            </div>
        )
    }

    const generateArtistsJSX = () => {
        const jsx = [] as any
        const artists = functions.removeDuplicates(visibleArtists) as any
        for (let i = 0; i < artists.length; i++) {
            if (artists[i].tag === "unknown-artist") continue
            jsx.push(<ArtistRow artist={artists[i]}/>)
        }
        return jsx
    }

    return (
        <>
        <DragAndDrop/>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content" onMouseEnter={() => setEnableDrag(true)}>
                <div className="artists">
                    <span className="artists-heading">Artists</span>
                    <div className="artists-row">
                        <div className="artist-search-container" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                            <input className="artist-search" type="search" spellCheck="false" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? updateArtists() : null}/>
                            <img className="artist-search-icon" src={getSearchIcon()} onClick={updateArtists} onMouseEnter={() => setSearchIconHover(true)} onMouseLeave={() => setSearchIconHover(false)}/>
                        </div>
                        {getSortJSX()}
                        <div className={`artist-dropdown ${activeDropdown === "sort" ? "" : "hide-artist-dropdown"}`} 
                        style={{marginRight: getSortMargin(), top: mobile ? "229px" : "209px"}} onClick={() => setActiveDropdown("none")}>
                            <div className="artist-dropdown-row" onClick={() => setSortType("alphabetic")}>
                                <span className="artist-dropdown-text">Alphabetic</span>
                            </div>
                            <div className="artist-dropdown-row" onClick={() => setSortType("reverse alphabetic")}>
                                <span className="artist-dropdown-text">Reverse Alphabetic</span>
                            </div>
                            <div className="artist-dropdown-row" onClick={() => setSortType("posts")}>
                                <span className="artist-dropdown-text">Posts</span>
                            </div>
                            <div className="artist-dropdown-row" onClick={() => setSortType("reverse posts")}>
                                <span className="artist-dropdown-text">Reverse Posts</span>
                            </div>
                            <div className="artist-dropdown-row" onClick={() => setSortType("cuteness")}>
                                <span className="artist-dropdown-text">Cuteness</span>
                            </div>
                            <div className="artist-dropdown-row" onClick={() => setSortType("reverse cuteness")}>
                                <span className="artist-dropdown-text">Reverse Cuteness</span>
                            </div>
                        </div>
                    </div>
                    <table className="artists-container">
                        {generateArtistsJSX()}
                    </table>
                </div>
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default ArtistsPage