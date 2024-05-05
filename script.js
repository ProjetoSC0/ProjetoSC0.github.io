document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            renderCharts(jsonData);
        };
        reader.readAsArrayBuffer(file);
    }
}


function processData(data) {
    // Percorrer os dados e substituir "Duas" por 2
    data.forEach(entry => {
        // Verificar se o valor é "Duas"
        if (entry === "três") {
            // Substituir "Duas" por 2
            entry = 3;
        }
    });

    // Retorna os dados processados para uso posterior
    return data;
}



function renderCharts(data) {
    const chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = ''; 

    const questions = Object.keys(data[0]).slice(7); // Começar da pergunta 8

    const questionSelector = document.getElementById('questionSelector');
    questions.forEach(question => {
        const option = document.createElement('option');
        option.value = question;
        option.textContent = question;
        questionSelector.appendChild(option);
    });

    questionSelector.addEventListener('change', function () {
        const selectedQuestion = this.value;
        const selectedData = data.map(entry => entry[selectedQuestion]);
        const chartType = determinarTipoGraficoIA(selectedData);
        if (selectedQuestion === questions[questions.length - 1]) {
            renderWordCloud(selectedData);
        } else {
            const groupedData = agruparRespostas(selectedData);
            renderChart(groupedData.labels, groupedData.counts, chartType);
        }
    });
}

function renderChart(labels, counts, chartType, options = {}) {
    const chartContainer = document.getElementById('chartContainer');
    const canvas = document.createElement('canvas');
    canvas.width = 500; 
    canvas.height = 500; 
    chartContainer.innerHTML = ''; 
    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Gerar uma lista de cores aleatórias se não forem fornecidas
    const backgroundColors = options.backgroundColors || getRandomColors(counts.length);
    const borderColors = options.borderColors || backgroundColors;

    new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: options.label || 'Respostas',
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: options.borderWidth || 1
            }]
        },
        options: options.chartOptions || {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Função para gerar cores aleatórias
function getRandomColors(numColors) {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const color = '#' + Math.floor(Math.random() * 16777215).toString(16); 
        colors.push(color);
    }
    return colors;
}



function renderWordCloud(data) {
    const chartContainer = document.getElementById('chartContainer');
    const canvas = document.createElement('canvas');
    canvas.id = 'wordCloud';
    canvas.width = 600; 
    canvas.height = 400; 
    chartContainer.innerHTML = ''; 
    chartContainer.appendChild(canvas);

    const wordCounts = contarPalavras(data);
    WordCloud(document.getElementById('wordCloud'), {
        list: wordCounts,
        weightFactor: 10,
        backgroundColor: '#fff',
        fontFamily: 'Roboto',
        color: () => {
            const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    });
}

function contarPalavras(data) {
    const wordCounts = {};
    data.forEach(entry => {
        const words = entry.split(/\s+/);
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
    });
    return Object.entries(wordCounts);
}

function determinarTipoGraficoIA(data) {
    // Verifica se há dados suficientes para determinar o tipo de gráfico
    if (data.length === 0) {
        return null; // Retorna null se não houver dados
    }

    // Verifica se os dados são categóricos
    const isCategorical = data.every(entry => typeof entry === 'string');

    // Conta o número de categorias únicas
    const uniqueCategories = new Set(data);
    const numCategories = uniqueCategories.size;

    
    if (isCategorical && numCategories <= 3) {
        return 'pie'; 
    }

   
    if (isCategorical && numCategories > 3) {
        return 'bar'; 
    }

 
    return null;
}

function agruparRespostas(data) {
    const counts = data.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(counts);
    const countsArray = Object.values(counts);

    return { labels, counts: countsArray };
}

document.getElementById("scrollButton").addEventListener("click", function() {
    window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
    });
});