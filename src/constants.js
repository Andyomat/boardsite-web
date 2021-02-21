export const CANVAS_WIDTH = 620
export const CANVAS_HEIGHT = 877
export const CANVAS_GAP = 20
export const CANVAS_FULL_HEIGHT = CANVAS_HEIGHT + CANVAS_GAP
export const CANVAS_PIXEL_RATIO = 1 // css forces canvas to be in a smaller frame but with high res for better clarity
export const WIDTH_MIN = 1
export const WIDTH_MAX = 40
export const DEFAULT_WIDTH = 4
export const DEFAULT_COLOR = "#000000"
export const DEFAULT_ISPANMODE = false
export const ZOOM_IN_WHEEL_SCALE = 1.1
export const ZOOM_OUT_WHEEL_SCALE = 0.9
export const ZOOM_IN_BUTTON_SCALE = 1.1
export const ZOOM_OUT_BUTTON_SCALE = 0.9
export const ZOOM_SCALE_MAX = 5.0
export const ZOOM_SCALE_MIN = 0.5
export const DEFAULT_CURRENT_PAGE_INDEX = 0
export const DEFAULT_STAGE_WIDTH = window.innerWidth
export const DEFAULT_STAGE_HEIGHT = window.innerHeight
export const DEFAULT_STAGE_X = 0
export const DEFAULT_STAGE_Y = 60
export const DEFAULT_STAGE_SCALE = { x: 1, y: 1 }
export const DEFAULT_ISDRAGGABLE = false
export const DEFAULT_ISLISTENING = false
export const DEFAULT_ISMOUSEDOWN = false

// drawing stuff
export const toolType = {
    ERASER: 0,
    PEN: 1,
    LINE: 2,
    TRIANGLE: 3,
    CIRCLE: 4,
    DRAG: 5,
    RECTANGLE: 6,
}
export const DEFAULT_TOOL = toolType.PEN
export const MIN_SAMPLE_COUNT = 5
// maximum number of points a livestroke can have until cached
export const MAX_LIVESTROKE_PTS = 100

// api
export const API_URL = `http${
    process.env.REACT_APP_B_SSL === "1" ? "s" : ""
}://${process.env.REACT_APP_B_API_HOSTNAME}:${process.env.REACT_APP_B_API_PORT}`

export const API_SESSION_URL = `${API_URL}/b`
