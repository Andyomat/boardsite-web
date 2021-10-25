import localforage from "localforage"
import * as boardState from "./board/state"
import * as drawingState from "./drawing/state"
import { RootState, SerializableState } from "./types"

const debounceTime = 1000
const namespace = "boardsite"
let debounceTimeout: NodeJS.Timeout

localforage.config({
    name: namespace,
    driver: localforage.INDEXEDDB,
})

export function saveLocalStore(
    rootState: { [name: string]: object },
    ...states: string[]
): void {
    debounce(() => {
        save(rootState, states, localStorage)
    })
}

export function saveIndexedDB(
    rootState: { [name: string]: object },
    ...states: string[]
): void {
    debounce(() => {
        save(rootState, states, localforage)
    })
}

function save(
    rootState: { [name: string]: object },
    states: string[],
    storage: Storage | LocalForage
) {
    states.forEach((name) => {
        const serializableState = rootState[name] as SerializableState
        storage.setItem(
            `${namespace}_${name}`,
            serializableState.serialize?.() as string
        )
    })
}

export function loadLocalStorage(...states: string[]): RootState {
    const state: { [name: string]: object | undefined } = {}
    states.forEach((name) => {
        try {
            const val = localStorage.getItem(`${namespace}_${name}`)
            if (val) {
                state[name] = newState(name)?.deserialize?.(val)
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err)
        }
    })
    return state as RootState
}

export async function loadIndexedDB(...states: string[]): Promise<RootState> {
    const state: { [name: string]: object | undefined } = {}
    const res = states.map(async (name) => {
        try {
            const val = await localforage.getItem(`${namespace}_${name}`)
            if (val) {
                state[name] = newState(name)?.deserialize?.(val as string)
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err)
        }
    })
    await Promise.all(res)
    return state as RootState
}

function debounce(callback: () => void): void {
    if (debounceTimeout) {
        clearTimeout(debounceTimeout)
    }

    // Save to LocalStorage after the debounce period has elapsed
    debounceTimeout = setTimeout(() => {
        callback()
    }, debounceTime)
}

function newState(stateName: string): SerializableState | undefined {
    switch (stateName) {
        case "board":
            return boardState.newState()

        case "drawing":
            return drawingState.newState()

        default:
            return undefined
    }
}
