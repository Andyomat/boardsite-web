import { currentSession, isConnected } from "api/session"
import { backgroundStyle, PIXEL_RATIO } from "consts"
import { handleDeleteAllPages } from "drawing/handlers"
import { BoardPage } from "drawing/page"
import { ADD_PAGES, CLEAR_UNDO_REDO } from "redux/board/board"
import { DocumentSrc, PageSize } from "redux/board/board.types"
import store from "redux/store"
import { END_LOADING, START_LOADING } from "redux/loading/loading"
import { CLOSE_PAGE_ACTIONS } from "redux/menu/menu"
import { readFileAsUint8Array } from "redux/workspace"
import { handleLoadFromSource, toPDF } from "./io"

export const handleImportPdfFile = async (file: File): Promise<void> => {
    const origin = await getPdfFileSource(file)
    await handleLoadFromSource(origin)
    await handleAddPdfPages(origin)
    // clear the stacks when importing documents
    store.dispatch(CLEAR_UNDO_REDO())
}

const getPdfFileSource = async (file: File): Promise<URL | Uint8Array> =>
    isConnected()
        ? currentSession().addAttachment(file)
        : readFileAsUint8Array(file)

export const handleAddPdfPages = async (
    fileOriginSrc: DocumentSrc
): Promise<void> => {
    const { documentImages } = store.getState().board

    handleDeleteAllPages()

    if (isConnected()) {
        const pages = documentImages.map((img, i) =>
            new BoardPage().updateMeta({
                background: {
                    style: backgroundStyle.DOC,
                    attachURL: fileOriginSrc as URL,
                    documentPageNum: i,
                },
                size: getPageSize(img),
            })
        )

        currentSession().addPages(
            pages,
            pages.map(() => -1)
        )
    } else {
        const pages = documentImages.map((img, i) =>
            new BoardPage().updateMeta({
                background: {
                    style: backgroundStyle.DOC,
                    documentPageNum: i,
                },
                size: getPageSize(img),
            })
        )

        pages.forEach((page) => {
            store.dispatch(ADD_PAGES({ data: [{ page, index: -1 }] }))
        }) // append subsequent pages at the end
    }
}

export async function handleExportAsPdf(): Promise<void> {
    store.dispatch(START_LOADING({ messageId: "Loading.ExportingPdf" }))

    // Use small timeout to wait for loading animation render cycle
    setTimeout(async () => {
        const filename = "board.pdf" // TODO filename
        const { documentSrc } = store.getState().board

        if (isConnected()) {
            const [src] = await currentSession().getAttachment(
                documentSrc as string
            )
            toPDF(filename, src as Uint8Array)
        } else {
            toPDF(filename, documentSrc as Uint8Array)
        }

        store.dispatch(END_LOADING())
        store.dispatch(CLOSE_PAGE_ACTIONS())
    }, 50)
}

const getPageSize = (dataURL: string): PageSize => {
    const header = atob(dataURL.split(",")[1].slice(0, 50)).slice(16, 24)
    const uint8 = Uint8Array.from(header, (c) => c.charCodeAt(0))
    const dataView = new DataView(uint8.buffer)

    return {
        width: dataView.getInt32(0) / PIXEL_RATIO,
        height: dataView.getInt32(4) / PIXEL_RATIO,
    }
}
