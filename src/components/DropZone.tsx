import React, { useState, useCallback, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { MdCloudUpload } from 'react-icons/md'
import { BsFileEarmarkSpreadsheet } from 'react-icons/bs'

interface Props {
  hasFile: boolean;
  isDragOver: boolean;
}

const DropZoneForm = styled.form<Props>`
  label {
    ${({ isDragOver, hasFile }) => (isDragOver || hasFile) && css`
      background: rgba(51, 119, 187, .2);
    `}
    border: 4px dashed rgb(170, 187, 187);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px;
    cursor: pointer;

    svg {
      margin-top: 30px;
      margin-bottom: 10px;
    }

    .fake-button {
      margin-bottom: 30px;
      color: #fff;
      font-weight: bold;
      border: transparent;
      border-radius: 8px;
      padding: 10px 15px;
      background: #3377bb;
    }

    input {
      display: none;
    }
  }
`

export function DropZone({ onChangeFile = (f: File) => {}, ...props}) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File|null>(null);

  const handleDrag = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, [])
  const handleDragOver = useCallback((event) => {
    handleDrag(event)
    setDragOver(true)
  }, [handleDrag])
  const handleDragLeave = useCallback((event) => {
    handleDrag(event)
    setDragOver(false)
  }, [handleDrag])
  const handleDrop = useCallback((event) => {
    handleDragLeave(event)
    const file = event.dataTransfer.files[0];
    setFile(file)
  }, [handleDragLeave])
  const handleChange = useCallback((event) => {
    const file = event.target.files[0]
    setFile(file)
  }, [])
  const handleSubmit = useCallback((event) => {
    handleDrag(event)
  }, [handleDrag])

  useEffect(() => {
    onChangeFile(file as File)
  }, [file, onChangeFile])

  const Icon = (dragOver || file) ? BsFileEarmarkSpreadsheet : MdCloudUpload
  return (
    <DropZoneForm
      hasFile={!!file}
      isDragOver={dragOver}
      onDrag={handleDrag}
      onDrop={handleDrop}
      onSubmit={handleSubmit}
      onDragOver={handleDragOver}
      onDragEnd={handleDragLeave}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      {...props}
    >
      <label>
        <Icon size={64} color="#3377bb" />
        <div className="fake-button">
          Selecione uma planilha
        </div>
        <input type="file" accept=".xlsx" onChange={handleChange} />
      </label>
    </DropZoneForm>
  )
}
