import React, {useContext, useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, SearchContext, SearchFlagContext, MobileContext, SessionContext, SiteHueContext, SiteLightnessContext,
SiteSaturationContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import functions from "../structures/Functions"
import adminCrown from "../assets/icons/admin-crown.png"
import modCrown from "../assets/icons/mod-crown.png"
import favicon from "../assets/icons/favicon.png"
import "./styles/thread.less"
import sticky from "../assets/icons/sticky.png"
import lock from "../assets/icons/lock.png"
import axios from "axios"

interface Props {
    thread?: any
    onDelete?: () => void
    onEdit?: () => void
    titlePage?: boolean
}

const Thread: React.FunctionComponent<Props> = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {siteHue, setSiteHue} = useContext(SiteHueContext)
    const {siteSaturation, setSiteSaturation} = useContext(SiteSaturationContext)
    const {siteLightness, setSiteLightness} = useContext(SiteLightnessContext)
    const [hover, setHover] = useState(false)
    const {search, setSearch} = useContext(SearchContext)
    const {searchFlag, setSearchFlag} = useContext(SearchFlagContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const {session, setSession} = useContext(SessionContext)
    const [creatorRole, setCreatorRole] = useState("")
    const [updaterRole, setUpdaterRole] = useState("")
    const [updaterImg, setUpdaterImg] = useState("")
    const [creatorImg, setCreatorImg] = useState("")
    const [updaterImgPost, setUpdaterImgPost] = useState("")
    const [creatorImgPost, setCreatorImgPost] = useState("")
    const [creatorDefaultIcon, setCreatorDefaultIcon] = useState(false)
    const [updaterDefaultIcon, setUpdaterDefaultIcon] = useState(false)
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const updateUpdaterRole = async () => {
        const user = await axios.get("/api/user", {params: {username: props.thread.updater}, withCredentials: true}).then((r) => r.data)
        if (user?.role) setUpdaterRole(user.role)
        if (user?.image) setUpdaterImg(functions.getTagLink("pfp", user.image))
        if (user?.imagePost) setUpdaterImgPost(user.imagePost)
        setUpdaterDefaultIcon(user?.image ? false : true)
    }

    const updateCreatorRole = async () => {
        const user = await axios.get("/api/user", {params: {username: props.thread.creator}, withCredentials: true}).then((r) => r.data)
        if (props.thread.creator === props.thread.updater) {
            if (user?.role) {
                setCreatorRole(user.role)
                setUpdaterRole(user.role)
            }
            if (user?.image) {
                setCreatorImg(functions.getTagLink("pfp", user.image))
                setUpdaterImg(functions.getTagLink("pfp", user.image))
            }
            if (user?.imagePost) {
                setCreatorImgPost(user.imagePost)
                setUpdaterImgPost(user.imagePost)
            }
            setCreatorDefaultIcon(user?.image ? false : true)
            setUpdaterDefaultIcon(user?.image ? false : true)
        } else {
            if (user?.role) setCreatorRole(user.role)
            if (user?.image) setCreatorImg(functions.getTagLink("pfp", user.image))
            if (user?.imagePost) setCreatorImgPost(user.imagePost)
            setCreatorDefaultIcon(user?.image ? false : true)
            updateUpdaterRole()
        }
    }

    useEffect(() => {
        if (props.thread) {
            updateCreatorRole()
        }
    }, [])

    const threadPage = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/thread/${props.thread.threadID}`, "_blank")
        } else {
            history.push(`/thread/${props.thread.threadID}`)
        }
    }

    const getCreatorPFP = () => {
        if (creatorImg) {
            return creatorImg
        } else {
            return favicon
        }
    }

    const creatorPage = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/user/${props.thread.creator}`, "_blank")
        } else {
            history.push(`/user/${props.thread.creator}`)
        }
    }

    const creatorImgClick = (event: React.MouseEvent) => {
        if (!creatorImgPost) return
        event.stopPropagation()
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/post/${creatorImgPost}`, "_blank")
        } else {
            history.push(`/post/${creatorImgPost}`)
        }
    }

    const getUpdaterPFP = () => {
        if (updaterImg) {
            return updaterImg
        } else {
            return favicon
        }
    }

    const updaterPage = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/user/${props.thread.updater}`, "_blank")
        } else {
            history.push(`/user/${props.thread.updater}`)
        }
    }

    const updaterImgClick = (event: React.MouseEvent) => {
        if (!updaterImgPost) return
        event.stopPropagation()
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/post/${updaterImgPost}`, "_blank")
        } else {
            history.push(`/post/${updaterImgPost}`)
        }
    }

    const generateCreatorJSX = () => {
        if (creatorRole === "admin") {
            return (
                <div className="thread-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="thread-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="thread-user-text admin-color">{functions.toProperCase(props.thread.creator)}</span>
                    <img className="thread-user-label" src={adminCrown}/>
                </div>
            )
        } else if (creatorRole === "mod") {
            return (
                <div className="thread-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="thread-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="thread-user-text mod-color">{functions.toProperCase(props.thread.creator)}</span>
                    <img className="thread-user-label" src={modCrown}/>
                </div>
            )
        }
        return (
            <div className="thread-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                <img draggable={false} src={getCreatorPFP()} className="thread-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                <span className="thread-user-text" onClick={creatorPage} onAuxClick={creatorPage}>{functions.toProperCase(props.thread.creator)}</span>
            </div>
        )
    }

    const generateUpdaterJSX = () => {
        if (updaterRole === "admin") {
            return (
                <div className="thread-username-container" onClick={(event) => updaterPage(event)} onAuxClick={(event) => updaterPage(event)}>
                    <img draggable={false} src={getUpdaterPFP()} className="thread-user-img" onClick={updaterImgClick} onAuxClick={updaterImgClick} style={{filter: updaterDefaultIcon ? getFilter() : ""}}/>
                    <span className="thread-user-text admin-color">{functions.toProperCase(props.thread.updater)}</span>
                    <img className="thread-user-label" src={adminCrown}/>
                </div>
            )
        } else if (updaterRole === "mod") {
            return (
                <div className="thread-username-container" onClick={(event) => updaterPage(event)} onAuxClick={(event) => updaterPage(event)}>
                <img draggable={false} src={getUpdaterPFP()} className="thread-user-img" onClick={updaterImgClick} onAuxClick={updaterImgClick} style={{filter: updaterDefaultIcon ? getFilter() : ""}}/>
                    <span className="thread-user-text mod-color">{functions.toProperCase(props.thread.updater)}</span>
                    <img className="thread-user-label" src={modCrown}/>
                </div>
            )
        }
        return (
            <div className="thread-username-container" onClick={(event) => updaterPage(event)} onAuxClick={(event) => updaterPage(event)}>
                <img draggable={false} src={getUpdaterPFP()} className="thread-user-img" onClick={updaterImgClick} onAuxClick={updaterImgClick} style={{filter: updaterDefaultIcon ? getFilter() : ""}}/>
                <span className="thread-user-text" onClick={(event) => updaterPage(event)} onAuxClick={(event) => updaterPage(event)}>{functions.toProperCase(props.thread.updater)}</span>
            </div>
        )
    }

    const dateTextJSX = () => {
        const targetDate = props.thread.updatedDate
        return <span className="thread-date-text">{functions.timeAgo(targetDate)}</span>
    }

    if (props.titlePage) {
        return (
            <tr className="thread-no-hover">
                <div className="thread-content-container">
                    <td className="thread-container">
                        <div className="thread-row" style={{width: "100%"}}>
                            <span className="thread-heading">Title</span>
                        </div>
                        {!mobile ? <div className="thread-row">
                            <span className="thread-heading">Created by</span>
                        </div> : null}
                        {!mobile ? <div className="thread-row">
                            <span className="thread-heading">Updated by</span>
                        </div> : null}
                        <div className="thread-row">
                            <span className="thread-heading">Updated</span>
                        </div>
                    </td>
                </div>
            </tr>
        )
    }

    return (
        <tr className="thread">
            <div className="thread-content-container">
                <td className="thread-container">
                    <div className="thread-row" style={{width: "100%"}}>
                        {props.thread.sticky ? <img draggable={false} className="thread-icon" src={sticky} style={{marginTop: "4px"}}/> : null}
                        {props.thread.locked ? <img draggable={false} className="thread-icon" src={lock}/> : null}
                        <span className="thread-title" onClick={threadPage} onAuxClick={threadPage}>{props.thread.title}</span>
                    </div>
                    {!mobile ? <div className="thread-row">
                        {generateCreatorJSX()}
                    </div> : null}
                    {!mobile ? <div className="thread-row">
                        {generateUpdaterJSX()}
                    </div> : null}
                    <div className="thread-row">
                        {dateTextJSX()}
                    </div>
                </td>
            </div>
        </tr>
    )
}

export default Thread