import React, { useState } from "react"
import { UploadIcon } from "components"
import { handleDocument } from "drawing/handlers"
import { InvisibleInput, DropZone, InfoText } from "./filedropzone.styled"

interface FileDropZoneProps {
    closeDialog: () => void
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ closeDialog }) => {
    const [hovering, setHovering] = useState<boolean>(false)

    const isValidFormat = (file: File) => file.type === "application/pdf"

    const processFile = (file: File) => {
        if (isValidFormat(file)) {
            handleDocument(file).then(() => closeDialog())
        } else {
            // TODO: invalid file type message
        }
    }

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault() // Prevent file from being opened
        setHovering(true)
    }

    const onDragLeave = () => {
        setHovering(false)
    }

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault() // Prevent file from being opened
        setHovering(false)
        const file = e.dataTransfer.items[0].getAsFile()
        if (file) {
            processFile(file)
        }
    }

    const onInput = (e: React.SyntheticEvent) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    return (
        <>
            <DropZone
                onClick={() => document.getElementById("selectedFile")?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                $hovering={hovering}>
                <UploadIcon />
                <InfoText>
                    {hovering
                        ? "Release to upload"
                        : "Click to browse files or drag and drop a PDF file here"}
                </InfoText>
            </DropZone>
            <InvisibleInput
                type="file"
                accept="application/pdf"
                id="selectedFile"
                onInput={onInput}
            />
        </>
    )
}

export default FileDropZone
