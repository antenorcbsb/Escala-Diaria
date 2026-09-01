const FOLDER_ID = '1rvXx9ZZ8Rv6b6lKJF7PWnnoK_smz1PBI';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwkrQcx3xCgRsnNy3uYHAh_awi2v-OTM2NVASnu9K9d84mwxsnhHmf0IKaN6ipblk8/exec';

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

      function updateViewer(loaded) {

          const {fileName, shift, formattedDate } = getExpectedFileName();
      
          console.log('Ficheiro procurado:', fileName);
      
          // Como loaded é um objeto indexado pelo nome do PDF
          const pdf = loaded[fileName];
      
          if (!pdf) {
              console.error( 'PDF não encontrado:', fileName
              );
              return;
          }
      
          console.log( 'PDF encontrado:', pdf);
      
          console.log('ID:', pdf.id);
      
          const iframe = document.getElementById('pdf-frame');
      
          const pdfUrl = `https://drive.google.com/file/d/${pdf.id}/preview`;
      
         // console.log( 'TESTE', pdfUrl );
      
          // Abrir PDF diretamente
          if (iframe.src !== pdfUrl) {
              iframe.src = pdfUrl;
          }
      
          const badgeText = document.getElementById('badge-text');
          if (badgeText) {
              badgeText.innerText = `Turno Atual: ${formattedDate} (${shift})`;
          }
      }

      document.addEventListener('DOMContentLoaded', async () => {
            const loaded = await loadPdfList();
            
            if (!loaded) {
                  return;
            }
            
            console.log( 'Lista de PDFs:', loaded );
            
            updateViewer(loaded);
            
            setInterval(
            async () => {
                const loaded = await loadPdfList();
                if (loaded) {
                    updateViewer(loaded);
                }
            }, 60000 );
      } );

    async function loadPdfList() { 
      try {  
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
      }

  }
