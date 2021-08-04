import store from "../redux/store"
import {
    postPage,
    putPage,
    postSession,
    postUser,
    deletePage,
    getPages,
    getStrokes,
    getUsers,
    postAttachement,
} from "./request"
import {
    CREATE_WS,
    SET_SESSION_USERS,
    USER_CONNECT,
    USER_DISCONNECT,
} from "../redux/slice/webcontrol"
import {
    DELETE_ALL_PAGES,
    ADD_STROKES,
    SET_PAGERANK,
    ERASE_STROKES,
    CLEAR_PAGE,
    SET_PAGEMETA,
} from "../redux/slice/boardcontrol"
import {
    MessageType,
    Message,
    messages,
    ResponsePageSync,
    ResponsePageUpdate,
} from "./types"
import { PageMeta, Stroke, ToolType, User } from "../types"
import { BoardStroke } from "../component/board/stroke/stroke"
import { BoardPage } from "../drawing/page"

/**
 * Connect to Websocket.
 */
function createWebsocket(
    sessionId: string,
    user: User
): Promise<Event | undefined> {
    return new Promise((resolve, reject) => {
        const url = new URL(store.getState().webControl.apiURL.toString())
        url.protocol = url.protocol.replace("http", "ws")
        const ws = new WebSocket(
            `${url.toString()}b/${sessionId}/users/${user.id}/socket`
        )
        ws.onmessage = (msg) => {
            receive(JSON.parse(msg.data))
        }
        ws.onopen = () => {
            store.dispatch(CREATE_WS({ ws, sessionId, user }))
            resolve(undefined)
        }
        ws.onerror = (ev) => reject(ev)
    })
}

function send(type: MessageType, content: unknown): void {
    const message: Message<typeof content> = {
        type,
        sender: store.getState().webControl.user.id,
        content,
    }
    const ws = store.getState().webControl.webSocket as WebSocket
    ws.send(JSON.stringify(message))
}

/**
 * Receive a message via websocket connection.
 */
function receive(message: Message<unknown>) {
    switch (message.type) {
        case messages.Stroke:
            receiveStrokes(message.content as Stroke[])
            break

        case messages.PageSync:
            syncPages(message.content as ResponsePageSync)
            break

        case messages.PageUpdate:
            updatePageMeta(message.content as ResponsePageUpdate)
            break

        case messages.UserConnected:
            store.dispatch(USER_CONNECT(message.content))
            break

        case messages.UserDisconnected:
            store.dispatch(USER_DISCONNECT(message.content))
            break

        default:
            break
    }
}

function receiveStrokes(strokes: Stroke[]) {
    strokes.forEach((stroke) => {
        if (stroke.type > 0) {
            // add stroke, IMPORTANT: create BoardStroke instance
            store.dispatch(ADD_STROKES([new BoardStroke(stroke)]))
        } else if (stroke.type === 0) {
            // delete stroke
            store.dispatch(ERASE_STROKES([stroke]))
        }
    })
}

function syncPages({ pageRank, meta }: ResponsePageSync) {
    store.dispatch(SET_PAGERANK(pageRank))
    Object.keys(meta).forEach((pageId) =>
        store.dispatch(SET_PAGEMETA({ pageId, meta: meta[pageId] }))
    )
}

function updatePageMeta({ pageId, meta, clear }: ResponsePageUpdate) {
    if (clear) {
        store.dispatch(CLEAR_PAGE(pageId))
    }
    store.dispatch(SET_PAGEMETA({ pageId, meta }))
}

export function isConnected(): boolean {
    return (
        store.getState().webControl.sessionId !== "" &&
        store.getState().webControl.webSocket != null &&
        store.getState().webControl.webSocket.readyState === WebSocket.OPEN
    )
}

export async function newSession(): Promise<string> {
    const sessionId = await postSession()
    store.dispatch(DELETE_ALL_PAGES())
    // create a pageid which will be added when joining
    await postPage(sessionId, new BoardPage(), 0)
    return sessionId
}

export async function joinSession(
    sessionId = store.getState().webControl.sessionDialog.sidInput,
    alias = store.getState().webControl.user.alias,
    color = store.getState().webControl.user.color
): Promise<void> {
    // create a new user for us
    const user = await postUser(sessionId, { alias, color } as User)
    await createWebsocket(sessionId, user)

    store.dispatch(SET_SESSION_USERS(await getUsers(sessionId)))

    // set the pages according to api
    store.dispatch(DELETE_ALL_PAGES())
    const { pageRank, meta } = await getPages(sessionId)
    syncPages({ pageRank, meta })

    // fetch data from each page
    pageRank.forEach(async (pageId) => {
        let strokes = await getStrokes(sessionId, pageId)
        // IMPORTANT: create BoardStroke instance
        strokes = strokes.map((stroke) => new BoardStroke(stroke))
        store.dispatch(ADD_STROKES(strokes))
    })
}

export function sendStrokes(strokes: Stroke[]): void {
    // append the user id to strokes
    send(
        messages.Stroke,
        strokes.map((s) => ({
            ...s.serialize?.(),
            userId: store.getState().webControl.user.id,
        }))
    )
}

export function eraseStrokes(strokes: { id: string; pageId: string }[]): void {
    send(
        messages.Stroke,
        strokes.map((s) => ({
            id: s.id,
            pageId: s.pageId,
            type: ToolType.Eraser,
            userId: store.getState().webControl.user.id,
        }))
    )
}

export function addPageSession(page: BoardPage, pageIndex: number): void {
    postPage(store.getState().webControl.sessionId, page, pageIndex)
}

export function deletePageSession(pageId: string): void {
    deletePage(store.getState().webControl.sessionId, pageId)
}

// returns the relative path to the session
// based on either the sessionID or the URL
export function getSessionPath(sessionURL: string): string {
    const url = sessionURL.split("/")
    return `/b/${url[url.length - 1]}`
}

export function pingSession(sessionID: string): Promise<ResponsePageSync> {
    return getPages(sessionID)
}

export function updatePageSession(
    pageId: string,
    meta: PageMeta | undefined,
    clear = false
): void {
    putPage(store.getState().webControl.sessionId, pageId, meta, clear)
}

export function addAttachementSession(file: File): Promise<string> {
    return postAttachement(store.getState().webControl.sessionId, file)
}

export function getAttachmentURL(attachId: string): URL {
    const { apiURL, sessionId } = store.getState().webControl
    return new URL(attachId, `${apiURL.toString()}b/${sessionId}/attachments/`)
}
