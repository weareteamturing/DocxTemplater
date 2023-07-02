import React, { Component } from "react";
import { useState } from "react";
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

function loadCsvDataFromFile(file, callback) {
    var reader = new FileReader();
    reader.onloadend = function (e) {
        const content = e.target.result;
        const columns = content.split("\n")[0].split(",");
        const data = content
            .split("\n")
            .slice(1)
            .map((row) => {
                const values = row.split(",");
                return columns.reduce((object, curr, i) => {
                    object[curr] = values[i];
                    return object;
                }, {});
            });
        callback(null, data);
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

function App() {
    const [templateDocxFile, setTemplateDocxFile] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    const [outputFileFormatString, setOutputFileFormatString] = useState(
        "{originalFileName}_{rowNum}.docx"
    );

    const generateDocument = () => {
        loadArrayBufferFromFile(templateDocxFile, function (error, content) {
            if (error) {
                throw error;
            }

            loadCsvDataFromFile(csvFile, function (error, data) {
                if (error) {
                    throw error;
                }

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
                    <h3>1. DOCX 템플릿 파일을 업로드 해주세요.</h3>
                    <input
                        type="file"
                        onChange={(e) => setTemplateDocxFile(e.target.files[0])}
                        accept=".docx"
                    />
                </div>
                <div className="card">
                    <h3>2. CSV 파일을 업로드 해주세요.</h3>
                    <input
                        type="file"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                        accept=".csv"
                    />
                </div>
                <div className="card">
                    <h3>3. output file format을 작성해주세요.</h3>
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
                <HowToUse />
            </div>
        </div>
    );
}

export default App;
