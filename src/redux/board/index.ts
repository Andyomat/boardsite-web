import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { pick, keys, assign, cloneDeep } from "lodash"
import {
    centerView,
    fitToPage,
    initialView,
    resetView,
    zoomCenter,
} from "drawing/stage"
import { Stroke } from "drawing/stroke/index.types"
import {
    addAction,
    deleteStrokes,
    redoAction,
    undoAction,
    addOrUpdateStrokes,
    addPages,
    deletePages,
    clearPages,
    updatePages,
} from "./undoredo"
import { newState } from "./state"
import {
    AddAttachments,
    AddPageData,
    AddPages,
    AddStrokes,
    BoardState,
    ClearPages,
    DeleteAttachments,
    DeletePages,
    EraseStrokes,
    JumpToPageWithIndex,
    LoadBoardState,
    MoveShapesToDragLayer,
    Page,
    SetPageBackground,
    SetPageMeta,
    SyncPages,
    SetPageSize,
    SetStageAttrs,
} from "./index.types"

const boardSlice = createSlice({
    name: "board",
    initialState: newState(),
    reducers: {
        LOAD_BOARD_STATE: (state, action: PayloadAction<LoadBoardState>) => {
            assign(state, pick(action.payload, keys(state)))
        },

        SYNC_PAGES: (state, action: PayloadAction<SyncPages>) => {
            const { pageRank, pageCollection } = action.payload
            state.pageRank = pageRank
            state.pageCollection = pageCollection

            // Adjust view if necessary
            if (state.currentPageIndex > pageRank.length - 1) {
                state.currentPageIndex = pageRank.length - 1
                initialView(state)
            }

            state.triggerStrokesRender?.()
        },

        SET_PAGEMETA: (state, action: PayloadAction<SetPageMeta>) => {
            const {
                data: pageUpdates,
                isRedoable,
                sessionHandler,
                sessionUndoHandler,
            } = action.payload

            // make a copy of old page meta
            const pages = pageUpdates.map<Pick<Page, "pageId" | "meta">>(
                (page) =>
                    cloneDeep(
                        pick(state.pageCollection[page.pageId], [
                            "pageId",
                            "meta",
                        ])
                    )
            )

            const handler = (boardState: BoardState) => {
                updatePages(boardState, ...pageUpdates)
                sessionHandler?.()
            }

            const undoHandler = (boardState: BoardState) => {
                updatePages(boardState, ...pages)
                sessionUndoHandler?.(...pages)
            }

            addAction({
                handler,
                undoHandler,
                stack: state.undoStack,
                isRedoable,
                state,
                isNew: true,
            })

            state.triggerStrokesRender?.()
        },

        SET_PAGE_BACKGROUND: (
            state,
            action: PayloadAction<SetPageBackground>
        ) => {
            const style = action.payload
            state.pageMeta.background.style = style
        },

        SET_PAGE_SIZE: (state, action: PayloadAction<SetPageSize>) => {
            state.pageMeta.size = action.payload
            state.triggerStrokesRender?.()
        },

        ADD_PAGES: (state, action: PayloadAction<AddPages>) => {
            const {
                data: addPageData,
                isRedoable,
                sessionHandler,
                sessionUndoHandler,
            } = action.payload

            const handler = (boardState: BoardState) => {
                addPages(boardState, ...addPageData)
                sessionHandler?.()
            }

            const undoHandler = (boardState: BoardState) => {
                const pageIds = addPageData.map(({ page }) => page.pageId)
                deletePages(boardState, ...pageIds)
                sessionUndoHandler?.()
            }

            addAction({
                handler,
                undoHandler,
                stack: state.undoStack,
                isRedoable,
                state,
                isNew: true,
            })

            state.triggerStrokesRender?.()
            initialView(state)
        },

        CLEAR_PAGES: (state, action: PayloadAction<ClearPages>) => {
            const {
                data: pageIds,
                isRedoable,
                sessionHandler,
                sessionUndoHandler,
            } = action.payload

            // make a copy of cleared strokes
            const strokes = pageIds
                .map((pid) => cloneDeep(state.pageCollection[pid]))
                .filter((page) => page !== undefined)
                .reduce<Stroke[]>(
                    (arr, page) => arr.concat(Object.values(page.strokes)),
                    []
                )

            const handler = (boardState: BoardState) => {
                clearPages(boardState, ...pageIds)
                sessionHandler?.()
            }

            const undoHandler = (boardState: BoardState) => {
                addOrUpdateStrokes(boardState, ...strokes)
                sessionUndoHandler?.(...strokes)
            }

            addAction({
                handler,
                undoHandler,
                stack: state.undoStack,
                isRedoable,
                state,
                isNew: true,
            })

            state.triggerStrokesRender?.()
        },

        DELETE_PAGES: (state, action: PayloadAction<DeletePages>) => {
            const {
                data: pageIds,
                isRedoable,
                sessionHandler,
                sessionUndoHandler,
            } = action.payload

            const addPageData = pageIds
                .map<AddPageData>((pid) => ({
                    page: state.pageCollection[pid],
                }))
                .filter(({ page }) => page !== undefined)
            const pageRank = [...state.pageRank]

            const handler = (boardState: BoardState) => {
                deletePages(boardState, ...pageIds)
                sessionHandler?.()
            }

            const undoHandler = (boardState: BoardState) => {
                // set pagerank manually as it was before deletion
                boardState.pageRank = pageRank
                addPages(boardState, ...addPageData)
                sessionUndoHandler?.(...addPageData)
            }

            addAction({
                handler,
                undoHandler,
                stack: state.undoStack,
                isRedoable,
                state,
                isNew: true,
            })

            if (!state.pageRank.length) {
                // All pages have been deleted so view and index can be reset
                state.currentPageIndex = 0
                initialView(state)
            } else if (state.currentPageIndex > state.pageRank.length - 1) {
                // Deletions have caused the current page index to exceed
                // the page limit, therefore we move to the last page
                state.currentPageIndex = state.pageRank.length - 1
                initialView(state)
            }

            // Make sure that transform is cleared when page is deleted
            state.clearTransform?.()
            state.triggerStrokesRender?.()
        },

        // Reset everything except page meta settings
        DELETE_ALL_PAGES: (state) => ({
            ...newState(),
            pageMeta: state.pageMeta,
        }),

        CLEAR_UNDO_REDO: (state) => {
            state.undoStack = []
            state.redoStack = []
        },

        CLEAR_TRANSFORM: (state) => {
            state.clearTransform?.()
        },

        // sets the currently selected strokes
        MOVE_SHAPES_TO_DRAG_LAYER: (
            state,
            action: PayloadAction<MoveShapesToDragLayer>
        ) => {
            const { strokes, pagePosition } = action.payload

            if (pagePosition) {
                state.transformPagePosition = pagePosition
            }

            state.transformStrokes = strokes
        },

        // Add strokes to collection
        ADD_STROKES: (state, action: PayloadAction<AddStrokes>) => {
            const {
                data: strokes,
                isRedoable,
                sessionHandler,
                sessionUndoHandler,
                isUpdate,
            } = action.payload

            strokes.sort((a, b) => ((a.id ?? "") > (b.id ?? "") ? 1 : -1))

            const handler = (boardState: BoardState) => {
                addOrUpdateStrokes(boardState, ...strokes)
                sessionHandler?.()
            }

            let undoHandler = (boardState: BoardState) => {
                deleteStrokes(boardState, ...strokes)
                sessionUndoHandler?.()
            }

            if (isUpdate) {
                const addUpdateStartPoint = state.undoStack?.pop()?.handler

                if (addUpdateStartPoint) {
                    undoHandler = addUpdateStartPoint
                }
            }

            addAction({
                handler,
                undoHandler,
                stack: state.undoStack,
                isRedoable,
                state,
                isNew: true,
            })

            state.triggerStrokesRender?.()
        },

        // Erase strokes from collection
        ERASE_STROKES(state, action: PayloadAction<EraseStrokes>) {
            const {
                data: strokes,
                isRedoable,
                sessionHandler,
                sessionUndoHandler,
            } = action.payload

            const handler = (boardState: BoardState) => {
                deleteStrokes(boardState, ...strokes)
                sessionHandler?.()
            }

            const undoHandler = (boardState: BoardState) => {
                addOrUpdateStrokes(boardState, ...strokes)
                sessionUndoHandler?.()
            }

            addAction({
                handler,
                undoHandler,
                stack: state.undoStack,
                isRedoable,
                state,
                isNew: true,
            })

            state.triggerStrokesRender?.()
        },

        ADD_ATTACHMENTS: (state, action: PayloadAction<AddAttachments>) => {
            const attachments = action.payload
            attachments.forEach((attachment) => {
                state.attachments[attachment.id] = attachment
            })
        },

        DELETE_ATTACHMENTS: (
            state,
            action: PayloadAction<DeleteAttachments>
        ) => {
            const attachIds = action.payload
            attachIds.forEach((attachId) => {
                delete state.attachments[attachId]
            })
        },

        CLEAR_ATTACHMENTS: (state) => {
            state.attachments = {}
        },

        UNDO_ACTION: (state) => {
            undoAction(state as BoardState)
            state.triggerStrokesRender?.()
        },

        REDO_ACTION: (state) => {
            redoAction(state as BoardState)
            state.triggerStrokesRender?.()
        },

        DECREMENT_PAGE_INDEX: (state) => {
            state.currentPageIndex -= 1
            state.clearTransform?.()
        },

        INCREMENT_PAGE_INDEX: (state) => {
            state.currentPageIndex += 1
            state.clearTransform?.()
        },

        JUMP_TO_NEXT_PAGE: (state) => {
            if (state.currentPageIndex < state.pageRank.length - 1) {
                state.currentPageIndex += 1
                initialView(state)
            }
        },

        JUMP_TO_PREV_PAGE: (state) => {
            if (state.currentPageIndex > 0) {
                state.currentPageIndex -= 1
                initialView(state)
            }
        },

        JUMP_TO_FIRST_PAGE: (state) => {
            state.currentPageIndex = 0
            initialView(state)
        },

        JUMP_TO_LAST_PAGE: (state) => {
            state.currentPageIndex = state.pageRank.length - 1
            initialView(state)
        },

        JUMP_TO_PAGE_WITH_INDEX: (
            state,
            action: PayloadAction<JumpToPageWithIndex>
        ) => {
            const targetIndex = action.payload

            if (targetIndex <= state.pageRank.length - 1 && targetIndex >= 0) {
                state.currentPageIndex = targetIndex
            }
            state.triggerStageRender?.()
        },

        TOGGLE_SHOULD_CENTER: (state) => {
            state.stage.keepCentered = !state.stage.keepCentered
        },

        RESET_VIEW: (state) => {
            resetView(state)
        },

        SET_STAGE_ATTRS: (state, action: PayloadAction<SetStageAttrs>) => {
            assign(
                state.stage.attrs,
                pick(action.payload, keys(state.stage.attrs))
            )
        },

        ON_WINDOW_RESIZE: (state) => {
            state.stage.attrs.width = window.innerWidth
            state.stage.attrs.height = window.innerHeight
            centerView(state)
            state.triggerStageRender?.()
        },

        FIT_WIDTH_TO_PAGE: (state) => {
            fitToPage(state)
            state.triggerStageRender?.()
        },

        ZOOM_IN_CENTER: (state) => {
            zoomCenter(state, true)
            state.triggerStageRender?.()
        },

        ZOOM_OUT_CENTER: (state) => {
            zoomCenter(state, false)
            state.triggerStageRender?.()
        },

        TRIGGER_BOARD_RERENDER: (state) => {
            state.triggerStrokesRender?.()
        },
    },
})

