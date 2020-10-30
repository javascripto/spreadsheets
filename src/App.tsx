import React from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { Menu, Button, createScriptUrl } from './components/Menu';


export function App() {
  const [file, setFile] = React.useState<File|null>(null)
  const handleChangeFile = (f: File) => setFile(f)
  return (
    <div>
      <Header />
      {!file && (
        <>
          <Button
            style={{marginTop: '10px'}}
            onClick={generateSheet}>
            Gerar planilha com dados aleatórios
          </Button>
          <DropZone
            onChangeFile={handleChangeFile}
            style={{ maxWidth: '650px', margin: 'auto' }}
          />
        </>
      )}
      { file && <Menu file={file} onClear={() => setFile(null)} /> }
    </div>
  )
}


const scriptUrl = createScriptUrl(`
  importScripts('https://unpkg.com/xlsx@0.16.6/dist/xlsx.full.min.js')
  importScripts('https://unpkg.com/chance@1.1.7/chance.js')

  function shuffle() {
    const result = Math.random()
    return result < 0.3 ? -1 : result > 0.6 ? 1 : 0; 
  }

  const CNPJs = Array.from({ length: 4 }, function() {
    const chance = new Chance()
    return chance.cnpj()
  })

  const situacoes = [
    ...Array(150).fill('A'),
    "SITUACAO",
    "Mandato Sindical Ônus do Sindicato",
    "Licença Mater.",
    "Apos. Invalidez",
    "Licença s/venc",
    "Af.Previdência",
    "Aviso Prévio",
    "Af.Ac.Trabalho",
    "Férias",
    "Contrato de Trabalho Suspenso",
    "Outros",
    "Serv.Militar",
    "Recesso Remunerado de Estágio",
    "Licença Mater. Compl. 180 dias",
    "Doença Ocupacional",
    ""
  ]

  function generateList(length) {
    const chance = new Chance()
    const array = Array.from({ length }, (v, k) => ({
      MATRICULA: ('0' + Math.random().toString().substr(2, 11)).padStart(12, '0'),
      NOME: chance.name(),
      CPF: chance.cpf(),
      CNPJ: CNPJs.sort(shuffle)[0],
      MARGEM: parseFloat(chance.floating({ min: 10, max: 3000 }).toFixed(2)),
      'DATA DE ADMISSAO': new Date(chance.integer({ min: +new Date('2005-01-01'), max: Date.now()})).toLocaleDateString('pt-BR'),
      'POSSUI CONSIGNADO': ['Sim', 'Não'].sort(shuffle)[0],
      SITUACAO: situacoes.sort(shuffle)[0],
    }))
    return array;
  }
  
  function generateSheet(length) {
    const list = generateList(length)
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(list, {})
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha de exemplo');
    const base64 = XLSX.write(workbook, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'base64',
      compression: true,
    })
    const mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return 'data:' + mimetype + ';base64,' + base64;
    // XLSX.writeFile(workbook, 'spreadsheet.xlsx', { compression: true });
  }
  
  this.addEventListener('message', function(event) {

    postMessage(generateSheet(event.data))
  })
`)

const worker = new Worker(scriptUrl)

function generateSheet() {
  const length = parseInt(prompt('Quantidade de linhas', '1500')!);
  worker.onmessage = ({ data: base64Url }) => {
    const link = Object.assign(document.createElement('a'), {
      download: 'spreadsheet.xlsx',
      href: base64Url,
    })
    link.click()
  }
  worker.postMessage(length)
}