import React, {useEffect, useState, useContext} from "react"
import {Switch, Route, Redirect, useHistory, useLocation} from "react-router-dom"
import Context, {ThemeContext, HideNavbarContext, HideSidebarContext, HideSortbarContext,
HideTitlebarContext, EnableDragContext, ActiveDropdownContext, FilterDropActiveContext, MobileScrollingContext,
SidebarHoverContext, SessionContext, SessionFlagContext, UserImgContext, MobileContext} from "./Context"
import favicon from "./assets/purple/favicon.png"
import faviconMagenta from "./assets/magenta/favicon.png"
import PostsPage from "./pages/PostsPage"
import CommentsPage from "./pages/CommentsPage"
import ArtistsPage from "./pages/ArtistsPage"
import CharactersPage from "./pages/CharactersPage"
import SeriesPage from "./pages/SeriesPage"
import TagsPage from "./pages/TagsPage"
import PostPage from "./pages/PostPage"
import UploadPage from "./pages/UploadPage"
import $404Page from "./pages/404Page"
import $403Page from "./pages/403Page"
import HelpPage from "./pages/HelpPage"
import TermsPage from "./pages/TermsPage"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"
import $2FAPage from "./pages/2FAPage"
import $2FAEnablePage from "./pages/2FAEnablePage"
import ContactPage from "./pages/ContactPage"
import UserProfilePage from "./pages/UserProfilePage"
import ChangeUsernamePage from "./pages/ChangeUsernamePage"
import ChangeEmailPage from "./pages/ChangeEmailPage"
import ChangeEmailSuccessPage from "./pages/ChangeEmailSuccessPage"
import VerifyEmailPage from "./pages/VerifyEmailPage"
import VerifyEmailSuccessPage from "./pages/VerifyEmailSuccessPage"
import ChangePasswordPage from "./pages/ChangePasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import EditPostPage from "./pages/EditPostPage"
import UserPage from "./pages/UserPage"
import TagPage from "./pages/TagPage"
import TagHistoryPage from "./pages/TagHistoryPage"
import PostHistoryPage from "./pages/PostHistoryPage"
import UnverifiedPostPage from "./pages/UnverifiedPostPage"
import functions from "./structures/Functions"
import localforage from "localforage"
import ModQueuePage from "./pages/ModQueuePage"
import EditUnverifiedPostPage from "./pages/EditUnverifiedPostPage"
import SetAvatarPage from "./pages/SetAvatarPage"
import axios from "axios"
import "./index.less"

require.context("./assets/purple", true)
require.context("./assets/purple-light", true)
require.context("./assets/magenta", true)
require.context("./assets/magenta-light", true)

let destroy2FATimeout = null as any

