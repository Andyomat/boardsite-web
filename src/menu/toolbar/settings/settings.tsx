import React, { useState } from "react"
import { BsGear, BsInfoCircle } from "react-icons/bs"
import isElectron from "is-electron"
import { VscDebugDisconnect } from "react-icons/vsc"
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Switch,
    TextField,
} from "@material-ui/core"
import store from "redux/store"
import { Divider, Drawer, IconButton } from "components"
import { SET_API_URL } from "redux/slice/webcontrol"
import {
    TOGGLE_HIDE_NAVBAR,
    TOGGLE_SHOULD_CENTER,
} from "redux/slice/viewcontrol"
import { TOGGLE_DIRECTDRAW } from "redux/slice/drawcontrol"
import { isConnected } from "api/websocket"
import { useCustomSelector } from "redux/hooks"
import { API_URL } from "../../../api/types"
import isDev from "../../../constants"
import About from "../about/about"

const Settings: React.FC = () => {
    const [isOpen, setOpen] = useState(false)
    const [url, setURL] = useState(API_URL)
    const [isValidURL, setValidURL] = useState(true)
    // about dialog
    const [isOpenAbout, setOpenAbout] = useState(false)

    const keepCentered = useCustomSelector(
        (state) => state.viewControl.keepCentered
    )
    const hideNavBar = useCustomSelector(
        (state) => state.viewControl.hideNavBar
    )
    const directDraw = useCustomSelector(
        (state) => state.drawControl.directDraw
    )
    // const apiURL = useAppSelector((state) => state.webControl.apiURL)

    const handleURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setURL(event.target.value)
        try {
            const u = new URL(event.target.value)
            store.dispatch(SET_API_URL(u))
            setValidURL(true)
        } catch {
            setValidURL(false)
        }
    }

    return (
        <>
            <IconButton onClick={() => setOpen(true)}>
                <BsGear id="icon" />
            </IconButton>
            <Drawer open={isOpen} onClose={() => setOpen(false)}>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <BsGear />
                        </ListItemIcon>
                        <ListItemText primary="General Settings" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Keep view centered" />
                        <Switch
                            checked={keepCentered}
                            onChange={() =>
                                store.dispatch(TOGGLE_SHOULD_CENTER())
                            }
                            name="jason"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Hide navigation bar" />
                        <Switch
                            checked={hideNavBar}
                            onChange={() =>
                                store.dispatch(TOGGLE_HIDE_NAVBAR())
                            }
                            name="jason"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Enable Direct Drawing" />
                        <Switch
                            checked={directDraw}
                            onChange={() => store.dispatch(TOGGLE_DIRECTDRAW())}
                            name="jason"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <VscDebugDisconnect />
                        </ListItemIcon>
                        <ListItemText primary="Connection" />
                    </ListItem>
                    <ListItem>
                        <TextField
                            id="standard-basic"
                            label="API URL"
                            inputMode="url"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={url.toString()}
                            onChange={handleURLChange}
                            error={!isValidURL}
                            disabled={
                                isConnected() || (!isDev() && !isElectron())
                            }
                        />
                    </ListItem>
                </List>
                <Divider />
                <List>
                    <ListItem
                        button
                        onClick={() => {
                            setOpen(false)
                            setOpenAbout(true)
                        }}>
                        <ListItemIcon>
                            <BsInfoCircle />
                        </ListItemIcon>
                        <ListItemText primary="About boardsite.io" />
                    </ListItem>
                </List>
            </Drawer>

            <About isOpen={isOpenAbout} setOpen={setOpenAbout} />
        </>
    )
}

export default Settings
