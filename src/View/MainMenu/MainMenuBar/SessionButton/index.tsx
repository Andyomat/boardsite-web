import React, { memo } from "react"
import { BsPeople } from "react-icons/bs"
import { useOnline } from "state/online"
import { SessionStatus, StyledMainMenuButton } from "./index.styled"

const SessionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> =
    memo((props) => {
        const { session } = useOnline()
        return (
            <StyledMainMenuButton type="button" {...props}>
                <BsPeople className="external-icon" />
                <SessionStatus>
                    {session?.getNumberOfUsers() || "+"}
                </SessionStatus>
            </StyledMainMenuButton>
        )
    })
export default SessionButton
