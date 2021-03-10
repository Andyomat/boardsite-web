import React, { useState } from "react"
import { BsGear } from "react-icons/bs"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
// import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import { Grid } from "@material-ui/core"
import store from "../../../redux/store"
import { SET_DEFAULT_PAGEBG } from "../../../redux/slice/drawcontrol"
import { pageType } from "../../../constants"

export default function PageSettings({ setOpenOther }) {
    const [open, setOpen] = useState(false)

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setOpenOther(false)
    }

    const handleClickBlank = () => {
        store.dispatch(SET_DEFAULT_PAGEBG(pageType.BLANK))
        handleClose()
    }

    const handleClickCheckered = () => {
        store.dispatch(SET_DEFAULT_PAGEBG(pageType.CHECKERED))
        handleClose()
    }

    const handleClickRuled = () => {
        store.dispatch(SET_DEFAULT_PAGEBG(pageType.RULED))
        handleClose()
    }

    return (
        <>
            <button type="button" id="icon-button" onClick={handleClickOpen}>
                <BsGear id="icon" />
            </button>
            <Dialog
                maxWidth="xs"
                fullWidth
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">
                    Select page background style
                </DialogTitle>
                <DialogContent>
                    <Grid
                        item
                        container
                        spacing={2}
                        direction="row"
                        justify="center"
                        alignItems="center">
                        <Grid item>
                            <button
                                type="button"
                                onClick={handleClickBlank}
                                className="page-blank"
                            />
                        </Grid>
                        <Grid item>
                            <button
                                type="button"
                                onClick={handleClickCheckered}
                                className="page-checkered"
                            />
                        </Grid>
                        <Grid item>
                            <button
                                type="button"
                                onClick={handleClickRuled}
                                className="page-ruled"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
