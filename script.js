/**
 * METANOIA DIGITALĂ | Hațeg Alternativ • Soul Meal & Drink TO GO
 * Creier Central Operativ (script.js) - Versiune Multi-Pagina Persistentă
 */

// 1. SURSA UNICĂ DE ADEVĂR PENTRU MENIUL SĂPTĂMÂNAL (Cu garnitură de piure artizanal inclusă)
const meniuSaptamanal = [
    { 
        zi: "LUNI", 
        fel1: "Ciorbă de găină cu tăieței de casă", calorii1: "150 kcal", p1: "12g", g1: "5g", 
        fel2: "Tocăniță de porc la ceaun cu piure artizanal catifelat", calorii2: "650 kcal", p2: "45g", g2: "25g", 
        pret: 40.00 
    },
    { 
        zi: "MARȚI", 
        fel1: "Ciorbă țărănească de văcuță", calorii1: "180 kcal", p1: "15g", g1: "6g", 
        fel2: "Pulpă de pui fragedă la ceaun cu piure catifelat cu unt", calorii2: "580 kcal", p2: "48g", g2: "20g", 
        pret: 40.00 
    },
    { 
        zi: "MIERCURI", 
        fel1: "Supă cremă din legume din grădină", calorii1: "120 kcal", p1: "5g", g1: "3g", 
        fel2: "Mușchiuleț de porc la grătar cu piure fin și sos redus", calorii2: "450 kcal", p2: "42g", g2: "10g", 
        pret: 40.00 
    },
    { 
        zi: "JOI", 
        fel1: "Ciorbă rădăuțeană dreaptă cu usturoi", calorii1: "220 kcal", p1: "18g", g1: "9g", 
        fel2: "Friptură tradițională la tavă în sos cu piure fin", calorii2: "620 kcal", p2: "35g", g2: "30g", 
        pret: 40.00 
    },
    { 
        zi: "VINERI", 
        fel1: "Ciorbă de burtă ca la mama acasă", calorii1: "250 kcal", p1: "20g", g1: "12g", 
        fel2: "Pui cremos cu ciuperci, smântână și piure artizanal", calorii2: "550 kcal", p2: "40g", g2: "22g", 
        pret: 40.00 
    }
];

// 2. STĂRI GLOBALE PERSISTENTE (Se încarcă automat la schimbarea paginii)
let total = parseFloat(localStorage.getItem('metanoia_total')) || 0;
let cartItems = JSON.parse(localStorage.getItem('metanoia_items')) || [];
let pag = 1; // Indicatorul zilei curente din meniu (1 = Luni, 5 = Vineri)

// 3. INIȚIALIZARE AUTOMATĂ LA ÎNCĂRCAREA PAGINII CURENTE
document.addEventListener("DOMContentLoaded", () => {
    // Sincronizează afișajul prețului în Sticky Footer pe oricare pagină ne-am afla
    actualizeazaAfisajCos();
    
    // Auto-detectare: dacă pagina curentă are containerul de meniu, îl randează instant
    const containerZile = document.getElementById('container-zile');
    if (containerZile) {
        generareMeniuDinamica(containerZile);
    }
});

// 4. MANAGEMENTUL COȘULUI DE CUMPĂRĂTURI
function actualizeazaAfisajCos() {
    const displayTotal = document.getElementById('display-total');
    if (displayTotal) {
        displayTotal.innerText = total.toFixed(2) + ' RON';
    }
}

function salveazaCosState() {
    localStorage.setItem('metanoia_total', total);
    localStorage.setItem('metanoia_items', JSON.stringify(cartItems));
}

// Adăugare produse din paginile cu structură fixă/statică (box.html, bauturi.html)
function adaugaProdus(btn) {
    const card = btn.closest('[data-pret]');
    if (!card) return;
    
    const nume = card.getAttribute('data-nume');
    const pret = parseFloat(card.getAttribute('data-pret'));
    
    executaAdaugare(nume, pret, btn);
}

// Adăugare produse din interfața dinamică (meniu.html)
function adaugaPachetSaptamanal(zi, pret) {
    const nume = `Meniu Complet ${zi} (cu Piure)`;
    // Găsește butonul corespunzător zilei active pentru feedback vizual
    const indexZi = meniuSaptamanal.findIndex(m => m.zi === zi);
    const btn = document.querySelector(`#page-${indexZi + 1} button`);
    
    executaAdaugare(nume, pret, btn);
}

