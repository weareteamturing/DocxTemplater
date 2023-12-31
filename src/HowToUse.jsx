import { useState } from "react";
import React, { Component } from "react";

import ToggleDiv from "./Toggle";

function HowToUse() {
    return (
        <>
            <h2>How to use</h2>
            <ToggleDiv
                title="1. Template.docx 파일과 csv 파일을 예시와 같이 작성"
                subComponent={
                    <div>
                        <img src="template_example.png" />
                    </div>
                }
            />
            <ToggleDiv title="2. docx, csv를 선택" subComponent={<div></div>} />
            <ToggleDiv
                title="3. output file format을 원하는 포맷으로 작성"
                subComponent={
                    <div>
                        <img src="output_format_example.png" />
                        <li style={{ textAlign: "left" }}>
                            기본적으로 csv의 열 순서를 나타내는 <b>{`{rowNum}`}</b>을 사용할 수
                            있습니다.
                        </li>
                        <li style={{ textAlign: "left" }}>
                            <b>{`{contracteeName}`}</b>과 같이 csv의 열 이름을 사용할 수 있습니다.
                        </li>
                    </div>
                }
            />
            <ToggleDiv
                title="4. Generate documents로 docx 파일들을 생성"
                subComponent={
                    <div>
                        <img src="template_result.png" />
                    </div>
                }
            />
        </>
    );
}

export default HowToUse;