export const {
    LOAD_BOARD_STATE,
    SYNC_PAGES,
    ADD_PAGES,
    SET_PAGEMETA,
    CLEAR_PAGES,
    DELETE_PAGES,
    DELETE_ALL_PAGES,
    MOVE_SHAPES_TO_DRAG_LAYER,
    ADD_STROKES,
    ERASE_STROKES,
    ADD_ATTACHMENTS,
    DELETE_ATTACHMENTS,
    CLEAR_ATTACHMENTS,
    UNDO_ACTION,
    REDO_ACTION,
    CLEAR_UNDO_REDO,
    CLEAR_TRANSFORM,
    SET_PAGE_BACKGROUND,
    SET_PAGE_SIZE,
    DECREMENT_PAGE_INDEX,
    INCREMENT_PAGE_INDEX,
    JUMP_TO_PREV_PAGE,
    JUMP_TO_NEXT_PAGE,
    JUMP_TO_FIRST_PAGE,
    JUMP_TO_LAST_PAGE,
    JUMP_TO_PAGE_WITH_INDEX,
    TOGGLE_SHOULD_CENTER,
    RESET_VIEW,
    ON_WINDOW_RESIZE,
    SET_STAGE_ATTRS,
    FIT_WIDTH_TO_PAGE,
    ZOOM_IN_CENTER,
    ZOOM_OUT_CENTER,
    TRIGGER_BOARD_RERENDER,
} = boardSlice.actions
export default boardSlice.reducer
