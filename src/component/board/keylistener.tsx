import { SET_TYPE, TOGGLE_PANMODE } from "../../redux/slice/drawcontrol"
import store from "../../redux/store"
import {
    JUMP_TO_NEXT_PAGE,
    JUMP_TO_PREV_PAGE,
} from "../../redux/slice/viewcontrol"
import { handleRedo, handleUndo } from "../../drawing/handlers"
import { ToolType } from "../../types"

export default function keyListener(e: KeyboardEvent): void {
    switch (e.key) {
        case "ArrowUp": // Previous Page
            store.dispatch(JUMP_TO_PREV_PAGE())
            break
        case "ArrowDown": // Next Page
            store.dispatch(JUMP_TO_NEXT_PAGE())
            break
        // case "ArrowLeft": // ???
        //     store.dispatch(FUNC())
        //     break
        // case "ArrowRight": // ???
        //     store.dispatch(FUNC())
        //     break
        case "p": // Pen
            store.dispatch(SET_TYPE(ToolType.Pen))
            break
        case "1": // Pen
            store.dispatch(SET_TYPE(ToolType.Pen))
            break
        case "e": // Eraser
            store.dispatch(SET_TYPE(ToolType.Eraser))
            break
        case "2": // Eraser
            store.dispatch(SET_TYPE(ToolType.Eraser))
            break
        case "d": // Drag
            store.dispatch(SET_TYPE(ToolType.Drag))
            break
        case "3": // Drag
            store.dispatch(SET_TYPE(ToolType.Drag))
            break
        case "l": // Line
            store.dispatch(SET_TYPE(ToolType.Line))
            break
        case "4": // Line
            store.dispatch(SET_TYPE(ToolType.Line))
            break
        // case "t": // Triangle
        //     store.dispatch(SET_TYPE(ToolType.TRIANGLE))
        //     break
        // case "5": // Triangle
        //     store.dispatch(SET_TYPE(ToolType.TRIANGLE))
        //     break
        case "c": // Circle
            store.dispatch(SET_TYPE(ToolType.Circle))
            break
        case "6": // Circle
            store.dispatch(SET_TYPE(ToolType.Circle))
            break
        case "z": // Undo (Ctrl + Z)
            if (e.ctrlKey && !e.repeat) {
                handleUndo()
            }
            break
        case "y": // Redo (Ctrl + Y)
            if (e.ctrlKey && !e.repeat) {
                handleRedo()
            }
            break
        case " ": // Undo (Ctrl + Z)
            store.dispatch(TOGGLE_PANMODE())
            break
        default:
            break
    }
}
