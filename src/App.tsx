import React from 'react'

//
import './index.css'
import FileUploader from './components/FileUploader'
import SubTable from './components/SubstituteTable'
//
import { makeData, Person, Substitute } from './makeData'

import Papa from "papaparse"

export default function App() {
  const [fileContent, setFileContent] = React.useState('');
  const [prettifiedContent, setPrettifiedContent] = React.useState<Substitute[]>([]);

  const handleFileUpload = (content: string) => {
      try {
        Papa.parse<Substitute>(content, {
          header: true,
          delimiter: ',',
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            console.log(results)
            setPrettifiedContent(results.data)
          }
        })
        setFileContent(content);
      } catch (err) {
        console.error('Invalid CSV file');
      }
    };

  const handleFileUpload2 = (content: string) => {
      try {
        Papa.parse<Substitute>(content, {
          header: true,
          delimiter: ',',
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            console.log(results)
            setPrettifiedContent(results.data)
          }
        })
        setFileContent(content);
      } catch (err) {
        console.error('Invalid CSV file');
      }
    };
    
  return (
    <div className="p-2">
      <div className="h-2" />
      <div className="buttons-container flex">
        <FileUploader onFileUpload={handleFileUpload} />
        {/* <FileUploader onFileUpload={handleFileUpload} /> */}
      </div>
      {/* <div className="tables-container flex justify-between items-start"> */}
        {fileContent.length > 0 && (
          <SubTable subdata={prettifiedContent} />
      )}
      {/* </div> */}
    </div>)
}
