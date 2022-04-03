import React, {useContext, useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import loading from "../assets/purple/loading.gif"
import loadingMagenta from "../assets/magenta/loading.gif"
import {ThemeContext, SizeTypeContext, BrightnessContext, ContrastContext, HueContext, SaturationContext, LightnessContext,
BlurContext, SharpenContext, SquareContext, PixelateContext, DownloadFlagContext, DownloadURLsContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import path from "path"
import functions from "../structures/Functions"
import "./styles/gridimage.less"

interface Props {
    id: string
    img: string
    width?: number
    height?: number
}

const GridImage: React.FunctionComponent<Props> = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {sizeType, setSizeType} = useContext(SizeTypeContext)
    const [imageSize, setImageSize] = useState(270) as any
    const {brightness, setBrightness} = useContext(BrightnessContext)
    const {contrast, setContrast} = useContext(ContrastContext)
    const {hue, setHue} = useContext(HueContext)
    const {saturation, setSaturation} = useContext(SaturationContext)
    const {lightness, setLightness} = useContext(LightnessContext)
    const {blur, setBlur} = useContext(BlurContext)
    const {sharpen, setSharpen} = useContext(SharpenContext)
    const {pixelate, setPixelate} = useContext(PixelateContext)
    const {square, setSquare} = useContext(SquareContext)
    const {downloadFlag, setDownloadFlag} = useContext(DownloadFlagContext)
    const {downloadURLs, setDownloadURLs} = useContext(DownloadURLsContext)
    const containerRef = useRef<HTMLDivElement>(null)
    const pixelateRef = useRef<HTMLCanvasElement>(null)
    const overlayRef = useRef<HTMLImageElement>(null)
    const lightnessRef = useRef<HTMLImageElement>(null)
    const ref = useRef<HTMLImageElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [imageWidth, setImageWidth] = useState(0)
    const [imageHeight, setImageHeight] = useState(0)
    const [naturalWidth, setNaturalWidth] = useState(0)
    const [naturalHeight, setNaturalHeight] = useState(0)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [drag, setDrag] = useState(false)
    const history = useHistory()

    const getBorder = () => {
        if (sizeType === "tiny" || sizeType === "small") {
            return "2px solid var(--imageBorder)"
        } else {
            return "3px solid var(--imageBorder)"
        }
    }

    const getSquareOffset = () => {
        if (sizeType === "tiny") return 10
        if (sizeType === "small") return 12
        if (sizeType === "medium") return 15
        if (sizeType === "large") return 20
        if (sizeType === "massive") return 30
        return 5
    }

    const updateSquare = () => {
        if (!containerRef.current || !pixelateRef.current) return
        const currentRef = functions.isVideo(props.img) ? videoRef.current! : ref.current!
        const refWidth = functions.isVideo(props.img) ? videoRef.current!.clientWidth : ref.current!.width
        const refHeight = functions.isVideo(props.img) ? videoRef.current!.clientHeight : ref.current!.height
        if (square) {
            const width = window.innerWidth - document.querySelector(".sidebar")?.clientWidth!
            const containerWidth = Math.floor(width / functions.getImagesPerRow(sizeType)) - getSquareOffset()
            containerRef.current.style.width = `${containerWidth}px`
            containerRef.current.style.height = `${containerWidth}px`
            containerRef.current.style.marginBottom = "3px"
            const landscape = refWidth <=refHeight
            if (landscape) {
                currentRef.style.width = `${containerWidth}px`
                currentRef.style.height = "auto"
            } else {
                currentRef.style.width = "auto"
                currentRef.style.height = `${containerWidth}px`
            }
        } else {
            containerRef.current.style.width = "max-content"
            containerRef.current.style.height = "max-content"
            currentRef.style.width = "auto"
            currentRef.style.height = `${imageSize}px`
            containerRef.current.style.marginBottom = "10px"
        }
    }

    useEffect(() => {
        updateSquare()
    }, [square, sizeType, imageSize, imageWidth, imageHeight])


    useEffect(() => {
        if (!containerRef.current) return
        if (imageLoaded) {
            containerRef.current.style.border = getBorder()
        } else {
            containerRef.current.style.border = "none"
        }
    }, [imageLoaded, sizeType])

    useEffect(() => {
        if (sizeType === "tiny") {
            setImageSize(160)
        } else if (sizeType === "small") {
            setImageSize(200)
        } else if (sizeType === "medium") {
            setImageSize(270)
        } else if (sizeType === "large") {
            setImageSize(400)
        } else if (sizeType === "massive") {
            setImageSize(500)
        }
    }, [sizeType])

    useEffect(() => {
        if (!containerRef.current) return
        const element = containerRef.current.querySelector(".image-filters") as any
        let newContrast = contrast
        const image = element.querySelector(".image") as any
        const sharpenOverlay = element.querySelector(".sharpen-overlay") as any
        const lightnessOverlay = element.querySelector(".lightness-overlay") as any
        if (sharpen !== 0) {
            const sharpenOpacity = sharpen / 5
            newContrast += 25 * sharpenOpacity
            sharpenOverlay.style.backgroundImage = `url(${image.src})`
            sharpenOverlay.style.filter = `blur(4px) invert(1) contrast(75%)`
            sharpenOverlay.style.mixBlendMode = "overlay"
            sharpenOverlay.style.opacity = `${sharpenOpacity}`
        } else {
            sharpenOverlay.style.backgroundImage = "none"
            sharpenOverlay.style.filter = "none"
            sharpenOverlay.style.mixBlendMode = "normal"
            sharpenOverlay.style.opacity = "0"
        }
        if (lightness !== 100) {
            const filter = lightness < 100 ? "brightness(0)" : "brightness(0) invert(1)"
            lightnessOverlay.style.filter = filter
            lightnessOverlay.style.opacity = `${Math.abs((lightness - 100) / 100)}`
        } else {
            lightnessOverlay.style.filter = "none"
            lightnessOverlay.style.opacity = "0"
        }
        element.style.filter = `brightness(${brightness}%) contrast(${newContrast}%) hue-rotate(${hue - 180}deg) saturate(${saturation}%) blur(${blur}px)`
    }, [brightness, contrast, hue, saturation, lightness, blur, sharpen])

    useEffect(() => {
        if (!pixelateRef.current || !containerRef.current) return
        const currentRef = functions.isVideo(props.img) ? videoRef.current! : ref.current!
        const pixelateCanvas = pixelateRef.current
        const ctx = pixelateCanvas.getContext("2d") as any
        const imageWidth = functions.isVideo(props.img) ? videoRef.current!.clientWidth : ref.current!.width 
        const imageHeight = functions.isVideo(props.img) ? videoRef.current!.clientHeight : ref.current!.height
        const landscape = imageWidth >= imageHeight
        ctx.clearRect(0, 0, pixelateCanvas.width, pixelateCanvas.height)
        pixelateCanvas.width = imageWidth
        pixelateCanvas.height = imageHeight
        const pixelWidth = imageWidth / pixelate 
        const pixelHeight = imageHeight / pixelate
        if (pixelate !== 1) {
            ctx.drawImage(currentRef, 0, 0, pixelWidth, pixelHeight)
            if (landscape) {
                pixelateCanvas.style.width = `${imageWidth * pixelate}px`
                pixelateCanvas.style.height = "auto"
            } else {
                pixelateCanvas.style.width = "auto"
                pixelateCanvas.style.height = `${imageHeight * pixelate}px`
            }
            pixelateCanvas.style.opacity = "1"
        } else {
            pixelateCanvas.style.width = "none"
            pixelateCanvas.style.height = "none"
            pixelateCanvas.style.opacity = "0"
        }
    }, [pixelate, square, imageSize])

    const imageAnimation = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!overlayRef.current || !pixelateRef.current || !lightnessRef.current) return
        const currentRef = functions.isVideo(props.img) ? videoRef.current! : ref.current!
        const rect = currentRef.getBoundingClientRect()
        const width = rect?.width
        const height = rect?.height
        const x = event.clientX - rect.x
        const y = event.clientY - rect.y
        const translateX = ((x / width) - 0.5) * 3
        const translateY = ((y / height) - 0.5) * 3
        currentRef.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(1.02)`
        overlayRef.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(1.02)`
        lightnessRef.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(1.02)`
        pixelateRef.current.style.transformOrigin = "top left"
        pixelateRef.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(1.02)`
    }

    const cancelImageAnimation = () => {
        if (!overlayRef.current || !pixelateRef.current || !lightnessRef.current) return
        const currentRef = functions.isVideo(props.img) ? videoRef.current! : ref.current!
        currentRef.style.transform = "scale(1)"
        overlayRef.current.style.transform = "scale(1)"
        lightnessRef.current.style.transform = "scale(1)"
        pixelateRef.current.style.transformOrigin = "none"
        pixelateRef.current.style.transform = "scale(1)"
    }

    const getLoading = () => {
        if (theme.includes("magenta")) return loadingMagenta
        return loading
    }

    const onLoad = (event: any) => {
        if (functions.isVideo(props.img)) {
            setImageWidth(event.target.clientWidth)
            setImageHeight(event.target.clientHeight)
            setNaturalWidth(event.target.videoWidth)
            setNaturalHeight(event.target.videoHeight)
        } else {
            setImageWidth(event.target.width)
            setImageHeight(event.target.height)
            setNaturalWidth(event.target.naturalWidth)
            setNaturalHeight(event.target.naturalHeight)
        }
        setImageLoaded(true)
        event.target.style.opacity = "1"
    }

    const render = (frame: any, buffer?: boolean) => {
        const canvas = document.createElement("canvas") as any
        canvas.width = naturalWidth
        canvas.height = naturalHeight
        const ctx = canvas.getContext("2d") as any
        let newContrast = contrast
        ctx.filter = `brightness(${brightness}%) contrast(${newContrast}%) hue-rotate(${hue - 180}deg) saturate(${saturation}%) blur(${blur}px)`
        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height)
        if (pixelate !== 1) {
            const pixelateCanvas = document.createElement("canvas")
            const pixelWidth = frame.width / pixelate 
            const pixelHeight = frame.height / pixelate
            pixelateCanvas.width = pixelWidth 
            pixelateCanvas.height = pixelHeight
            const pixelateCtx = pixelateCanvas.getContext("2d") as any
            pixelateCtx.imageSmoothingEnabled = false
            pixelateCtx.drawImage(frame, 0, 0, pixelWidth, pixelHeight)
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(pixelateCanvas, 0, 0, canvas.width, canvas.height)
        }
        if (sharpen !== 0) {
            const sharpnessCanvas = document.createElement("canvas")
            sharpnessCanvas.width = naturalWidth
            sharpnessCanvas.height = naturalHeight
            const sharpnessCtx = sharpnessCanvas.getContext("2d")
            sharpnessCtx?.drawImage(frame, 0, 0, sharpnessCanvas.width, sharpnessCanvas.height)
            const sharpenOpacity = sharpen / 5
            newContrast += 25 * sharpenOpacity
            const filter = `blur(4px) invert(1) contrast(75%)`
            ctx.filter = filter 
            ctx.globalAlpha = sharpenOpacity
            ctx.globalCompositeOperation = "overlay"
            ctx.drawImage(sharpnessCanvas, 0, 0, canvas.width, canvas.height)
        }
        if (lightness !== 100) {
            const lightnessCanvas = document.createElement("canvas")
            lightnessCanvas.width = naturalWidth
            lightnessCanvas.height = naturalHeight
            const lightnessCtx = lightnessCanvas.getContext("2d")
            lightnessCtx?.drawImage(frame, 0, 0, lightnessCanvas.width, lightnessCanvas.height)
            const filter = lightness < 100 ? "brightness(0)" : "brightness(0) invert(1)"
            ctx.filter = filter
            ctx.globalAlpha = `${Math.abs((lightness - 100) / 100)}`
            ctx.drawImage(lightnessCanvas, 0, 0, canvas.width, canvas.height)
        }
        if (buffer) {
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
            return img.data.buffer
        }
        return canvas.toDataURL("image/png")
    }

    useEffect(() => {
        if (downloadFlag) {
            if (downloadURLs.includes(props.img)) {
                if (functions.isGIF(props.img) || functions.isVideo(props.img)) {
                    functions.download(path.basename(props.img), props.img)
                } else {
                    functions.download(path.basename(props.img), render(ref.current))
                }
                setDownloadURLs(downloadURLs.filter((s: string) => s !== props.img))
                setDownloadFlag(false)
            }
        }
    }, [downloadFlag])

    const mouseDown = (event: React.MouseEvent<HTMLElement>) => {
        setDrag(false)
    }

    const mouseMove = (event: React.MouseEvent<HTMLElement>) => {
        setDrag(true)
    }

    const mouseUp = (event: React.MouseEvent<HTMLElement>) => {
        if (!drag) history.push(`/post/${props.id}`)
    }


    return (
        <div className="image-box" ref={containerRef} onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={mouseMove}>
            <div className="image-filters" onMouseMove={(event) => imageAnimation(event)} onMouseLeave={() => cancelImageAnimation()}>
                <img className="lightness-overlay" ref={lightnessRef} src={props.img}/>
                <img className="sharpen-overlay" ref={overlayRef} src={props.img}/>
                <canvas className="pixelate-canvas" ref={pixelateRef}></canvas>
                {functions.isVideo(props.img) ? 
                <video autoPlay loop muted disablePictureInPicture className="video" ref={videoRef} src={props.img} onLoadedData={(event) => onLoad(event)}></video> :
                <img className="image" ref={ref} src={props.img} onLoad={(event) => onLoad(event)}/>}
            </div>
            {!imageLoaded ? 
                <img className="loading" src={getLoading()}/>
            : null}
        </div>
    )
}

export default GridImage