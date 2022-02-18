import { pageSize } from "consts"
import { Point } from "drawing/stroke/index.types"
import { ViewTransform } from "state/view/state/index.types"
import { online } from "state/online"
import { view } from "state/view"
import { menu } from "state/menu"
import { MainMenuState } from "state/menu/state/index.types"
import { DialogState } from "state/online/state/index.types"
import { board } from "state/board"
import { PageSize } from "state/board/state/index.types"

export const getCenterOfScreen = () => ({
    x: getCenterX(),
    y: getCenterY(),
})

export const getCenterX = (): number => window.innerWidth / 2

export const getCenterY = (): number => window.innerHeight / 2

export const getViewCenterX = (viewTransform: ViewTransform): number =>
    applyTransform1D(getCenterX(), viewTransform.scale, viewTransform.xOffset)

export const getViewCenterY = (viewTransform: ViewTransform): number =>
    applyTransform1D(getCenterY(), viewTransform.scale, viewTransform.yOffset)

export const applyTransform1D = (x: number, scale: number, offset: number) =>
    x - scale * offset

export const applyTransformToPoint = (
    point: Point,
    transform: ViewTransform
): Point => ({
    x: applyTransform1D(point.x, transform.scale, transform.xOffset),
    y: applyTransform1D(point.y, transform.scale, transform.yOffset),
})

export const getPageSize = (indexOffset = 0): PageSize => {
    const { pageRank, currentPageIndex, pageCollection } = board.getState()
    const pageId = pageRank[currentPageIndex + indexOffset]

    return pageCollection[pageId]?.meta?.size ?? pageSize.a4landscape
}

export const onFirstPage = (): boolean =>
    board.getState().currentPageIndex === 0

export const onLastPage = (): boolean =>
    board.getState().currentPageIndex === board.getState().pageRank.length - 1

export const isMenuOpen = () =>
    menu.getState().mainMenuState !== MainMenuState.Closed ||
    menu.getState().shortcutsOpen ||
    online.getState().dialogState !== DialogState.Closed

export const isFullScreen = () => {
    const effectivePageWidth =
        getPageSize().width * view.getViewTransform().scale
    return effectivePageWidth > window.innerWidth
}

export const newOffsetY = (newScale: number, yFixed: number): number => {
    const { scale, yOffset } = view.getViewTransform()

    return yOffset + yFixed / newScale - yFixed / scale
}