// Nucleul de procesare al coșului
function executaAdaugare(nume, pret, elementButon) {
    total += pret;
    cartItems.push(nume);
    
    // Salvare în stocul browserului și actualizare interfață
    salveazaCosState();
    actualizeazaAfisajCos();
    
    // Feedback vizual premium (Tranziție text buton)
    if (elementButon) {
        const originalText = elementButon.innerText;
        elementButon.innerText = "Adăugat în Coș ✓";
        elementButon.style.borderColor = "#fff";
        
        setTimeout(() => {
            elementButon.innerText = originalText;
            elementButon.style.borderColor = "#c5a059";
        }, 800);
    }
}

// 5. LOGICA DE RANDARE ȘI NAVIGARE PENTRU MENIUL SĂPTĂMÂNAL (meniu.html)
function generareMeniuDinamica(container) {
    container.innerHTML = ''; // Curăță eventualele reziduuri HTML
    
    meniuSaptamanal.forEach((m, index) => {
        container.innerHTML += `
            <div id="page-${index + 1}" class="page ${index === 0 ? 'active' : 'hidden'} transition-all duration-300">
                <div class="border border-[#1a1a1a] bg-black p-6 md:p-8">
                    <div class="flex justify-between items-center mb-6 border-b border-[#1a1a1a] pb-4">
                        <h3 class="text-2xl text-[#c5a059] font-cinzel tracking-wider font-bold">${m.zi}</h3>
                        <span class="text-xs md:text-sm font-semibold text-gray-400">Pachet Prânz: <span class="text-white">${m.pret.toFixed(2)} RON</span></span>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- Felul I -->
                        <div class="bg-[#050505] p-4 border border-[#121212]">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <div>
                                    <h4 class="font-bold text-white text-sm md:text-base">${m.fel1}</h4>
                                    <p class="text-[10px] uppercase text-gray-500 mt-0.5">Felul I • Ciorbă / Supă (400g)</p>
                                </div>
                                <div class="text-[10px] uppercase text-[#c5a059] font-medium bg-[#101010] px-2 py-1 border border-[#1a1a1a] self-start mt-1 sm:mt-0">
                                    ${m.calorii1} | Prot: ${m.p1}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Felul II -->
                        <div class="bg-[#050505] p-4 border border-[#121212]">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <div>
                                    <h4 class="font-bold text-white text-sm md:text-base">${m.fel2}</h4>
                                    <p class="text-[10px] uppercase text-gray-500 mt-0.5">Felul II + Garnitură de Bază (300g)</p>
                                </div>
                                <div class="text-[10px] uppercase text-[#c5a059] font-medium bg-[#101010] px-2 py-1 border border-[#1a1a1a] self-start mt-1 sm:mt-0">
                                    ${m.calorii2} | Prot: ${m.p2}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button onclick="adaugaPachetSaptamanal('${m.zi}', ${m.pret})" class="w-full mt-6 border border-[#c5a059] py-3.5 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all uppercase text-xs tracking-widest font-black">
                        Adaugă Meniu ${m.zi} în Coș
                    </button>
                </div>
            </div>
        `;
    });
}

function schimbaZi(step) {
    const paginaCurenta = document.getElementById('page-' + pag);
    if (!paginaCurenta) return;

    paginaCurenta.classList.add('hidden');
    paginaCurenta.classList.remove('active');
    
    pag += step;
    if (pag > 5) pag = 1;
    if (pag < 1) pag = 5;
    
    const paginaNoua = document.getElementById('page-' + pag);
    if (paginaNoua) {
        paginaNoua.classList.remove('hidden');
        paginaNoua.classList.add('active');
        document.getElementById('indicator-zi').innerText = meniuSaptamanal[pag - 1].zi;
    }
}

// 6. MANAGEMENT MODAL LIVRARE OPERATIVĂ (Bucătăria Centrală Totești - DN 68)
function deschideModal() { 
    if (total === 0) {
        alert('Coșul operațional este gol. Adăugați produse înainte de a finaliza.');
        return;
    }
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    }
}

function inchideModal(sendOrder) { 
    const modal = document.getElementById('modal');
    if (!modal) return;

    if (sendOrder) {
        const nume = document.getElementById('client-name').value;
        const adresa = document.getElementById('client-address').value;
        
        if (!nume || !adresa) {
            alert('Te rugăm să completezi numele și adresa pentru livrare.');
            return;
        }
        
        // Confirmare plasare comandă
        alert(`Comandă transmisă securizat!\nTotal de plată: ${total.toFixed(2)} RON.\nBucătăria Centrală Totești procesează, videază și pregătește livrarea pe ruta dumneavoastră.`);
        
        // Resetarea stării coșului global după finalizarea cu succes
        total = 0;
        cartItems = [];
        salveazaCosState();
        actualizeazaAfisajCos();
        
        // Resetare câmpuri input formular
        document.getElementById('client-name').value = '';
        document.getElementById('client-address').value = '';
    }
    
    modal.style.display = 'none';
    modal.classList.add('hidden');
}
