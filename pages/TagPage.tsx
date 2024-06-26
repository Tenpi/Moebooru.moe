import React, {useEffect, useContext, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import functions from "../structures/Functions"
import DragAndDrop from "../components/DragAndDrop"
import axios from "axios"
import permissions from "../structures/Permissions"
import {ThemeContext, EnableDragContext, HideNavbarContext, HideSidebarContext, RelativeContext, HideTitlebarContext, MobileContext,
ActiveDropdownContext, HeaderTextContext, SidebarTextContext, SessionContext, SearchContext, SearchFlagContext} from "../Context"
import website from "../assets/icons/support.png"
import fandom from "../assets/icons/fandom.png"
import pixiv from "../assets/icons/pixiv.png"
import twitter from "../assets/icons/twitter.png"
import Carousel from "../components/Carousel"
import "./styles/tagpage.less"


interface Props {
    match?: any
}

const TagPage: React.FunctionComponent<Props> = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {relative, setRelative} = useContext(RelativeContext)
    const {activeDropdown, setActiveDropdown} = useContext(ActiveDropdownContext)
    const {headerText, setHeaderText} = useContext(HeaderTextContext)
    const {sidebarText, setSidebarText} = useContext(SidebarTextContext)
    const {session, setSession} = useContext(SessionContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const {search, setSearch} = useContext(SearchContext)
    const {searchFlag, setSearchFlag} = useContext(SearchFlagContext)
    const [tag, setTag] = useState(null) as any
    const [posts, setPosts] = useState([]) as any
    const [postImages, setPostImages] = useState([]) as any
    const [appendImages, setAppendImages] = useState([]) as any
    const [postIndex, setPostIndex] = useState(0)
    const [relatedTags, setRelatedTags] = useState([]) as any
    const [count, setCount] = useState(0)
    const history = useHistory()
    const tagName = props?.match.params.tag

    const tagInfo = async () => {
        const tag = await axios.get("/api/tag", {params: {tag: tagName}}).then((r) => r.data)
        if (!tag) return history.push("/404")
        const tagCount = await axios.get("/api/tag/counts", {params: {tags: [tagName]}}).then((r) => Number(r.data?.[0]?.count || 0))
        setTag(tag)
        setCount(tagCount)
    }

    const updateRelatedTags = async () => {
        const related = await axios.get("/api/tag/related", {params: {tag: tagName}}).then((r) => r.data)
        setRelatedTags(related)
    }

    const updatePosts = async () => {
        let uploads = await axios.get("/api/search/posts", {params: {query: tagName, type: "all", restrict: "all", style: "all", sort: "date"}, withCredentials: true}).then((r) => r.data)
        const filtered = uploads.filter((u: any) => u.post?.restrict !== "explicit")
        const images = filtered.map((p: any) => functions.getThumbnailLink(p.images[0].type, p.postID, p.images[0].order, p.images[0].filename, "large"))
        setPosts(filtered)
        setPostImages(images)
    }

    const updateOffset = async () => {
        let uploads = posts
        let offset = posts.length
        const result = await axios.get("/api/search/posts", {params: {query: tag.tag, type: "all", restrict: "all", style: "all", sort: "date", offset}, withCredentials: true}).then((r) => r.data)
        uploads.push(...result)
        const filtered = uploads.filter((u: any) => u.post?.restrict !== "explicit")
        const images = filtered.map((p: any) => functions.getThumbnailLink(p.images[0].type, p.postID, p.images[0].order, p.images[0].filename, "large"))
        setPosts(filtered)
        setAppendImages(images)
    }

    useEffect(() => {
        tagInfo()
        updateRelatedTags()
        updatePosts()
    }, [tagName])

    useEffect(() => {
        setHideNavbar(true)
        setHideTitlebar(true)
        setHideSidebar(false)
        setRelative(false)
        setActiveDropdown("none")
        setHeaderText("")
        setSidebarText("")
        document.title = `Moebooru: ${functions.toProperCase(tagName.replaceAll("-", " "))}`
    }, [])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    const set = (img: string, index: number, newTab: boolean) => {
        setPostIndex(index)
        const postID = posts[index].postID
        if (newTab) {
            window.open(`/post/${postID}`, "_blank")
        } else {
            history.push(`/post/${postID}`)
        }
    }

    const searchTag = (event: React.MouseEvent, alias?: string) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open("/posts", "_blank")
        } else {
            history.push("/posts")
        }
        setSearch(alias ? alias : tag.tag)
        setSearchFlag(true)
    }

    const tagSocialJSX = () => {
        let jsx = [] as any
        if (tag.type === "artist") {
            if (tag.website) {
                jsx.push(<img className="tag-social" src={website} onClick={() => window.open(tag.website, "_blank")}/>)
            }
            if (tag.pixiv) {
                jsx.push(<img className="tag-social" src={pixiv} onClick={() => window.open(tag.pixiv, "_blank")}/>)
            }
            if (tag.twitter) {
                jsx.push(<img className="tag-social" src={twitter} onClick={() => window.open(tag.twitter, "_blank")}/>)
            }
        }
        if (tag.type === "character") {
            if (tag.fandom) {
                jsx.push(<img className="tag-social" src={fandom} onClick={() => window.open(tag.fandom, "_blank")}/>)
            }
        }
        if (tag.type === "series") {
            if (tag.website) {
                jsx.push(<img className="tag-social" src={website} onClick={() => window.open(tag.website, "_blank")}/>)
            }
            if (tag.twitter) {
                jsx.push(<img className="tag-social" src={twitter} onClick={() => window.open(tag.twitter, "_blank")}/>)
            }
        }
        return jsx
    }

    const pixivTagsJSX = () => {
        let jsx = [] as any
        if (tag.pixivTags?.[0]) {
            for (let i = 0; i < tag.pixivTags.length; i++) {
                jsx.push(<button className="tag-pixtag-button" onClick={() => window.open(`https://www.pixiv.net/en/tags/${tag.pixivTags[i]}/artworks`, "_blank")}>{tag.pixivTags[i]}</button>)
            }
        }
        if (jsx.length) {
            return <div className="tag-pixtag-button-container">{jsx}</div>
        } else {
            return null
        }
    }

    const tagAliasJSX = () => {
        let jsx = [] as any
        if (tag.aliases?.[0]) {
            for (let i = 0; i < tag.aliases.length; i++) {
                jsx.push(<button className="tag-alias-button" onClick={(event) => searchTag(event, tag.aliases[i].alias)}>{tag.aliases[i].alias.replaceAll("-", " ")}</button>)
            }
        }
        if (jsx.length) {
            return <div className="tag-alias-button-container">{jsx}</div>
        } else {
            return null
        }
    }

    const tagImplicationJSX = () => {
        let jsx = [] as any
        if (tag.implications?.[0]) {
            for (let i = 0; i < tag.implications.length; i++) {
                let implication = tag.implications[i].implication.replaceAll("-", " ")
                if (i !== tag.implications.length - 1) implication += ", "
                jsx.push(<span className="tag-text-alt" onClick={() => history.push(`/tag/${tag.implications[i].implication}`)}>{implication}</span>)
            }
        }
        if (jsx.length) {
            return (
                <div className="tag-row">
                    <span className="tag-text-italic">This tag implies the following: </span>
                    {jsx}
                </div>
            )
        } else {
            return null
        }
    }

    const relatedTagJSX = () => {
        let jsx = [] as any
        if (relatedTags.length) {
            for (let i = 0; i < relatedTags.length; i++) {
                let relatedTag = relatedTags[i].replaceAll("-", " ")
                if (i !== relatedTags.length - 1) relatedTag += ", "
                jsx.push(<span className="tag-text-alt" onClick={() => history.push(`/tag/${relatedTags[i]}`)}>{relatedTag}</span>)
            }
        }
        if (jsx.length) {
            return (
                <div className="tag-row">
                    <span className="tag-text-italic">Related tags: </span>
                    {jsx}
                </div>
            )
        } else {
            return null
        }
    }

    return (
        <>
        <DragAndDrop/>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content" onMouseEnter={() => setEnableDrag(true)}>
                {tag ? 
                <div className="tag-page">
                    <div className="tag-row">
                        {tag.image ?
                        <div className="tag-img-container">
                            <img className="tag-img" src={functions.getTagLink(tag.type, tag.image)}/>
                        </div> : null}
                        <span className="tag-heading">{functions.toProperCase(tag.tag.replaceAll("-", " "))}</span>
                        {tagSocialJSX()}
                    </div>
                    {pixivTagsJSX()}
                    {tagAliasJSX()}
                    <div className="tag-row">
                        <span className="tag-text">{tag.description}</span>
                    </div>
                    {tagImplicationJSX()}
                    {relatedTagJSX()}
                    {posts.length ?
                    <div className="tag-column">
                        <span><span className="tag-label" onClick={searchTag}>Posts</span> <span className="tag-label-alt">{count}</span></span>
                        <Carousel images={postImages} noKey={true} set={set} index={postIndex} update={updateOffset} appendImages={appendImages} height={250}/>
                    </div> : null}
                </div> : null}
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default TagPage