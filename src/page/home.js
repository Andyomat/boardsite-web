import { Button, Container, TextField } from '@material-ui/core';
import React, { useRef, useEffect } from 'react';

// https://developer.aliyun.com/mirror/npm/package/material-ui-rc-color-picker
import ColorPicker from 'material-ui-rc-color-picker';
import 'material-ui-rc-color-picker/assets/index.css';
import { green } from '@material-ui/core/colors';

function Home() {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const colorRef = useRef("#ffffff");
    let blockColor = "#000000";

    // initialize the canvas context
    useEffect(() => {
        // assign the width and height to canvas
        const canvasEle = canvasRef.current;
        canvasEle.width = 500; //canvasEle.clientWidth;
        canvasEle.height = 500; //canvasEle.clientHeight;

        // get context of the canvas
        ctxRef.current = canvasEle.getContext("2d");
        let canvasElem = document.querySelector("canvas");

        canvasElem.addEventListener("mousedown", (e) => {
            let [click_x, click_y] = getMousePosition(canvasElem, e);
            let block_size = 50;
            click_x = click_x - click_x % block_size;
            click_y = click_y - click_y % block_size;
            //console.log(colorRef.current.value)
            //drawFillRect({ x: click_x, y: click_y, w: block_size, h: block_size }, { backgroundColor: colorRef.current.value, borderWidth: 0 });
            drawFillRect({ x: click_x, y: click_y, w: block_size, h: block_size }, { backgroundColor: blockColor, borderWidth: 0 });
        });
    }, []);

    // draw rectangle
    // const drawRect = (info, style = {}) => {
    //     const { x, y, w, h } = info;
    //     const { borderColor = 'black', borderWidth = 1 } = style;

    //     ctxRef.current.beginPath();
    //     ctxRef.current.strokeStyle = borderColor;
    //     ctxRef.current.lineWidth = borderWidth;
    //     ctxRef.current.rect(x, y, w, h);
    //     ctxRef.current.stroke();
    // }

    // draw rectangle with background
    const drawFillRect = (info, style = {}) => {
        const { x, y, w, h } = info;
        const { backgroundColor = 'black' } = style;

        ctxRef.current.beginPath();
        ctxRef.current.fillStyle = backgroundColor;
        ctxRef.current.fillRect(x, y, w, h);
    }

    function clearCanvas() {
        let canvasElem = document.querySelector("canvas");
        ctxRef.current.clearRect(0, 0, canvasElem.width, canvasElem.height);
    }

    function getMousePosition(canvas, event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        return [x, y];
    }

    function onColorChange(color) {
        blockColor = color.color;
        colorRef.current.value = color.color;
    }

    return (
        <Container maxWidth="lg">
            <h1>Home</h1>
            <div className="homediv">
                <div className="canvasdiv">
                    <canvas ref={canvasRef}> </canvas>
                </div>
                <div className="toolbar">
                    <Button variant="contained" color="primary" onClick={() => clearCanvas()}>Clear</Button>
                    <TextField inputRef={colorRef} id="outlined-basic" label="" variant="outlined" />
                    <div className="colorpicker">
                        <ColorPicker
                            enableAlpha={false}
                            color={blockColor}
                            onChange={(color) => onColorChange(color)}
                            onClose={(color) => onColorChange(color)}
                            mode="RGB"
                            placement="topLeft"
                        />
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default Home;
