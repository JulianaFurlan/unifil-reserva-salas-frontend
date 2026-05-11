// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUnifil from '../assets/logo-Unifil.png';

// Cores da UniFil
const COR_PRIMARIA = [242, 127, 32];     // #F27F20 (laranja)
const COR_SECUNDARIA = [31, 41, 55];     // #1f2937 (cinza escuro)
const COR_SUCESSO = [34, 197, 94];       // #22c55e (verde)
const COR_PENDENTE = [245, 158, 11];     // #f59e0b (amarelo)

const formatarData = (dataISO) => {
if (!dataISO) return '';
const [ano, mes, dia] = dataISO.split('-');
return `${dia}/${mes}/${ano}`;
};

const getDiaSemana = (dataISO) => {
const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const data = new Date(dataISO + 'T12:00:00');
return dias[data.getDay()];
};

const formatarHorario = (hora) => {
if (!hora) return '';
return hora.split(':').slice(0, 2).join(':');
};

// Função para converter logo para base64 (se necessário)
const getLogoBase64 = async () => {
try {
const response = await fetch(logoUnifil);
const blob = await response.blob();
return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
});
} catch {
return null;
}
};

export async function gerarPdfOcupacao(reservas, filtroData = null) {
const doc = new jsPDF();
const logo = await getLogoBase64();

// ==================== CABEÇALHO ====================
if (logo) {
doc.addImage(logo, 'PNG', 14, 8, 50, 20);
doc.setFontSize(16);
doc.setFont('helvetica', 'bold');
doc.setTextColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
doc.text('| Centro Universitário Filadélfia', 61, 20);
} else {
doc.setFontSize(18);
doc.setFont('helvetica', 'bold');
doc.setTextColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
doc.text('UniFil', 14, 18);
}

doc.setFontSize(14);
doc.setFont('helvetica', 'bold');
doc.setTextColor(COR_SECUNDARIA[0], COR_SECUNDARIA[1], COR_SECUNDARIA[2]);
doc.text('Mapa de Ocupação de Salas', 14, 32);

doc.setFontSize(9);
doc.setFont('helvetica', 'normal');
doc.setTextColor(100, 100, 100);

const hoje = new Date().toLocaleDateString('pt-BR');
const periodo = filtroData
? `Data: ${formatarData(filtroData)}`
: `Relatório gerado em: ${hoje}`;
doc.text(periodo, 14, 40);
doc.setTextColor(0, 0, 0);

// ==================== FILTROS ====================
let reservasFiltradas = reservas.filter(r =>
r.status === 'APROVADO' || r.status === 'PENDENTE'
);

if (filtroData) {
reservasFiltradas = reservasFiltradas.filter(r => r.data === filtroData);
}

reservasFiltradas.sort((a, b) => {
if (a.data !== b.data) return a.data.localeCompare(b.data);
if (a.sala !== b.sala) return a.sala.localeCompare(b.sala);
return a.horaInicio.localeCompare(b.horaInicio);
});

if (reservasFiltradas.length === 0) {
doc.setFontSize(12);
doc.setTextColor(100, 100, 100);
doc.text('Nenhuma reserva encontrada para o período selecionado.', 14, 55);
doc.save('mapa-ocupacao.pdf');
return;
}

// ==================== AGRUPAR POR DATA ====================
const porData = {};
reservasFiltradas.forEach(r => {
if (!porData[r.data]) porData[r.data] = [];
porData[r.data].push(r);
});

let posY = 48;

for (const [data, reservasDia] of Object.entries(porData)) {
// Título da data
doc.setFillColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
doc.rect(14, posY, 182, 9, 'F');
doc.setFontSize(11);
doc.setFont('helvetica', 'bold');
doc.setTextColor(255, 255, 255);
doc.text(`${getDiaSemana(data)}, ${formatarData(data)}`, 16, posY + 6.5);
posY += 11;
doc.setTextColor(0, 0, 0);

// Construir linhas da tabela
const linhas = reservasDia.map(r => [
    r.sala || '—',
    `${formatarHorario(r.horaInicio)} – ${formatarHorario(r.horaFim)}`,
    r.nome || '—',
    r.departamento || '—',
    r.finalidade || '—',
    r.status === 'APROVADO' ? 'Aprovada' : 'Em análise',
]);

autoTable(doc, {
    startY: posY,
    head: [['Sala', 'Horário', 'Solicitante', 'Departamento', 'Finalidade', 'Status']],
    body: linhas,
    theme: 'grid',
    headStyles: {
    fillColor: [248, 250, 252],
    textColor: COR_SECUNDARIA,
    fontStyle: 'bold',
    fontSize: 9,
    halign: 'center',
    },
    bodyStyles: {
    fontSize: 9,
    cellPadding: 4,
    },
    columnStyles: {
    0: { cellWidth: 35, halign: 'left' },
    1: { cellWidth: 28, halign: 'center' },
    2: { cellWidth: 35, halign: 'left' },
    3: { cellWidth: 28, halign: 'left' },
    4: { cellWidth: 35, halign: 'left' },
    5: { cellWidth: 22, halign: 'center' },
    },
    didDrawCell: (data) => {
    // Cor da célula de status
    if (data.section === 'body' && data.column.index === 5) {
        const status = data.cell.raw;
        if (status === 'Aprovada') {
        doc.setFillColor(COR_SUCESSO[0], COR_SUCESSO[1], COR_SUCESSO[2]);
        doc.setDrawColor(200, 200, 200);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(status, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
        } else {
        doc.setFillColor(COR_PENDENTE[0], COR_PENDENTE[1], COR_PENDENTE[2]);
        doc.setDrawColor(200, 200, 200);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(status, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
        }
        doc.setTextColor(0, 0, 0);
    }
    },
    margin: { left: 14, right: 14 },
});

posY = doc.lastAutoTable.finalY + 12;

// Nova página se necessário
if (posY > 260) {
    doc.addPage();
    posY = 20;
}
}

// ==================== RODAPÉ ====================
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
doc.setPage(i);
doc.setFontSize(8);
doc.setFont('helvetica', 'italic');
doc.setTextColor(150, 150, 150);
doc.text(
    `Sistema de Reservas UniFil — Página ${i} de ${totalPages}`,
    14,
    doc.internal.pageSize.height - 10
);

// Linha decorativa no rodapé
doc.setDrawColor(COR_PRIMARIA[0], COR_PRIMARIA[1], COR_PRIMARIA[2]);
doc.setLineWidth(0.5);
doc.line(14, doc.internal.pageSize.height - 14, 196, doc.internal.pageSize.height - 14);
}

const nomeArquivo = filtroData
? `mapa-ocupacao-${filtroData}.pdf`
: `mapa-ocupacao-${new Date().toISOString().split('T')[0]}.pdf`;

doc.save(nomeArquivo);
}