import { useState } from "react";
import React, { Component } from "react";

function ToggleDiv(props) {
    const [isShow, setIsShow] = useState(false);
    return (
        <>
            <div style={{}} onClick={() => setIsShow(!isShow)}>
                <h4
                    style={{
                        color: "#BBBBBB",
                        textAlign: "left",
                    }}
                >
                    {isShow ? "▼" : "▶"} {props.title}
                </h4>
            </div>
            <div
                style={{
                    height: isShow ? "auto" : "0px",
                    overflow: "hidden",
                }}
            >
                {props.subComponent}
            </div>
        </>
    );
}

export default ToggleDiv;
