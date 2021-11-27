import React from "react"
import { useCustomSelector } from "hooks"
import {
    SessionInfoWrapper,
    UserAlias,
    UserColor,
    UserInfo,
} from "./sessioninfo.styled"

const SessionInfo: React.FC = () => {
    const userInfo = useCustomSelector((state) => state.session.connectedUsers)
    return (
        <SessionInfoWrapper>
            {Object.keys(userInfo).map((userId) => {
                const { alias, color, id } = userInfo[userId]
                return (
                    <UserInfo key={id}>
                        <UserColor $color={color} />
                        <UserAlias>{alias}</UserAlias>
                    </UserInfo>
                )
            })}
        </SessionInfoWrapper>
    )
}

export default SessionInfo
