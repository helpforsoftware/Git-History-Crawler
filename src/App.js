import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import * as refractor from 'refractor';
import "bootstrap/dist/css/bootstrap.min.css";
import { parseDiff, tokenize, Diff, Hunk, useSourceExpansion } from 'react-diff-view';
import 'react-diff-view/style/index.css';
import 'prism-themes/themes/prism-vs.css';
import { DIFF_TEXT, SOURCE_CODE } from './input';
import ExpandButton from './ExpandButton';
import './styles.css';
import { Button, Card } from 'antd';
import FileAddTwoTone from '@ant-design/icons/FileAddTwoTone';
import CopyTwoTone from '@ant-design/icons/CopyTwoTone';
import $ from 'jquery/dist/jquery.min.js';
import './dragable.js';


export default function App() {
    const [arrayCommitList, setArrayCommitList] = useState([]);
    const [showArray, setShowArray] = useState(false); // State to store last two active IDs
    const [lastTwoIds, setLastTwoIds] = useState([]); // State to store last two active IDs
    const [filePath, setFilePath] = useState(''); // State to store the file path
    const [diffText, setDiffText] = useState('');
    const lastTwoIdsRef = useRef(lastTwoIds);

    const onClickBtnb = async () => {
        lastTwoIdsRef.current = [];
        setLastTwoIds([]);
        console.log("calisan renderer.js");
        try {
            
            const selectedFilePath = await window.dialogAPI.openFile();
             await fillGitCommitTable(selectedFilePath);

        } catch (error) {
            console.error('Error opening file:', error);
        }
   
  
    };

    const onClickTr = useCallback((index) => {
        setArrayCommitList((prevState) => {
            let lastTwoIds = [...lastTwoIdsRef.current];

            // Add the new index to the lastTwoIds array
            if (lastTwoIds.includes(index)) {
                lastTwoIds = lastTwoIds.filter(id => id !== index);
            }
            lastTwoIds.push(index);

            // Keep only the last two IDs
            if (lastTwoIds.length > 2) {
                lastTwoIds.shift();
            }
            lastTwoIdsRef.current = lastTwoIds;
            setLastTwoIds(lastTwoIds);
          

            const newState= prevState.map((item, idx) => {
              if (lastTwoIds.includes(idx)) {
                  return { ...item, isActive: true };
              } else {
                  return { ...item, isActive: false };
              }
          });
           console.log("lastTwoIds",lastTwoIds)
            
            return newState;
        });
    }, [filePath]);

    useEffect(() => {
        const fetchDiffText = async () => {
            console.log("fetchDiffText firing")
            if (lastTwoIds.length > 1) {
                const hashes = lastTwoIds.map(id => arrayCommitList[id].name);
          
            const DIFF_TEXT = await window.getDiff.getDiff(hashes[0], hashes[1], filePath);
            console.log("hashler",hashes)
            setDiffText(DIFF_TEXT);
            //console.log("diffim",DIFF_TEXT)
        
        }

              
            
        };
        if (lastTwoIds.length > 1) {
        fetchDiffText();
        console.log("fetchdifftext runnig")// this is not firing.
        }
    }, [lastTwoIds, arrayCommitList, filePath]);

    const getClipBoard = async () => {
        const filePathElement = document.getElementById('filePath');
        const clipboardFilePath = await window.clipAPI.getClipBoard();
        const isFileExists = await window.fileAPI.getFileExists(clipboardFilePath);
      
        console.log('file exists:', isFileExists);
if(isFileExists)
{
    await fillGitCommitTable(clipboardFilePath)
}
else
{  filePathElement.innerText =" file Path Not Found"+ clipboardFilePath;}

    };



    const [file] = useMemo(() => parseDiff(diffText, { nearbySequences: 'zip' }), [diffText]);
    const [hunksWithSourceExpansion, expandCode] = useSourceExpansion(file.hunks, SOURCE_CODE);
    const tokens = useMemo(() => {
        const options = {
            refractor,
            highlight: true,
            language: 'javascript',
        };
        return tokenize(hunksWithSourceExpansion, options);
    }, [hunksWithSourceExpansion]);

    const renderHunk = useCallback(
        (output, currentHunk, index, hunks) => {
            const previousHunk = hunks[index - 1];
            const nextHunk = hunks[index + 1];
            const previousEnd = previousHunk ? previousHunk.oldStart + previousHunk.oldLines : 1;
            const currentStart = currentHunk.oldStart;
            const currentEnd = currentHunk.oldStart + currentHunk.oldLines;
            const nextStart = nextHunk ? nextHunk.oldStart : 1;

            if ((index === 0 && previousEnd > 1) || currentStart - previousEnd > 10) {
                output.push(<ExpandButton key={`up-${currentHunk.content}`} direction="up" start={currentHunk.oldStart} lines={currentHunk.oldLines} onExpand={expandCode} />);
            }
            output.push(<Hunk key={currentHunk.content} hunk={currentHunk} />);
            if (nextStart > currentEnd + 1) {
                output.push(<ExpandButton key={`down-${currentHunk.content}`} direction="down" start={currentHunk.oldStart} lines={currentHunk.oldLines} onExpand={expandCode} />);
            }

            return output;
        },
        [expandCode]
    );

    const getGitStatus = async (filePath) => {
        console.log("calisan gitstatus.js", filePath);
        let gitresult = null;
        try {
            gitresult = await window.gitAPI.getGitStatus(filePath);
            const filePathElement = document.getElementById('filePath');
            //filePathElement.innerText = gitresult;
        } catch (error) {
            console.error('Error opening file:', error);
        }
        return gitresult;
    };

    return (
        <div> 
            <strong>{filePath}</strong>
            <div className="row">
                <div className="column left-column">
                    <div className="draggable-border"></div>
                    
                    {showArray && (
                       <div>
                      
                        <table className="table-sm table table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Writer</th>
                                    <th scope="col">Commit Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {arrayCommitList.map((person, index) => (
                                    <tr key={index} onClick={() => onClickTr(index)} className={person.isActive ? "table-success" : ''}>
                                        <th scope="row">{index}</th>
                                        <td>{person.title}</td>
                                        <td>{person.address}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                    <Card id="maincard" title="Open Git History from">
                        <Button type="primary" id="btn" onClick={onClickBtnb}>
                            <FileAddTwoTone /> Open a File
                        </Button><div>Please select a file (that is in a git repository) you would like to look at its history.</div>
                       <div>
                        <Button type="primary" id="btn" onClick={getClipBoard}>
                            <CopyTwoTone  /> Paste from clipboard
                        </Button> <div>You can copy a file absolutepath and paste from clipboard.</div></div>
                       
                    </Card>
                    <strong id="filePath"></strong>
                </div>
                <div className="column right-column">
                    <div className="draggable-border"></div>
                    <Diff viewType="split" diffType={file.type} hunks={hunksWithSourceExpansion} tokens={tokens}>
                        {hunks => hunks.reduce(renderHunk, [])}
                    </Diff>
                </div>
            </div>
        </div>
    );

    async function fillGitCommitTable(selectedFilePath) {
        setFilePath(selectedFilePath); // Store the file path in state
        const commitList = await getGitStatus(selectedFilePath);
        console.log("commitlist", commitList);
        
        const convertToObjects = () => {
            const lines = commitList.split('\n');
            const dataArray = lines.map(line => {
                const [name, title, address] = line.trim().replaceAll("-", "vd||").replaceAll("|c||", "-").split("-");
                return {
                    name: name.replaceAll("vd||", "-"),
                    title: title.replaceAll("vd||", "-"),
                    address: address.replaceAll("vd||", "-"),
                    isActive: false
                };
            });
            console.log(dataArray);
            setArrayCommitList(dataArray);
        };
        convertToObjects();
        setShowArray(true);
        
    }
}
