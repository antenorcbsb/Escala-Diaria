const FOLDER_ID = '1rvXx9ZZ8Rv6b6lKJF7PWnnoK_smz1PBI';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwkrQcx3xCgRsnNy3uYHAh_awi2v-OTM2NVASnu9K9d84mwxsnhHmf0IKaN6ipblk8/exec';

document.addEventListener('DOMContentLoaded', async () => {
      setStatus('loading', 'A carregar PDF...');
      
      const loaded = await loadPdfList();
      
      if (!loaded) { 
            setStatus('error', 'Erro ao carregar a lista de PDFs');
            return; 
      }
      
      // Abre imediatamente o turno atual
      updateViewer(loaded);
      // Agenda exclusivamente 06:30 / 18:30
      scheduleNextShift(loaded);
} );

function getPortugalTime() {
    return new Date(
        new Date().toLocaleString('en-US', {
            timeZone: 'Europe/Lisbon'
        })
    );
}

function getExpectedFileName() {
    const now = getPortugalTime();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    const startDay = 6 * 60 + 30;    // 06:30
    const startNight = 18 * 60 + 30; // 18:30

    let targetDate = new Date(now);
    let shift = "";

    if (timeInMinutes >= startDay && timeInMinutes < startNight) {
        shift = "Dia";
    } else {
        shift = "Noite";
        if (timeInMinutes < startDay) {
            targetDate.setDate(targetDate.getDate() - 1);
        }
    }

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');

    // Formato correspondente aos seus ficheiros: DDMMAAAA Turno.pdf (ex: 01092026 Dia.pdf)
    const fileName = `${day}${month}${year} ${shift}.pdf`;
    const formattedDate = `${day}/${month}/${year}`;

    return { fileName, shift, formattedDate };
}

function updateViewer(loaded) {

      setStatus('loading', 'A carregar PDF...');
    const {fileName, shift, formattedDate } = getExpectedFileName();
    // console.log('Ficheiro procurado:', fileName);

    // Como loaded é um objeto indexado pelo nome do PDF
    const pdf = loaded[fileName];

    if (!pdf) {
        console.error( 'PDF não encontrado:', fileName );
          setStatus('error',`PDF não encontrado: ${fileName}` );
        return;
    }

    // console.log( 'PDF encontrado:', pdf);
    // console.log('ID:', pdf.id);

    const iframe = document.getElementById('pdf-frame');
    const pdfUrl = `https://drive.google.com/file/d/${pdf.id}/preview`;

   // console.log( 'TESTE', pdfUrl );

    // Abrir PDF diretamente
    if (iframe.src !== pdfUrl) {
        iframe.src = pdfUrl;
    }

    //const badgeText = document.getElementById('badge-text');
    //if (badgeText) {
    //    badgeText.innerText = `Turno Atual: ${formattedDate} (${shift})`;
    //}

      setStatus( 'success', `Turno Atual: ${formattedDate} (${shift})`);
}

async function loadPdfList() { 
      try {  
            setStatus('loading', 'A carregar lista de PDFs...');
            const response = await fetch( APPS_SCRIPT_URL ); 
            
            if (!response.ok) { throw new Error( 'Erro HTTP ' + response.status ); } 
            
            const data = await response.json(); 
            if (!data.success) { throw new Error( 'O Google Apps Script devolveu um erro.' ); } 
            
            /* * Guarda a lista de PDFs */ 
            pdfList = data.files || {}; 
            
            // console.log( 'Lista de PDFs:', pdfList ); 
            
            /* * Mostra a quantidade * de PDFs encontrados */ 
            // console.log( 'PDFs encontrados:', Object.keys(pdfList).length ); 
            return pdfList; 
      } 
      catch (error) { 
        console.error( 'Erro ao obter PDFs:', error ); 
            setStatus('error','Erro ao carregar os PDFs');

      }
}

function scheduleNextShift(loaded) {
      
      const now = getPortugalTime();
      
      const day = new Date(now);
      day.setHours(6, 30, 0, 0);
      
      const night = new Date(now);
      night.setHours(18, 30, 0, 0);
      
      let nextChange;
      
      if (now < day) {
        nextChange = day;
      } else if (now < night) {
        nextChange = night;
      } else {
        nextChange = new Date(now);
        nextChange.setDate( nextChange.getDate() + 1 );
        nextChange.setHours(6, 30, 0, 0);
      }
      
      const delay = nextChange.getTime() - now.getTime();
      
      const totalMinutes = Math.ceil(delay / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const nextHour = String(nextChange.getHours()).padStart(2, '0');
      const nextMinute = String(nextChange.getMinutes()).padStart(2, '0');
      
      console.log( `Próxima mudança: ${nextHour}:${nextMinute} (daqui a ${hours}h ${minutes}min)`);
      
      setTimeout(() => {
        updateViewer(loaded);
        // Agenda a mudança seguinte
        scheduleNextShift(loaded);
      }, delay);
}


function setStatus(type, message) {

    const badgeText = document.getElementById('badge-text');
    const statusDot = document.getElementById('status-dot');

    if (!badgeText || !statusDot) return;

    badgeText.innerText = message;

    statusDot.classList.remove(
        'status-loading',
        'status-success',
        'status-error'
    );

    if (type === 'loading') {
        statusDot.classList.add('status-loading');
    }

    if (type === 'success') {
        statusDot.classList.add('status-success');
    }

    if (type === 'error') {
        statusDot.classList.add('status-error');
    }
}
