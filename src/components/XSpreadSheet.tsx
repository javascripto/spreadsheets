import XLSX, { WorkBook } from 'xlsx'
import Spreadsheet from "x-data-spreadsheet";
import 'x-data-spreadsheet/dist/xspreadsheet.css'
import React, { Component, createRef } from 'react';

interface Props {
  workbook: WorkBook
}

export class XSpreadSheet extends Component<Props> {
  ref = createRef<HTMLDivElement>();

  state = {
    spreadsheet: null as (Spreadsheet | null)
  }

  componentDidMount() {
    const divRef = this.ref.current as HTMLDivElement
    const data = workBookToXSpreadSheet(this.props.workbook)
    // const rowsLength = Object.keys(data[0].rows).length;
    const rowsLength = data[0]?.rows?.len || 100;
    let colsLength = data[0]?.rows[0]?.cells ? Object.keys(data[0]?.rows[0]?.cells).length : 26
    colsLength = colsLength < 11 ? 11 : colsLength
    const spreadsheet = new Spreadsheet(divRef, {
      mode: 'edit',
      showToolbar: false,
      showGrid: true,
      showContextmenu: false,
      view: {
        height: () => 768, // document.documentElement.clientHeight,
        width: () => 1190, // document.documentElement.clientWidth,
      },
      row: {
        len: rowsLength,
        height: 25,
      },
      col: {
        len: colsLength, // 26,
        width: 100,
        indexWidth: 60,
        minWidth: 60,
      },
    });
    spreadsheet.loadData(data)
    spreadsheet.on('cell-selected', console.log)
    spreadsheet.on('cells-selected', console.log)
    spreadsheet.on('cell-edited', console.log)
    this.setState({ spreadsheet })
    // FIXME: POG
    //@ts-ignore
    window.getData = () => spreadsheet.getData()
    // FIXME: POG
    //@ts-ignore
    window.exportSheet = () => {
      const data = spreadsheet.getData() as XSpreadSheetData
      const workbook = XSpreadSheetToWorkBook(data)
      XLSX.writeFile(workbook, 'spreadsheet.xlsx', {});
    }
  }

  render() {
    return (
      <div ref={this.ref} style={{ width: '1190px' }}></div>
    )    
  }
}

function workBookToXSpreadSheet(workbook: WorkBook): XSpreadSheetData {
  return workbook.SheetNames.map(name => {
    const sheet = { name, rows: {} } as any;
    const worksheet = workbook.Sheets[name];
    const arrayOfArrays = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      header: 1,
    });
    arrayOfArrays.forEach((row, index) => {
      const cells = {} as any;
      (row as any[]).forEach((cell, cellIndex) => {
        cells[cellIndex] = { text: cell };
      });
      sheet.rows[index] = { cells };
    });
    sheet.rows.len = arrayOfArrays.length
    return sheet
  });
}

function XSpreadSheetToWorkBook(spreadSheetData: XSpreadSheetData): WorkBook {
  const workbook = XLSX.utils.book_new();
  spreadSheetData.forEach((item) => {
    const arrayOfArrays: Array<Array<unknown>> = [[]];
    const rowObject = item.rows;
    for (let rowIndex = 0; rowIndex < rowObject.len; ++rowIndex) {
      const row = rowObject[rowIndex];
      if (!row) continue;
      arrayOfArrays[rowIndex] = [];
      Object.keys(row.cells).forEach((key) => {
        const idx = +key;
        if (isNaN(idx)) return;
        arrayOfArrays[rowIndex][idx] = row.cells[Number(key)].text;
      });
    }
    const worksheet = XLSX.utils.aoa_to_sheet(arrayOfArrays);
    XLSX.utils.book_append_sheet(workbook, worksheet, item.name);
  });
  return workbook;
}

type XSpreadSheetData = Array<{
  name: string;
  rows: {
    [key: number]: {
      cells: {
        [key: number]: {
          text: string|number|boolean|null
        }
      }
    },
    len: number
  }
}>
