import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IntlMessageKeys } from "language"

type LoadingInfo = {
    messageId: IntlMessageKeys
}

export interface LoadingState {
    isLoading: boolean
    loadingInfo: LoadingInfo
}

const initState: LoadingState = {
    isLoading: false,
    loadingInfo: { messageId: "Loading.ExportingPdf" },
}

const loadingSlice = createSlice({
    name: "loading",
    initialState: initState,
    reducers: {
        START_LOADING: (state, action: PayloadAction<LoadingInfo>) => {
            state.loadingInfo = action.payload
            state.isLoading = true
        },
        END_LOADING: (state) => {
            state.isLoading = false
        },
    },
})

export const { START_LOADING, END_LOADING } = loadingSlice.actions
export default loadingSlice.reducer
