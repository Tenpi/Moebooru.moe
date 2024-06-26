import React, {useContext, useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, SearchContext, SearchFlagContext, SessionContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import functions from "../structures/Functions"
import Carousel from "./Carousel"
import website from "../assets/icons/support.png"
import pixiv from "../assets/icons/pixiv.png"
import twitter from "../assets/icons/twitter.png"
import "./styles/artistrow.less"

interface Props {
    artist: any
}

const ArtistRow: React.FunctionComponent<Props> = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const [hover, setHover] = useState(false)
    const {search, setSearch} = useContext(SearchContext)
    const {searchFlag, setSearchFlag} = useContext(SearchFlagContext)
    const {session, setSession} = useContext(SessionContext)
    const history = useHistory()

    const searchTag = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open("/posts", "_blank")
        } else {
            history.push("/posts")
        }
        setSearch(props.artist.tag)
        setSearchFlag(true)
    }

    const set = (image: string, index: number, newTab: boolean) => {
        if (!session.username) {
            const filtered = props.artist.posts.filter((p: any) => p.restrict === "safe")
            const post = filtered[index] 
            if (newTab) {
                return window.open(`/post/${post.postID}`, "_blank")
            } else {
                return history.push(`/post/${post.postID}`)
            }
        }
        const filtered = props.artist.posts.filter((p: any) => p.restrict !== "explicit")
        const post = filtered[index] 
        if (newTab) {
            window.open(`/post/${post.postID}`, "_blank")
        } else {
            history.push(`/post/${post.postID}`)
        }
    }

    const getImages = () => {
        if (!session.username) {
            const filtered = props.artist.posts.filter((p: any) => p.restrict === "safe")
            return filtered.map((p: any) => functions.getThumbnailLink(p.images[0].type, p.postID, p.images[0].order, p.images[0].filename, "tiny"))
        }
        const filtered = props.artist.posts.filter((p: any) => p.restrict !== "explicit")
        return filtered.map((p: any) => functions.getThumbnailLink(p.images[0].type, p.postID, p.images[0].order, p.images[0].filename, "tiny"))
    }

    const artistSocialJSX = () => {
        let jsx = [] as any
        if (props.artist.website) {
            jsx.push(<img className="artistrow-social" src={website} onClick={() => window.open(props.artist.website, "_blank")}/>)
        }
        if (props.artist.pixiv) {
            jsx.push(<img className="artistrow-social" src={pixiv} onClick={() => window.open(props.artist.pixiv, "_blank")}/>)
        }
        if (props.artist.twitter) {
            jsx.push(<img className="artistrow-social" src={twitter} onClick={() => window.open(props.artist.twitter, "_blank")}/>)
        }
        return jsx
    }

    return (
        <div className="artistrow">
            <div className="artistrow-row">
                {props.artist.image ? <img className="artistrow-img" src={functions.getTagLink("artist", props.artist.image)}/> : null}
                <span className="artistrow-text-hover">
                    <span className="artistrow-text" onClick={searchTag} onAuxClick={searchTag}>{functions.toProperCase(props.artist.tag.replaceAll("-", " "))}</span>
                    {artistSocialJSX()}
                    <span className="artistrow-text-alt">{props.artist.postCount}</span>
                </span>
            </div>
            <div className="artistrow-row">
                <Carousel set={set} noKey={true} images={getImages()} height={200}/>
            </div>
        </div>
    )
}

export default ArtistRow