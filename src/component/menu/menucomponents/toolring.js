import React, { useState } from "react"
import { useSelector } from "react-redux"
import { MdRemove } from "react-icons/md"
import {
    CgErase,
    CgShapeCircle,
    CgShapeTriangle,
    CgController,
} from "react-icons/cg"
import { BsPencil } from "react-icons/bs"
import store from "../../../redux/store"
import { SET_TYPE } from "../../../redux/slice/drawcontrol"
import { toolType } from "../../../constants"
import StylePicker from "../stylepicker"

export default function ToolRing() {
    const [open, setOpen] = useState(false)
    const typeSelector = useSelector(
        (state) => state.drawControl.liveStroke.type
    )
    const colorSelector = useSelector(
        (state) => state.drawControl.liveStroke.style.color
    )

    return (
        <>
            <div className="toolring">
                <div className="session-dialog-div">
                    {typeSelector === toolType.PEN ? (
                        <button
                            type="button"
                            style={{ color: colorSelector }}
                            id="icon-button-active"
                            onClick={() => setOpen(true)}>
                            <BsPencil id="icon" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            id="icon-button"
                            onClick={() => {
                                store.dispatch(SET_TYPE(toolType.PEN))
                            }}>
                            <BsPencil id="icon" />
                        </button>
                    )}
                    {
                        // Palette Popup
                        open ? (
                            <div className="popup">
                                <div
                                    role="button"
                                    tabIndex="0"
                                    className="cover"
                                    onClick={() => setOpen(false)}
                                    onKeyPress={() => {}}
                                />
                                <StylePicker />
                            </div>
                        ) : null
                    }
                </div>
                {typeSelector === toolType.ERASER ? (
                    <button
                        style={{ color: colorSelector }}
                        type="button"
                        id="icon-button-active"
                        onClick={() => {
                            store.dispatch(SET_TYPE(toolType.ERASER))
                        }}>
                        <CgErase id="icon" />
                    </button>
                ) : (
                    <button
                        type="button"
                        id="icon-button"
                        onClick={() => {
                            store.dispatch(SET_TYPE(toolType.ERASER))
                        }}>
                        <CgErase id="icon" />
                    </button>
                )}
                <button
                    style={
                        typeSelector === toolType.DRAG
                            ? { color: colorSelector }
                            : null
                    }
                    type="button"
                    id={
                        typeSelector === toolType.DRAG
                            ? "icon-button-active"
                            : "icon-button"
                    }
                    onClick={() => {
                        store.dispatch(SET_TYPE(toolType.DRAG))
                    }}>
                    <CgController id="icon" />
                </button>
                <button
                    style={
                        typeSelector === toolType.LINE
                            ? { color: colorSelector }
                            : null
                    }
                    type="button"
                    id={
                        typeSelector === toolType.LINE
                            ? "icon-button-active"
                            : "icon-button"
                    }
                    onClick={() => {
                        store.dispatch(SET_TYPE(toolType.LINE))
                    }}>
                    <MdRemove id="icon" />
                </button>
                <button
                    style={
                        typeSelector === toolType.TRIANGLE
                            ? { color: colorSelector }
                            : null
                    }
                    type="button"
                    id={
                        typeSelector === toolType.TRIANGLE
                            ? "icon-button-active"
                            : "icon-button"
                    }
                    onClick={() => {
                        store.dispatch(SET_TYPE(toolType.TRIANGLE))
                    }}>
                    <CgShapeTriangle id="icon" />
                </button>
                <button
                    style={
                        typeSelector === toolType.CIRCLE
                            ? { color: colorSelector }
                            : null
                    }
                    type="button"
                    id={
                        typeSelector === toolType.CIRCLE
                            ? "icon-button-active"
                            : "icon-button"
                    }
                    onClick={() => {
                        store.dispatch(SET_TYPE(toolType.CIRCLE))
                    }}>
                    <CgShapeCircle id="icon" />
                </button>
            </div>
        </>
    )
}
