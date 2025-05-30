document.addEventListener('DOMContentLoaded', function() {
    fetchCDIAtual();
    showSection('calcularSection');
    prevenirValoresNegativos();
    
    document.getElementById("btnCalcular").addEventListener("click", function() {
        showSection("calcularSection");
    });
    
    document.getElementById("btnComparar").addEventListener("click", function() {
        showSection("compararSection");
    });

    // Adiciona listeners para os campos do formulário
    const calcularInputs = [
        'valorInvestido', 'tipoTaxa', 'taxa', 'cdiAtual', 'percentualRendimento',
        'tempo', 'periodo', 'ir'
    ];
    
    calcularInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', atualizarResultados);
            element.addEventListener('change', atualizarResultados);
        }
    });
});

function prevenirValoresNegativos() {
    const inputsNumericos = document.querySelectorAll('input[type="number"]');
    
    inputsNumericos.forEach(input => {
        input.addEventListener('input', function(e) {
            if (this.value < 0) {
                this.value = 0;
            }
        });
        
        input.addEventListener('change', function(e) {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
}

function fetchCDIAtual() {
    const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados?formato=json';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const ultimoCDI = data[data.length - 1];
            const valorCDI = parseFloat(ultimoCDI.valor);

            const cdiInput = document.getElementById('cdiAtual');
            if (cdiInput) cdiInput.value = valorCDI.toFixed(2);
            
            const cdiInput1 = document.getElementById('cdiAtual1');
            if (cdiInput1) cdiInput1.value = valorCDI.toFixed(2);
            
            const cdiInput2 = document.getElementById('cdiAtual2');
            if (cdiInput2) cdiInput2.value = valorCDI.toFixed(2);
            
            // Atualiza os resultados após buscar o CDI
            atualizarResultados();
        })
        .catch(error => {
            console.error('Erro ao buscar CDI:', error);
        });
}

function atualizarResultados() {
    const valorInvestido = parseFloat(document.getElementById("valorInvestido").value) || 0;
    const tipoTaxa = document.getElementById("tipoTaxa").value;
    const tempo = parseFloat(document.getElementById("tempo").value) || 0;
    const periodo = document.getElementById("periodo").value;
    const incidenciaIR = parseFloat(document.getElementById("ir").value) || 0;
    
    if (valorInvestido <= 0 || tempo <= 0) {
        return; // Não calcula se valores essenciais não foram informados
    }
    
    // Converter o tempo para anos
    let tempoEmAnos = tempo;
    if (periodo === "meses") {
        tempoEmAnos = tempo / 12;
    } else if (periodo === "dias") {
        tempoEmAnos = tempo / 365;
    }
    
    let taxaAnual;
    if (tipoTaxa === "cdi") {
        const cdiAtual = parseFloat(document.getElementById("cdiAtual").value) || 0;
        const percentualRendimento = parseFloat(document.getElementById("percentualRendimento").value) || 0;
        taxaAnual = cdiAtual * (percentualRendimento / 100);
    } else {
        taxaAnual = parseFloat(document.getElementById("taxa").value) || 0;
    }
    
    // Cálculo do montante bruto (juros compostos)
    const montanteBruto = valorInvestido * Math.pow(1 + (taxaAnual / 100), tempoEmAnos);
    const lucroBruto = montanteBruto - valorInvestido;
    
    // Cálculo do IR
    const ir = lucroBruto * (incidenciaIR / 100);
    const montanteLiquido = montanteBruto - ir;
    const lucroLiquido = montanteLiquido - valorInvestido;
    
    // Cálculo da rentabilidade percentual
    const rentabilidade = ((montanteLiquido - valorInvestido) / valorInvestido) * 100;
    
    // Atualiza a interface
    document.getElementById("resValorInvestido").textContent = `R$ ${valorInvestido.toFixed(2)}`;
    document.getElementById("resRendimentoBruto").textContent = `R$ ${lucroBruto.toFixed(2)}`;
    document.getElementById("resRendimentoLiquido").textContent = `R$ ${lucroLiquido.toFixed(2)}`;
    document.getElementById("resValorTotal").textContent = `R$ ${montanteLiquido.toFixed(2)}`;
    document.getElementById("resRentabilidade").textContent = `${rentabilidade.toFixed(2)}%`;
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) sectionToShow.classList.remove('hidden');
}

function toggleCDI(section, index = null) {
    let tipo, cdiGroup, taxaGroup, rendimentoGroup;

    if (section === "calcular") {
        tipo = document.getElementById("tipoTaxa").value;
        cdiGroup = document.getElementById("cdiGroupCalcular");
        taxaGroup = document.getElementById("taxaGroupCalcular");
        rendimentoGroup = document.getElementById("rendimentoGroupCalcular");
    } else {
        tipo = document.getElementById(`tipoTaxa${index}`).value;
        cdiGroup = document.getElementById(`cdiGroup${index}`);
        taxaGroup = document.getElementById(`taxaGroup${index}`);
        rendimentoGroup = document.getElementById(`rendimentoGroupCalcular${index}`);
    }

    cdiGroup.classList.toggle("hidden", tipo !== "cdi");
    taxaGroup.classList.toggle("hidden", tipo !== "fixa");
    rendimentoGroup.classList.toggle("hidden", tipo !== "cdi");

    if (tipo === "cdi") {
        if (section === "calcular") {
            document.getElementById("percentualRendimento").disabled = false;
        } else {
            document.getElementById(`percentualRendimento${index}`).disabled = false;
        }
    }
    
    if (section === "calcular") {
        atualizarResultados();
    }
}

function calcularRentabilidade() {
    // Esta função agora é redundante, mas mantida para compatibilidade
    atualizarResultados();
}

function compararRentabilidade() {
    let investimentos = [];

    for (let i = 1; i <= 2; i++) {
        const tipoTaxa = document.getElementById(`tipoTaxa${i}`).value;
        const valor = parseFloat(document.getElementById(`valor${i}`).value) || 0;
        const tempo = parseFloat(document.getElementById(`tempo${i}`).value) || 0;
        const periodo = document.getElementById(`periodo${i}`).value;
        const ir = parseFloat(document.getElementById(`ir${i}`).value) || 0;
        
        // Converter o tempo para anos
        let tempoEmAnos = tempo;
        if (periodo === "meses") {
            tempoEmAnos = tempo / 12;
        } else if (periodo === "dias") {
            tempoEmAnos = tempo / 365;
        }

        let investimento = {
            valor: valor,
            tempo: tempoEmAnos,
            ir: ir
        };

        if (tipoTaxa === "cdi") {
            const cdiAtual = parseFloat(document.getElementById(`cdiAtual${i}`).value) || 0;
            const percentualRendimento = parseFloat(document.getElementById(`percentualRendimento${i}`).value) || 0;
            investimento.cdi = cdiAtual;
            investimento.percentual_rendimento = percentualRendimento;
        } else {
            const taxa = parseFloat(document.getElementById(`taxa${i}`).value) || 0;
            investimento.taxa = taxa;
        }

        investimentos.push(investimento);
    }

    fetch("http://127.0.0.1:5000/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investimentos })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Erro desconhecido'); });
        }
        return response.json();
    })
    .then(data => {
        let resultado = `<div class="row">`;
        data.resultados.forEach((invest, index) => {
            resultado += `
                <div class="col-md-6">
                    <h4>Investimento ${index + 1}</h4>
                    <p><strong>Montante Bruto:</strong> R$ ${invest.montante_bruto.toFixed(2)}</p>
                    <p><strong>Lucro Bruto:</strong> R$ ${invest.lucro_bruto.toFixed(2)}</p>
                    <p><strong>Imposto de Renda:</strong> R$ ${invest.ir.toFixed(2)}</p>
                    <p><strong>Montante Líquido:</strong> R$ ${invest.montante_liquido.toFixed(2)}</p>
                </div>
            `;
        });
        resultado += `</div>`;
        document.getElementById("modalBody").innerHTML = resultado;
        new bootstrap.Modal(document.getElementById('resultModal')).show();
    })
    .catch(error => {
        const modalBody = document.getElementById("modalBody");
        modalBody.innerHTML = `<div class="alert alert-danger">Erro: ${error.message}</div>`;
        new bootstrap.Modal(document.getElementById('resultModal')).show();
    });
}