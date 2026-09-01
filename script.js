 const FOLDER_ID = '1rvXx9ZZ8Rv6b6lKJF7PWnnoK_smz1PBI';
const APPS_SCRIPT_URL = 'https://drive.google.com/drive/folders/1rvXx9ZZ8Rv6b6lKJF7PWnnoK_smz1PBI';

      function getExpectedFileName() {
          const now = new Date();
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

      function updateViewer() {
          const { fileName, shift, formattedDate } = getExpectedFileName();
          const iframe = document.getElementById('pdf-frame');
          const badgeText = document.getElementById('badge-text');

          // Força a pesquisa do ficheiro exato dentro da pasta do Google Drive
          const searchUrl = `https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}#search/${encodeURIComponent(fileName)}`;
          
          if (iframe.src !== searchUrl) {
              iframe.src = searchUrl;
          }

          badgeText.innerText = `Turno Atual: ${formattedDate} (${shift})`;
      }

      document.addEventListener('DOMContentLoaded', () => {
          //updateViewer();
          const loaded = await loadPdfList(); if (!loaded) { return; }
          setInterval(updateViewer, 60000); // Reavalia o turno a cada 1 minuto
      });

    async function loadPdfList() { 
      try {  
           const response = await fetch( APPS_SCRIPT_URL + '?t=' + Date.now() ); 
           
           if (!response.ok) { throw new Error( 'Erro HTTP ' + response.status ); } 
           
           const data = await response.json(); 
           
           if (!data.success) { throw new Error( 'O Google Apps Script devolveu um erro.' ); } 
           
           /* * Guarda a lista de PDFs */ 
           pdfList = data.files || {}; 
           
           console.log( 'Lista de PDFs:', pdfList ); 
           
           /* * Mostra a quantidade * de PDFs encontrados */ 
           console.log( 'PDFs encontrados:', Object.keys(pdfList).length ); 
           return true; 
      } 
      catch (error) { 
        console.error( 'Erro ao obter PDFs:', error ); 
  }