const App: React.FunctionComponent = (props) => {
    const [loaded, setLoaded] = useState(false)
    const [theme, setTheme] = useState("purple")
    const [hideSortbar, setHideSortbar] = useState(false)
    const [hideSidebar, setHideSidebar] = useState(false)
    const [hideNavbar, setHideNavbar] = useState(false)
    const [hideTitlebar, setHideTitlebar] = useState(false)
    const [enableDrag, setEnableDrag] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState("none")
    const [filterDropActive, setFilterDropActive] = useState(false)
    const [sidebarHover, setSidebarHover] = useState(false)
    const [session, setSession] = useState({}) as any
    const [sessionFlag, setSessionFlag] = useState(false)
    const [userImg, setUserImg] = useState("")
    const [mobile, setMobile] = useState(false)
    const [mobileScrolling, setMobileScrolling] = useState(false)

    const history = useHistory()
    const location = useLocation()

    const getSessionCookie = async () => {
        const cookie = await axios.get("/api/user/session", {withCredentials: true}).then((r) => r.data)
        setSession(cookie)
    }

    const saveTags = async () => {
        const tags = await axios.get("/api/tag/list", {withCredentials: true}).then((r) => r.data)
        const tagCounts = await axios.get("/api/tag/counts", {withCredentials: true}).then((r) => r.data)
        let tagArray = [] as any
        for (let i = 0; i < tags.length; i++) {
            const tagCount = tagCounts.find((t: any) => t.tag === tags[i].tag) || {}
            tagArray.push({...tags[i], ...tagCount})
        }
        await localforage.setItem("tags", tagArray)
    }

    useEffect(() => {
        setTimeout(() => {
            setLoaded(true)
        }, 100)
        getSessionCookie()
        saveTags()
    }, [])

    const getFavicon = () => {
        if (theme.includes("magenta")) return faviconMagenta 
        return favicon
    }

    const getImg = () => {
        if (session.username) {
            return session.image ? functions.getTagLink("pfp", session.image) : getFavicon()
        } else {
            return ""
        }
    }

    const updatePfp = async () => {
        try {
            await axios.post(getImg(), null, {withCredentials: true})
        } catch {
            // ignore
        }
        setUserImg(getImg())
    }

    useEffect(() => {
        if (!session.cookie) return
        updatePfp()
    }, [session, theme])

    const destroy2FA = async () => {
        try {
            await axios.post("/api/2fa/delete", null, {withCredentials: true})
            setSessionFlag(true)
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        if (session.username && !session.emailVerified) {
            if (location.pathname !== "/verify-email") {
                history.push("/verify-email")
            }
        }
        clearTimeout(destroy2FATimeout)
        destroy2FATimeout = setTimeout(() => {
            if (!session.username && session.email) {
                if (location.pathname !== "/2fa") {
                    destroy2FA()
                }
            }
        }, 1000)
    }, [location, session])

    useEffect(() => {
        if (sessionFlag) {
            setSessionFlag(false)
            getSessionCookie()
            updatePfp()
        }
    }, [sessionFlag])

    useEffect(() => {
        functions.preventDragging()
    })

    useEffect(() => {
        const handleScroll = () => {
            if (filterDropActive) {
                setMobileScrolling(false)
                return setHideSortbar(false)
            }
            if (window.scrollY === 0) return setHideSortbar(false)
            if (sidebarHover) return setHideSortbar(true)
            setActiveDropdown("none")
            return setHideSortbar(true)
        }
        const handleMouseMove = (event: any) => {
            if (filterDropActive) {
                setMobileScrolling(false)
                return setHideSortbar(false)
            }
            if (activeDropdown !== "none") return setHideSortbar(false)
            if (window.scrollY === 0) return setHideSortbar(false)
            if (sidebarHover) return setHideSortbar(true)
            const sortbar = document.querySelector(".sortbar")
            const amt = hideTitlebar ? (sortbar ? (functions.navbarHeight() + functions.sortbarHeight()) : functions.navbarHeight()) : (functions.titlebarHeight() + functions.navbarHeight() + functions.sortbarHeight())
            if (event.clientY < amt) return setHideSortbar(false)
            return setHideSortbar(true)
        }
        window.addEventListener("scroll", handleScroll)
        window.addEventListener("mousemove", handleMouseMove)
        return () => {
            window.removeEventListener("scroll", handleScroll)
            window.removeEventListener("mousemove", handleMouseMove)
        }
    }, [hideTitlebar, activeDropdown, sidebarHover])

    useEffect(() => {
        if (mobile) return functions.dragScroll(false)
        functions.dragScroll(enableDrag)
    }, [enableDrag, history])

    useEffect(() => {
        if (!theme || theme === "purple") {
            document.documentElement.style.setProperty("--background", "#09071c")
            document.documentElement.style.setProperty("--titlebarBG", "#090420")
            document.documentElement.style.setProperty("--navbarBG", "#0b0322")
        } else if (theme === "purple-light") {
            document.documentElement.style.setProperty("--background", "#ffffff")
            document.documentElement.style.setProperty("--titlebarBG", "#dfdfff")
            document.documentElement.style.setProperty("--navbarBG", "#dbddff")
        } else if (theme === "magenta") {
            document.documentElement.style.setProperty("--background", "#17040e")
            document.documentElement.style.setProperty("--titlebarBG", "#1c0511")
            document.documentElement.style.setProperty("--navbarBG", "#1e0514")
        } else if (theme === "magenta-light") {
            document.documentElement.style.setProperty("--background", "#ffffff")
            document.documentElement.style.setProperty("--titlebarBG", "#ffe2f2")
            document.documentElement.style.setProperty("--navbarBG", "#ffe0f1")
        }
        functions.changeFavicon(theme)
    }, [theme])

    useEffect(() => {
        const mobileQuery = (query: any) => {
            if (query.matches) {
                setMobile(true)
            } else {
                setMobile(false)
            }
        }
        const media = window.matchMedia("(max-width: 500px)")
        media.addEventListener("change", mobileQuery)
        mobileQuery(media)
        document.documentElement.style.visibility = "visible"
    }, [])

    return (
        <div className={`app ${theme} ${!loaded ? "stop-transitions" : ""}`}>
            <MobileScrollingContext.Provider value={{mobileScrolling, setMobileScrolling}}>
            <MobileContext.Provider value={{mobile, setMobile}}>
            <UserImgContext.Provider value={{userImg, setUserImg}}>
            <SessionFlagContext.Provider value={{sessionFlag, setSessionFlag}}>
            <SessionContext.Provider value={{session, setSession}}>
            <SidebarHoverContext.Provider value={{sidebarHover, setSidebarHover}}>
            <FilterDropActiveContext.Provider value={{filterDropActive, setFilterDropActive}}>
            <ActiveDropdownContext.Provider value={{activeDropdown, setActiveDropdown}}>
            <EnableDragContext.Provider value={{enableDrag, setEnableDrag}}>
            <HideSortbarContext.Provider value={{hideSortbar, setHideSortbar}}>
            <HideNavbarContext.Provider value={{hideNavbar, setHideNavbar}}>
            <HideTitlebarContext.Provider value={{hideTitlebar, setHideTitlebar}}>
            <HideSidebarContext.Provider value={{hideSidebar, setHideSidebar}}>
            <ThemeContext.Provider value={{theme, setTheme}}>
                <Context>
                    <Switch>
                        <Route exact path={["/", "/posts", "/home"]}><PostsPage/></Route>
                        <Route exact path="/profile"><UserProfilePage/></Route>
                        <Route exact path="/upload"><UploadPage/></Route>
                        <Route exact path="/tags"><TagsPage/></Route>
                        <Route exact path="/series"><SeriesPage/></Route>
                        <Route exact path="/characters"><CharactersPage/></Route>
                        <Route exact path="/artists"><ArtistsPage/></Route>
                        <Route exact path="/comments"><CommentsPage/></Route>
                        <Route exact path="/user/:username" render={(props) => <UserPage {...props}/>}></Route>
                        <Route exact path="/tag/history/:tag" render={(props) => <TagHistoryPage {...props}/>}></Route>
                        <Route exact path="/tag/history" render={(props) => <TagHistoryPage all={true} {...props}/>}></Route>
                        <Route exact path="/tag/:tag" render={(props) => <TagPage {...props}/>}></Route>
                        <Route exact path="/post/history/:id" render={(props) => <PostHistoryPage {...props}/>}></Route>
                        <Route exact path="/post/history" render={(props) => <PostHistoryPage all={true} {...props}/>}></Route>
                        <Route exact path="/post/:id" render={(props) => <PostPage {...props}/>}></Route>
                        <Route exact path="/unverified/post/:id" render={(props) => <UnverifiedPostPage {...props}/>}></Route>
                        <Route exact path="/edit-post/:id" render={(props) => <EditPostPage {...props}/>}></Route>
                        <Route exact path="/unverified/edit-post/:id" render={(props) => <EditUnverifiedPostPage {...props}/>}></Route>
                        <Route exact path="/set-avatar/:id" render={(props) => <SetAvatarPage {...props}/>}></Route>
                        <Route exact path="/help"><HelpPage/></Route>
                        <Route exact path="/change-username"><ChangeUsernamePage/></Route>
                        <Route exact path="/change-email"><ChangeEmailPage/></Route>
                        <Route exact path="/change-email-success"><ChangeEmailSuccessPage/></Route>
                        <Route exact path="/verify-email"><VerifyEmailPage/></Route>
                        <Route exact path="/verify-email-success"><VerifyEmailSuccessPage/></Route>
                        <Route exact path="/reset-password"><ResetPasswordPage/></Route>
                        <Route exact path="/change-password"><ChangePasswordPage/></Route>
                        <Route exact path="/forgot-password"><ForgotPasswordPage/></Route>
                        <Route exact path={["/signup", "/register"]}><SignUpPage/></Route>
                        <Route exact path="/login"><LoginPage/></Route>
                        <Route exact path="/2fa"><$2FAPage/></Route>
                        <Route exact path="/enable-2fa"><$2FAEnablePage/></Route>
                        <Route exact path="/contact"><ContactPage/></Route>
                        <Route exact path="/mod-queue"><ModQueuePage/></Route>
                        <Route exact path={["/privacy", "/privacypolicy"]}><Redirect to="/terms#privacy"/></Route>
                        <Route exact path={["/terms", "termsofservice"]}><TermsPage/></Route>
                        <Route exact path="/403"><$403Page/></Route>
                        <Route path="*"><$404Page/></Route>
                    </Switch>
                </Context>
            </ThemeContext.Provider>
            </HideSidebarContext.Provider>
            </HideTitlebarContext.Provider>
            </HideNavbarContext.Provider>
            </HideSortbarContext.Provider>
            </EnableDragContext.Provider>
            </ActiveDropdownContext.Provider>
            </FilterDropActiveContext.Provider>
            </SidebarHoverContext.Provider>
            </SessionContext.Provider>
            </SessionFlagContext.Provider>
            </UserImgContext.Provider>
            </MobileContext.Provider>
            </MobileScrollingContext.Provider>
        </div>
    )
}

export default App