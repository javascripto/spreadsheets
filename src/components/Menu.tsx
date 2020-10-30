import { WorkBook } from 'xlsx'
import React from 'react'
import styled from 'styled-components'
import { XSpreadSheet } from './XSpreadSheet'


export function createScriptUrl(scriptBody: string) {
  const blob = new Blob([scriptBody], {
    type: 'text/javascript'
  })
  return URL.createObjectURL(blob)
}

const workerUrl = createScriptUrl(`
  importScripts('https://unpkg.com/xlsx@0.16.6/dist/xlsx.full.min.js')

  function createWorkbookFromFile(file) {
    const reader = new FileReader();
    return new Promise(function(resolve, reject) {
      reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
      reader.readAsArrayBuffer(file);
    })
  }

  this.addEventListener('message', function(e) {
    if (!(e.data instanceof File)) {
      return;
    }
    createWorkbookFromFile(e.data).then(function(workbook) {
      postMessage(workbook)
    })
  })
`)

const worker = new Worker(workerUrl)

export const Button = styled.button`
  margin-bottom: 30px;
  color: #fff;
  font-weight: bold;
  border: transparent;
  border-radius: 8px;
  padding: 10px 15px;
  background: #3377bb;
  &:not(:first-child) {
    margin-left: 5px;
  }
  &:disabled {
    background: #bbb;
    cursor: not-allowed;
  }
`

const Loading = styled.div`
  padding: 100px;
  margin: auto;
  text-align: center;
`

const MenuContainer = styled.div`
  width: 1200px;
  max-width: calc(100% - 40px);
  margin: 20px auto;
`

interface Props {
  file: File
  onClear?: Function
}

export const Menu: React.FC<Props> = ({ file, ...props }) => {
  const [loading, setLoading] = React.useState(false)
  const [workbook, setWorkbook] = React.useState<WorkBook|null>(null)

  React.useEffect(() => {
    setLoading(true)
    if (file) {
      worker.onmessage = ({ data: workbook}) => {
        (window as any).workbook = workbook
        setWorkbook(workbook);
        setLoading(false);
      };
      worker.postMessage(file);
    }
  }, [file])

  const POG_export = () => {
    //@ts-ignore
    window.exportSheet()
  }
  const clearSheet = () => {
    props.onClear && props.onClear();
  }

  if (loading) return (
    <Loading>Caregando...</Loading>
  )
  
  return (
    <MenuContainer>
      <Button disabled>Formatar Planilha</Button>
      <Button onClick={POG_export}>Exportar</Button>
      <Button onClick={clearSheet}>Carregar outro arquivo</Button>
     { workbook && <XSpreadSheet workbook={workbook} />  }
    </MenuContainer>
  )
}
