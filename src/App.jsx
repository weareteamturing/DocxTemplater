import React, { Component} from "react";
import { useState, useEffect } from "react";
import "./App.css";

import { saveAs } from "file-saver";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

import HowToUse from "./HowToUse";

function loadArrayBufferFromFile(file, callback) {
    var reader = new FileReader();
    reader.onloadend = function (e) {
        var arrayBuffer = e.target.result;
        callback(null, arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
}

// CSV 파싱을 위한 개선된 함수
function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];
    const headers = parseCSVLine(lines[0]);
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; // 빈 줄 스킵
        
        const values = parseCSVLine(lines[i]);
        const obj = {};
        
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = values[j] ? values[j].trim() : '';
        }
        
        result.push(obj);
    }
    
    return result;
}

// 한 줄의 CSV를 파싱하는 함수 (쉼표가 포함된 필드 처리)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // 이스케이프된 따옴표
                current += '"';
                i++; // 다음 따옴표 건너뛰기
            } else {
                // 따옴표 시작/종료
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // 필드 구분자
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // 마지막 필드 추가
    result.push(current);
    
    return result;
}

// 기존 loadCsvDataFromFile 함수를 다음과 같이 수정
function loadCsvDataFromFile(file, callback) {
    var reader = new FileReader();
    reader.onloadend = function (e) {
        const content = e.target.result;
        try {
            const data = parseCSV(content);
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    };
    reader.readAsText(file);
}

function parseOutputFileName(formatString, originalFileName, rowNum, data) {
    const fileName = formatString
        .replace("{originalFileName}", originalFileName)
        .replace("{rowNum}", rowNum);
    return fileName.replace(/{([^}]+)}/g, function (_, key) {
        return data[key];
    });
}


const getIsMobile = () => window.innerWidth <= 1000;

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(getIsMobile());

    useEffect(() => {
        const onResize = () => {
            setIsMobile(getIsMobile());
        }
        window.addEventListener("resize", onResize);
        console.log("window.innerWidth", window.innerWidth);
        console.log("window.outerWidth", window.outerWidth);
    
        return () => {
            window.removeEventListener("resize", onResize);
        }
    }, []);
    
    return isMobile;
}

function App() {
    const [templateDocxFile, setTemplateDocxFile] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    const [outputFileFormatString, setOutputFileFormatString] = useState(
        "{originalFileName}_{rowNum}.docx"
    );

    const [showHowToUse, setShowHowToUse] = useState(false);
        
    const isMobile = useIsMobile();

    const generateDocument = () => {
        loadArrayBufferFromFile(templateDocxFile, function (error, content) {
            if (error) {
                throw error;
            }

            loadCsvDataFromFile(csvFile, function (error, data) {
                if (error) {
                    throw error;
                }
                console.log("data", data);

                data.forEach((row, i) => {
                    var zip = new PizZip(content);
                    var doc = new Docxtemplater(zip, {
                        paragraphLoop: true,
                        linebreaks: true,
                    });

                    doc.setData(row);

                    try {
                        doc.render();
                    } catch (error) {
                        throw error;
                    }

                    var out = doc.getZip().generate({
                        type: "blob",
                        mimeType:
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    });

                    var rowNum = i + 1;
                    var outputFileName = parseOutputFileName(
                        outputFileFormatString,
                        templateDocxFile.name.replace(".docx", ""),
                        rowNum,
                        row
                    );
                    saveAs(out, outputFileName);
                });
            });
        });
    };

    return (
        <div className="horizontal-list">
            <div>
                <h2>Docx templater</h2>
                <div className="card">
                    <h3>1. docx 템플릿 파일 선택</h3>
                    <input
                        type="file"
                        onChange={(e) => setTemplateDocxFile(e.target.files[0])}
                        accept=".docx"
                    />
                </div>
                <div className="card">
                    <h3>2. csv 파일 선택</h3>
                    <input
                        type="file"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                        accept=".csv"
                    />
                </div>
                <div className="card">
                    <h3>3. output file format 작성</h3>
                    <input
                        type="text"
                        onChange={(e) => setOutputFileFormatString(e.target.value)}
                        value={outputFileFormatString}
                        style={{
                            width: "100%",
                            fontSize: "1rem",
                        }}
                    />
                </div>
                <button onClick={() => generateDocument()} disabled={!templateDocxFile || !csvFile}>
                    {" "}
                    Generate documents
                </button>
                <p className="read-the-docs">made by lullu</p>
            </div>
            <div>
                {
                    isMobile 
                    ? null
                    : <HowToUse />
                }
            </div>
        </div>
    );
}

export default App;
